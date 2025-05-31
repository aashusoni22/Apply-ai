# 🤖 ApplyAI - AI Job Application Assistant

[![Live Demo](https://img.shields.io/badge/Live_Demo-FF5722?style=for-the-badge&logo=vercel)](https://apply-ai-nine.vercel.app/)

A powerful Next.js application that uses AI to analyze resumes against job descriptions, providing intelligent insights and suggestions to help job seekers optimize their applications.

## ⚡ Features

- **Smart Resume Analysis**: AI-powered comparison between your resume and job descriptions
- **PDF Resume Upload**: Automatically extract text from PDF resumes using OpenAI Assistants API
- **Skill Matching**: Identifies both matched and missing technical and soft skills
- **Match Scoring**: Provides an overall compatibility score with detailed breakdown
- **AI Suggestions**: Get personalized recommendations to improve your resume
- **Modern UI**: Beautiful, responsive interface with animations and real-time feedback
- **File Support**: Upload PDF or TXT files, or paste content directly

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **AI Integration**: OpenAI GPT-4 and Assistants API
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **File Handling**: React Dropzone

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── analyze/           # Main analysis endpoint
│   │   └── parse-resume/      # PDF parsing endpoint
│   ├── layout.tsx
│   └── page.tsx              # Main application interface
├── lib/
│   ├── analyzeContent.ts     # Core analysis logic
│   ├── parseJobDescription.ts # Job description parsing
│   └── parseResume.ts        # Resume content parsing
├── types/
│   └── index.ts              # TypeScript type definitions
└── components/               # React components
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- OpenAI API key with access to GPT-4 and Assistants API

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ai-job-application-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1. **Enter Job Description**: Paste the job posting you're interested in
2. **Upload Your Resume**:
   - Drag & drop a PDF or TXT file, or
   - Paste your resume content directly
3. **Click "Analyze Resume"**: Get AI-powered insights within seconds
4. **Review Results**:
   - Overall match score and analysis summary
   - Matched skills (technical and soft)
   - Missing skills you should consider adding
   - Personalized suggestions for improvement

## 🔧 API Endpoints

### `/api/analyze` (POST)

Main analysis endpoint that processes job descriptions and resumes.

**Request Body:**

```json
{
  "jobDescription": "string",
  "resumeContent": "string"
}
```

**Response:**

```json
{
  "result": {
    "matchScore": number,
    "analysisSummary": "string",
    "matchedSkills": {
      "technical": ["skill1", "skill2"],
      "soft": ["skill1", "skill2"]
    },
    "missingSkills": {
      "technical": ["skill1", "skill2"],
      "soft": ["skill1", "skill2"]
    },
    "suggestions": ["suggestion1", "suggestion2"]
  }
}
```

### `/api/parse-resume` (POST)

PDF parsing endpoint using OpenAI Assistants API.

**Request**: FormData with PDF file
**Response**: Extracted text content with metadata

## 🎨 Features in Detail

### AI-Powered Analysis

- Uses GPT-4 for intelligent content parsing and comparison
- Extracts skills, experience, and qualifications from both documents
- Provides contextual analysis beyond simple keyword matching

### PDF Processing

- Leverages OpenAI Assistants API for accurate text extraction
- Handles various PDF formats and layouts
- Fallback options for image-based or complex PDFs

### User Experience

- Real-time toast notifications for user feedback
- Drag-and-drop file upload with visual feedback
- Responsive design that works on all devices
- Smooth animations and transitions

### Error Handling

- Comprehensive error handling for API failures
- User-friendly error messages
- Graceful degradation when services are unavailable

## ⚙️ Configuration

### OpenAI Settings

The application uses GPT-4 for analysis and the Assistants API for PDF processing. Make sure your API key has access to both services.

### File Limits

- Maximum file size: 10MB
- Supported formats: PDF, TXT
- Processing timeout: 30 seconds

## 🔒 Privacy & Security

- Files are temporarily uploaded to OpenAI for processing
- No data is stored permanently on servers
- All file uploads are automatically cleaned up after processing
- Resume content remains in your browser session only

## 🚨 Error Handling

The application handles various error scenarios:

- **API Quota Exceeded**: Clear messaging when OpenAI limits are reached
- **Invalid PDF Format**: Guidance for unsupported file types
- **Processing Timeouts**: Fallback options for slow processing
- **Network Issues**: Retry mechanisms and user guidance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check that your OpenAI API key is valid and has sufficient quota
2. Ensure you're using a supported file format
3. Try refreshing the page and starting over
4. Check the browser console for detailed error messages

## 🔮 Future Enhancements

- Support for additional file formats (DOCX, etc.)
- Cover letter analysis and suggestions
- Job application tracking
- Resume template generation
- Multi-language support
- Interview preparation based on analysis

---

Built with ❤️ using Next.js and OpenAI
