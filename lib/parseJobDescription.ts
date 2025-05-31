import { ParsedContent } from "@/types";
import { openai } from "@/lib/openai";

export async function parseJobDescription(
  jobDescription: string
): Promise<ParsedContent> {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert parser for job descriptions.
          Extract and categorize key information into a JSON object.
          **Strictly adhere to the following keys and data types:**
          - "hardSkills": string[] (e.g., "Python", "React", "AWS Lambda", "Data Structures")
          - "softSkills": string[] (e.g., "Communication", "Teamwork", "Problem-solving", "Leadership")
          - "tools": string[] (e.g., "Docker", "Kubernetes", "Jira", "Figma")
          - "certifications": string[] (e.g., "AWS Certified Developer", "PMP")
          - "education": string[] (e.g., "Bachelor's Degree", "PhD in Computer Science")
          - "jobTitles": string[] (common titles for the role, e.g., "Software Engineer", "Senior Developer")

          **Normalization Rules:**
          - List items as distinct strings in arrays.
          - Use common, professional terminology.
          - If a category is not found or explicitly mentioned, use an empty array for that key.
          - **Respond ONLY with the JSON object. Do not include any other text or formatting.**`,
      },
      {
        role: "user",
        content: `Please parse the following job description:\n\n${jobDescription}`,
      },
    ],
    temperature: 0.0,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI for JD parsing.");
  }

  try {
    return JSON.parse(content) as ParsedContent;
  } catch (e) {
    console.error("Failed to parse JSON from JD parsing:", content, e);
    throw new Error("Invalid JSON received from OpenAI for JD parsing.");
  }
}
