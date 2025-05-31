// ---- AI Analysis Result Type ----
export interface AnalysisResponse {
  matchScore: number;
  matchedSkills: {
    technical: string[];
    soft: string[];
  };
  missingSkills: {
    technical: string[];
    soft: string[];
  };
  suggestions: string[];
  analysisSummary: string;
}

// ---- Analysis Request Type ----
export interface AnalysisRequest {
  jobDescription: string;
  resumeContent: string;
}

export interface ParsedContent {
  hardSkills: string[];
  softSkills: string[];
  tools: string[];
  certifications: string[];
  education: string[];
  jobTitles: string[];

  workExperience?: string[];
  projects?: string[];
  achievements?: string[];
}
