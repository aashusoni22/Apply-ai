import { ParsedContent, AnalysisResponse } from "@/types";
import { openai } from "@/lib/openai";

export async function analyzeContent(
  structuredJD: ParsedContent,
  structuredResume: ParsedContent,
  originalJobDescription: string,
  originalResumeContent: string
): Promise<AnalysisResponse> {
  const combinedInput = {
    jobDescriptionRequirements: structuredJD,
    userResumeCapabilities: structuredResume,
  };

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an expert AI Job Application Assistant, performing a highly accurate and comprehensive comparison between a job description's requirements and a candidate's resume.
          Your task is to identify matched and missing skills (both technical and soft) based *strictly* on the job description's needs and the resume's stated abilities.
          Generate actionable suggestions to bridge the identified gaps.

          **Respond ONLY with a valid JSON object in the following format:**

          {
            "matchScore": number, // Overall percentage match (0-100), weighted towards critical JD requirements.
            "matchedSkills": {
              "technical": string[], // Technical skills *from the JD* found in the resume.
              "soft": string[]       // Soft skills *from the JD* found in the resume.
            },
            "missingSkills": {
              "technical": string[], // Technical skills *from the JD* NOT found in the resume.
              "soft": string[]       // Soft skills *from the JD* NOT found in the resume.
            },
            "suggestions": string[], // AI-generated resume bullet points *to address missing skills identified from the JD*.
            "analysisSummary": string // A concise, 1-2 sentence summary of the overall match and key areas for improvement.
          }

          **Strict Instructions for Analysis:**

          1.  **Job Description as Primary Source for Requirements:**
              * All skills (technical and soft) in 'matchedSkills' and 'missingSkills' MUST originate from the **jobDescriptionRequirements** provided below. Do NOT introduce skills not mentioned or strongly implied by the JD.
              * Consider not just 'hardSkills' and 'softSkills' from the JD input, but also skills implied by 'tools', 'certifications', 'education', and 'jobTitles' from the JD.

          2.  **Resume as Source for Capabilities:**
              * Compare each identified JD skill against the **userResumeCapabilities** and the **original resume content**.
              * A skill is 'matched' only if there is clear evidence (direct mention, strong synonym, or contextual proof) in the resume. Do not infer without strong textual basis.
              * Consider skills across all resume categories: 'hardSkills', 'softSkills', 'tools', 'certifications', 'education', 'jobTitles', 'workExperience', 'projects', and 'achievements'.

          3.  **Skill Categorization:** Maintain the 'technical' and 'soft' categorization. For ambiguities, prioritize technical.

          4.  **Match Score Calculation:**
              * Calculate the 'matchScore' (0-100%). Give higher weighting to skills explicitly stated in the JD and those appearing in 'hardSkills' or 'tools'.
              * Consider the total number of *distinct* essential skills from the JD that are matched.

          5.  **Suggestions:**
              * For each significant skill listed in 'missingSkills' (both technical and soft), generate 1-2 concise, professional resume bullet points.
              * Suggestions should be actionable, start with an action verb, and encourage quantification (e.g., "Developed scalable APIs using [missing skill]" or "Led cross-functional teams, applying [missing skill] principles").
              * **Crucially: Suggestions should ONLY address skills that are missing from the JD's requirements.** Do not provide generic resume advice or suggest skills not relevant to *this specific job*.

          6.  **Analysis Summary:** Provide a brief summary of the match, highlighting overall alignment and primary areas of strength/weakness, derived *only* from the comparison.

          7.  **Purity and Conciseness:**
              * Ensure all arrays are clean strings.
              * Do NOT include any explanatory text or prose outside the JSON.
              * If a category is empty, the array should be empty.`,
      },
      {
        role: "user",
        content: `Here are the parsed requirements from the Job Description and the parsed capabilities from the User's Resume. Also, the original full texts are provided for context.

          Job Description Requirements (Parsed JSON):
          ${JSON.stringify(structuredJD, null, 2)}

          User Resume Capabilities (Parsed JSON):
          ${JSON.stringify(structuredResume, null, 2)}

          ---
          Original Job Description (for context):
          ${originalJobDescription}
          ---
          Original Resume Content (for context):
          ${originalResumeContent}
          ---
          `,
      },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0].message?.content;
  if (!content) {
    throw new Error("No content received from OpenAI for analysis.");
  }

  try {
    return JSON.parse(content) as AnalysisResponse;
  } catch (e) {
    console.error("Failed to parse JSON from analysis:", content, e);
    throw new Error("Invalid JSON received from OpenAI for analysis.");
  }
}
