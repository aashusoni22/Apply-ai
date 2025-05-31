"use client";

import { AnalysisResponse } from "@/types";
import {
  CheckCircle,
  CircleAlert,
  CircleCheckBig,
  TrendingUp,
  Pickaxe,
  UserSquare,
  RotateCcw,
  WandSparkles,
  Zap,
  Upload,
  FileText,
  X,
  Loader2,
  CircleFadingArrowUp,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

const Toast = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) => {
  const getToastIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle size={20} className="text-green-400" />;
      case "error":
        return <CircleAlert size={20} className="text-red-400" />;
      case "warning":
        return <AlertTriangle size={20} className="text-yellow-400" />;
      case "info":
        return <Info size={20} className="text-blue-400" />;
      default:
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getToastColors = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-900/90 border-green-500/50 shadow-green-500/20";
      case "error":
        return "bg-red-900/90 border-red-500/50 shadow-red-500/20";
      case "warning":
        return "bg-yellow-900/90 border-yellow-500/50 shadow-yellow-500/20";
      case "info":
        return "bg-blue-900/90 border-blue-500/50 shadow-blue-500/20";
      default:
        return "bg-gray-900/90 border-gray-500/50 shadow-gray-500/20";
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.3 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
      className={`relative w-full max-w-sm sm:w-80 p-4 rounded-xl backdrop-blur-md border shadow-xl ${getToastColors()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getToastIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1">
            {toast.title}
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/10 rounded-md"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-1 rounded-b-xl ${
          toast.type === "success"
            ? "bg-green-400"
            : toast.type === "error"
            ? "bg-red-400"
            : toast.type === "warning"
            ? "bg-yellow-400"
            : "bg-blue-400"
        }`}
      />
    </motion.div>
  );
};

