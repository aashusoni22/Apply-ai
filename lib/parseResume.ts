import { ParsedContent } from "@/types";
import { openai } from "@/lib/openai";

export async function parseResume(
  resumeContent: string
): Promise<ParsedContent> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert parser for resumes.
          Extract and categorize key information into a JSON object.
          **Strictly adhere to the following keys and data types:**
          - "hardSkills": string[] (e.g., "Python", "React", "AWS Lambda", "Data Structures")
          - "softSkills": string[] (e.g., "Communication", "Teamwork", "Problem-solving", "Leadership")
          - "tools": string[] (e.g., "Docker", "Kubernetes", "Jira", "Figma")
          - "certifications": string[] (e.g., "AWS Certified Developer", "PMP")
          - "education": string[] (e.g., "Bachelor's Degree in Computer Science", "MBA")
          - "jobTitles": string[] (e.g., "Software Engineer", "Product Manager", "Consultant")
          - "workExperience": string[] (key achievements/responsibilities from roles, summarized as bullet points, e.g., "Developed scalable APIs that handled 1M requests/day.")
          - "projects": string[] (summaries of personal or professional projects, e.g., "Built a full-stack e-commerce platform using Next.js and Stripe.")
          - "achievements": string[] (quantifiable accomplishments not tied to specific roles, e.g., "Reduced cloud costs by 15% through optimization.")

          **Normalization Rules:**
          - List items as distinct strings in arrays.
          - Use common, professional terminology.
          - If a category is not found, use an empty array for that key.
          - **Respond ONLY with the JSON object. Do not include any other text or formatting.**`,
      },
      {
        role: "user",
        content: `Please parse the following resume content:\n\n${resumeContent}`,
      },
    ],
    temperature: 0.0,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI for resume parsing.");
  }

  try {
    return JSON.parse(content) as ParsedContent;
  } catch (e) {
    console.error("Failed to parse JSON from resume parsing:", content, e);
    throw new Error("Invalid JSON received from OpenAI for resume parsing.");
  }
}
