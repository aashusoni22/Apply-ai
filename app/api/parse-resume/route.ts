import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    console.log(
      `Processing PDF with OpenAI Assistants: ${file.name}, Size: ${file.size} bytes`
    );

    try {
      // Convert File to format that OpenAI accepts
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileForUpload = new File([buffer], file.name, { type: file.type });

      // Upload file to OpenAI
      const uploadedFile = await openai.files.create({
        file: fileForUpload,
        purpose: "assistants",
      });

      console.log(`File uploaded to OpenAI: ${uploadedFile.id}`);

      // Create a thread
      const thread = await openai.beta.threads.create();

      // Add message to the thread
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content:
          "Please extract all the text content from this PDF resume. Return only the extracted text in a clean, readable format. Preserve the structure with proper line breaks and spacing. Do not add any commentary, explanations, or formatting instructions - just return the raw text content.",
        attachments: [
          {
            file_id: uploadedFile.id,
            tools: [{ type: "file_search" }],
          },
        ],
      });

      // Create or get assistant
      const assistant = await openai.beta.assistants.create({
        name: "Resume Text Extractor",
        instructions:
          "You are a text extraction specialist. Your job is to extract all text from PDF documents cleanly and accurately. Return only the extracted text content without any additional commentary, formatting instructions, or explanations. Preserve the original structure and spacing of the document.",
        model: "gpt-4o",
        tools: [{ type: "file_search" }],
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id,
      });

      // Poll for completion
      let runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (
        (runStatus.status === "in_progress" || runStatus.status === "queued") &&
        attempts < maxAttempts
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        attempts++;
        console.log(
          `Assistant status: ${runStatus.status}, attempt: ${attempts}`
        );
      }

      if (runStatus.status === "completed") {
        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find(
          (msg) => msg.role === "assistant"
        );

        if (assistantMessage && assistantMessage.content[0]?.type === "text") {
          const extractedText = assistantMessage.content[0].text.value.trim();

          // Clean up the extracted text
          const cleanedText = cleanExtractedText(extractedText);

          if (!cleanedText || cleanedText.length < 50) {
            return NextResponse.json(
              {
                error: `Only ${
                  cleanedText?.length || 0
                } characters were extracted. The PDF might be image-based or have formatting issues.`,
                extractedText: cleanedText || "",
                isPartialExtraction: true,
              },
              { status: 200 }
            );
          }

          console.log(
            `Successfully extracted ${cleanedText.length} characters using OpenAI Assistants`
          );

          // Cleanup: Delete the uploaded file and assistant
          try {
            await openai.files.del(uploadedFile.id);
            await openai.beta.assistants.del(assistant.id);
          } catch (cleanupError) {
            console.warn("Cleanup warning:", cleanupError);
          }

          return NextResponse.json({
            text: cleanedText,
            fileName: file.name,
            fileSize: file.size,
            extractionMethod: "openai-assistants",
            success: true,
          });
        }
      } else if (runStatus.status === "failed") {
        console.error("Assistant run failed:", runStatus.last_error);
        throw new Error(
          `Assistant processing failed: ${
            runStatus.last_error?.message || "Unknown error"
          }`
        );
      } else {
        throw new Error(
          `Assistant processing timeout. Status: ${runStatus.status}`
        );
      }

      throw new Error("No response from assistant");
    } catch (openaiError: any) {
      console.error("OpenAI extraction error:", openaiError);

      // Handle specific OpenAI errors
      if (
        openaiError.status === 429 ||
        openaiError.code === "insufficient_quota"
      ) {
        return NextResponse.json(
          {
            error:
              "OpenAI API quota exceeded. Please try again later or contact support.",
          },
          { status: 429 }
        );
      }

      if (
        openaiError.status === 400 ||
        openaiError.code === "invalid_request_error"
      ) {
        return NextResponse.json(
          {
            error:
              "The PDF format is not supported or the file is corrupted. Please try a different PDF or paste your resume text manually.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Failed to extract text using AI. Please try pasting your resume content manually.",
          debug:
            process.env.NODE_ENV === "development"
              ? openaiError.message
              : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("PDF processing error:", error);

    return NextResponse.json(
      {
        error:
          "Failed to process PDF file. Please try again or paste your resume text manually.",
        debug:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// Helper function to clean and normalize extracted text
function cleanExtractedText(text: string): string {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove control characters except newlines and tabs
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Remove excessive newlines but keep paragraph structure
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim()
  );
}