const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) => {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const HomePage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeContent, setResumeContent] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfUploading, setIsPdfUploading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast["type"], title: string, message: string) => {
    const newToast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobDescription, resumeContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze resume.");
      }

      const data = await response.json();
      setAnalysisResult(data.result as AnalysisResponse);
      addToast(
        "success",
        "Analysis Complete!",
        "Your resume has been successfully analyzed."
      );
    } catch (err: any) {
      console.error("Error analyzing resume:", err);
      addToast(
        "error",
        "Analysis Failed",
        err.message ||
          "An unexpected error occurred while analyzing the resume."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setJobDescription("");
    setResumeContent("");
    setUploadedFileName("");
    setAnalysisResult(null);
    addToast(
      "info",
      "Reset Complete",
      "All fields have been cleared. You can start fresh!"
    );
  };

  const handlePdfUpload = async (file: File) => {
    setIsPdfUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Success case
        if (data.success && data.text && data.text.length > 0) {
          setResumeContent(data.text);
          setUploadedFileName(data.fileName);

          // Show success message
          const successMsg =
            data.extractionMethod === "openai"
              ? `PDF processed successfully using AI! Extracted ${data.text.length} characters.`
              : `PDF processed successfully! Extracted ${data.text.length} characters.`;

          addToast("success", "PDF Uploaded!", successMsg);
        } else {
          throw new Error(data.error || "Unknown error occurred");
        }
      } else {
        // Handle different types of errors
        if (response.status === 429) {
          setUploadedFileName(file.name);
          addToast(
            "warning",
            "API Quota Exceeded",
            "OpenAI API quota exceeded. Please try again later, or manually copy and paste your resume content below."
          );
        } else if (data.isImageBased) {
          setUploadedFileName(file.name);
          addToast(
            "warning",
            "Image-based PDF Detected",
            `${data.error}\n\nTip: Try using a different PDF or manually copy and paste your resume content below.`
          );
        } else if (data.isPartialExtraction && data.extractedText) {
          // Partial extraction - let user decide
          setResumeContent(data.extractedText);
          setUploadedFileName(file.name);
          addToast(
            "warning",
            "Partial Extraction",
            `${data.error}\n\nThe extracted text has been loaded below. Please review and edit as needed.`
          );
        } else {
          setUploadedFileName(file.name);
          addToast(
            "error",
            "PDF Processing Failed",
            `${data.error}\n\nPlease copy and paste your resume text manually in the text area below.`
          );
        }
      }
    } catch (error: any) {
      console.error("PDF upload error:", error);
      setUploadedFileName(file.name);
      addToast(
        "error",
        "Upload Failed",
        `Failed to process PDF: ${error.message}\n\nPlease copy and paste your resume text manually in the text area below.`
      );
    } finally {
      setIsPdfUploading(false);
    }
  };

  const matchScoreDisplay = (score: number) => {
    let icon = <CircleAlert size={20} className="text-red-500" />;
    let text = "Poor Match";
    let textColor = "text-rose-500";

    if (score >= 80) {
      icon = <CircleCheckBig size={20} className="text-green-500" />;
      text = "Strong Match";
      textColor = "text-green-500";
    } else if (score >= 60) {
      icon = <TrendingUp size={20} className="text-yellow-500" />;
      text = "Good Match";
      textColor = "text-yellow-500";
    } else {
      icon = <CircleFadingArrowUp size={20} className="text-yellow-500" />;
      text = "Good Match";
      textColor = "text-yellow-500";
    }

    return (
      <div className="flex items-center gap-2">
        {icon}
        <p className={`font-semibold ${textColor}`}>{text}</p>
      </div>
    );
  };

  const SkillPill = ({
    skill,
    type,
  }: {
    skill: string;
    type: "matched" | "missing";
  }) => {
    const colors = {
      matched: {
        bg: "bg-green-700/30",
        border: "border-green-600",
        text: "text-green-300",
      },
      missing: {
        bg: "bg-red-700/30",
        border: "border-red-600",
        text: "text-red-300",
      },
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[type].bg} ${colors[type].border} ${colors[type].text} transition-all duration-200 hover:scale-105`}
      >
        {skill}
      </span>
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file.type === "application/pdf") {
      handlePdfUpload(file);
    } else if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        setResumeContent(text);
        setUploadedFileName(file.name);
        addToast(
          "success",
          "File Uploaded!",
          `Successfully loaded ${file.name}`
        );
      };
      reader.readAsText(file);
    } else {
      addToast(
        "error",
        "Invalid File Type",
        "Only PDF and TXT files are supported"
      );
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const clearUploadedFile = () => {
    setResumeContent("");
    setUploadedFileName("");
    addToast("info", "File Cleared", "Resume content has been cleared");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 text-gray-100 flex flex-col items-center px-6 py-6 sm:p-6">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <header className="text-center mt-2 mb-8 sm:mb-12 relative z-10 px-2">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4 leading-tight">
            AI Job Application Assistant
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed px-4">
            Get smart, AI-powered insights by comparing your resume against job
            descriptions to identify key matches, skill gaps, and actionable
            suggestions.
          </p>
        </motion.div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full max-w-7xl relative z-10">
        {/* Job Description */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2">
            <div className="p-2 bg-indigo-600/20 rounded-lg">
              <Pickaxe size={20} className="text-indigo-400" />
            </div>
            Job Description
          </h2>
          <textarea
            className="w-full min-h-[300px] sm:min-h-[400px] lg:min-h-[415px] h-[300px] sm:h-[400px] lg:h-[415px] p-3 sm:p-4 rounded-xl bg-gray-900/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-200 placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </motion.div>

        {/* Resume */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-300"
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <UserSquare size={20} className="text-green-400" />
            </div>
            Your Resume
          </h2>

          {/* File Dropzone */}
          <div
            {...getRootProps()}
            className={`w-full h-28 sm:h-36 flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 mb-4 ${
              isDragActive
                ? "border-green-400 bg-green-900/20 scale-102 shadow-lg shadow-green-500/20"
                : "border-gray-600 hover:border-green-500 hover:bg-gray-700/30 hover:shadow-lg"
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center px-4">
              {isPdfUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 size={24} className="text-green-400 animate-spin" />
                  <p className="text-green-400 font-medium text-sm sm:text-base">
                    Processing PDF...
                  </p>
                </div>
              ) : isDragActive ? (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-green-400" />
                  <p className="text-green-400 font-medium text-sm sm:text-base">
                    Drop your resume file here...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-gray-400" />
                  <p className="text-gray-300 font-medium text-sm sm:text-base">
                    Drag & drop your resume
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    PDF or TXT files (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Uploaded File Display */}
          <AnimatePresence>
            {uploadedFileName && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-900/30 border border-green-600/50 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText
                    size={16}
                    className="text-green-400 flex-shrink-0"
                  />
                  <span className="text-green-300 text-sm font-medium truncate">
                    {uploadedFileName}
                  </span>
                </div>
                <button
                  onClick={clearUploadedFile}
                  className="text-green-400 hover:text-green-300 transition-colors ml-2 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resume Textarea */}
          <textarea
            className="w-full h-48 sm:h-56 lg:h-64 p-3 sm:p-4 rounded-xl bg-gray-900/50 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-200 placeholder-gray-500 transition-all duration-200 text-sm sm:text-base"
            placeholder="Or paste your resume text here..."
            value={resumeContent}
            onChange={(e) => setResumeContent(e.target.value)}
          />
        </motion.div>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:justify-center sm:flex-row items-center gap-4 sm:gap-6 mt-6 sm:mt-8 relative z-10 w-full max-w-lg sm:max-w-none"
      >
        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={
            isLoading || !jobDescription || !resumeContent || isPdfUploading
          }
          className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-lg sm:text-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transform"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <WandSparkles size={20} className="animate-pulse" />
              Analyze Resume
            </>
          )}
        </button>

        {/* Clear Button */}
        <button
          onClick={handleStartOver}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gray-700/80 hover:bg-gray-600/80 text-gray-200 text-lg sm:text-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 backdrop-blur-sm border border-gray-600/50 hover:border-gray-500/50"
        >
          <RotateCcw size={20} strokeWidth={2.5} />
          Start Over
        </button>
      </motion.div>

      {/* Results Display Area */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
            className="mt-8 sm:mt-12 w-full max-w-7xl bg-gray-800/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl border border-gray-700/50 relative z-10"
          >
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-6 sm:mb-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <CheckCircle size={28} className="text-indigo-400" />
              </div>
              Analysis Results
            </h3>

            {/* Overall Match Score & Summary */}
            <div className="mb-8 sm:mb-10 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl border border-gray-600/50 flex flex-col lg:flex-row items-center justify-between gap-6 backdrop-blur-sm">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-200 mb-3">
                  Overall Match Score:
                </h4>
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${
                      analysisResult.matchScore >= 80
                        ? "text-green-400"
                        : analysisResult.matchScore >= 60
                        ? "text-yellow-400"
                        : "text-rose-400"
                    }`}
                  >
                    {analysisResult.matchScore.toFixed(0)}%
                  </motion.span>
                  {matchScoreDisplay(analysisResult.matchScore)}
                </div>
              </div>
              {analysisResult.analysisSummary && (
                <div className="max-w-md w-full lg:w-auto">
                  <p className="text-gray-300 italic text-center lg:text-right text-base sm:text-lg leading-relaxed">
                    "{analysisResult.analysisSummary}"
                  </p>
                </div>
              )}
            </div>

            {/* Matched Skills Section */}
            <div className="mb-8 sm:mb-10">
              <h4 className="text-2xl sm:text-3xl font-bold text-green-400 mb-4 sm:mb-6 flex items-center gap-3">
                <CheckCircle size={24} />
                Matched Skills
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Technical Matched Skills */}
                <div className="bg-gray-700/50 p-4 sm:p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <h5 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Pickaxe size={18} className="text-blue-300" />
                    Technical
                  </h5>
                  {analysisResult.matchedSkills.technical &&
                  analysisResult.matchedSkills.technical.length > 0 ? (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {analysisResult.matchedSkills.technical.map(
                        (skill, index) => (
                          <SkillPill key={index} skill={skill} type="matched" />
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm sm:text-base">
                      No technical skills matched.
                    </p>
                  )}
                </div>
                {/* Soft Matched Skills */}
                <div className="bg-gray-700/50 p-4 sm:p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <h5 className="text-lg sm:text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <UserSquare size={18} className="text-purple-300" />
                    Soft Skills
                  </h5>
                  {analysisResult.matchedSkills.soft &&
                  analysisResult.matchedSkills.soft.length > 0 ? (
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {analysisResult.matchedSkills.soft.map((skill, index) => (
                        <SkillPill key={index} skill={skill} type="matched" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm sm:text-base">
                      No soft skills matched.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Missing Skills Section */}
            <div className="mb-8 sm:mb-10">
              <h4 className="text-2xl sm:text-3xl font-bold text-rose-400 mb-4 sm:mb-6 flex items-center gap-3">
                <CircleAlert size={24} />
                Missing Skills
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Technical Matched Skills */}
                <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <h5 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Pickaxe size={20} className="text-blue-300" />
                    Technical
                  </h5>
                  {analysisResult.matchedSkills.technical &&
                  analysisResult.matchedSkills.technical.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {analysisResult.matchedSkills.technical.map(
                        (skill, index) => (
                          <SkillPill key={index} skill={skill} type="matched" />
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No technical skills matched.
                    </p>
                  )}
                </div>
                {/* Soft Matched Skills */}
                <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <h5 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <UserSquare size={20} className="text-purple-300" />
                    Soft Skills
                  </h5>
                  {analysisResult.matchedSkills.soft &&
                  analysisResult.matchedSkills.soft.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {analysisResult.matchedSkills.soft.map((skill, index) => (
                        <SkillPill key={index} skill={skill} type="matched" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No soft skills matched.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Missing Skills Section */}
            <div className="mb-10">
              <h4 className="text-3xl font-bold text-rose-400 mb-6 flex items-center gap-3">
                <CircleAlert size={28} />
                Missing Skills
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Technical Missing Skills */}
                <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <h5 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Pickaxe size={20} className="text-blue-300" />
                    Technical
                  </h5>
                  {analysisResult.missingSkills.technical &&
                  analysisResult.missingSkills.technical.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {analysisResult.missingSkills.technical.map(
                        (skill, index) => (
                          <SkillPill key={index} skill={skill} type="missing" />
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No missing technical skills. Great!
                    </p>
                  )}
                </div>
                {/* Soft Missing Skills */}
                <div className="bg-gray-700/50 p-6 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <h5 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <UserSquare size={20} className="text-purple-300" />
                    Soft Skills
                  </h5>
                  {analysisResult.missingSkills.soft &&
                  analysisResult.missingSkills.soft.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {analysisResult.missingSkills.soft.map((skill, index) => (
                        <SkillPill key={index} skill={skill} type="missing" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      No missing soft skills. Excellent!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* AI Suggestions Section */}
            <div>
              <h4 className="text-3xl font-bold text-indigo-400 mb-6 flex items-center gap-3">
                <Zap size={28} />
                AI-Powered Resume Suggestions
              </h4>
              {analysisResult.suggestions &&
              analysisResult.suggestions.length > 0 ? (
                <div className="space-y-4">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 text-lg backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-600/20 p-1.5 rounded-lg mt-0.5">
                          <Zap size={16} className="text-indigo-400" />
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {suggestion}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-700/50 rounded-xl border border-gray-600/50 backdrop-blur-sm">
                  <p className="text-gray-400 italic text-lg text-center">
                    No specific suggestions generated based on the current
                    match. Your resume might be well-aligned!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default HomePage;
