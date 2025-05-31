import { NextRequest, NextResponse } from "next/server";
import { parseJobDescription } from "@/lib/parseJobDescription";
import { parseResume } from "@/lib/parseResume";
import { analyzeContent } from "@/lib/analyzeContent";
import { ParsedContent } from "@/types";

export async function POST(req: NextRequest) {
  const { jobDescription, resumeContent } = await req.json();

  if (!jobDescription || !resumeContent) {
    return NextResponse.json(
      { error: "Missing job description or resume content" },
      { status: 400 }
    );
  }

  try {
    const structuredJD: ParsedContent = await parseJobDescription(
      jobDescription
    );
    const structuredResume: ParsedContent = await parseResume(resumeContent);

    const comparisonResult = await analyzeContent(
      structuredJD,
      structuredResume,
      jobDescription,
      resumeContent
    );

    return NextResponse.json({ result: comparisonResult });
  } catch (error: any) {
    console.error("Error during full analysis workflow:", error);
    if (error.message.includes("Failed to parse JSON")) {
      return NextResponse.json(
        {
          error:
            "AI returned invalid data during parsing or analysis. Please try again.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process analysis. " + error.message },
      { status: 500 }
    );
  }
}
