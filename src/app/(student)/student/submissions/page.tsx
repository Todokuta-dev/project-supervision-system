"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import {
  getSubmissions,
  createSubmission,
} from "@/lib/services/submissions.service";
import { getFeedback } from "@/lib/services/feedback.service";
import { Project, Submission, Feedback, SubmissionType } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  PartyPopper,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const CHAPTER_OPTIONS = [
  { label: "Topic Proposal", value: "topic_proposal" as SubmissionType },
  { label: "Chapter One", value: "chapter_draft" as SubmissionType },
  { label: "Chapter Two", value: "chapter_draft" as SubmissionType },
  { label: "Chapter Three", value: "chapter_draft" as SubmissionType },
  { label: "Chapter Four", value: "chapter_draft" as SubmissionType },
  { label: "Chapter Five", value: "chapter_draft" as SubmissionType },
  { label: "Final Submission", value: "final_submission" as SubmissionType },
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_SIZE_MB = 10;

function DecisionBadge({ decision }: { decision: string }) {
  const isApproved = decision === "approve";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
        isApproved
          ? "bg-green-50 text-green-600 border-green-200"
          : "bg-red-50 text-red-600 border-red-200"
      }`}
    >
      {isApproved ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertCircle className="w-3 h-3" />
      )}
      {isApproved ? "Approved" : "Correction Required"}
    </span>
  );
}

export default function SubmissionsPage() {
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [selectedChapter, setSelectedChapter] = useState(CHAPTER_OPTIONS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const projects = await getProjects({ student_id: user.user_id });
        const active = projects[0] ?? null;
        setProject(active);

        if (active) {
          const subs = await getSubmissions({ project_id: active.project_id });
          setSubmissions(subs);

          const allFeedback: Feedback[] = [];
          for (const sub of subs) {
            const fb = await getFeedback({ submission_id: sub.submission_id });
            allFeedback.push(...fb);
          }
          setFeedbackList(allFeedback);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError(
        "Only PDF or Word documents (.pdf, .doc, .docx) are allowed.",
      );
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File size must not exceed ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !selectedFile || !user) return;

    setIsSubmitting(true);
    try {
      const newSub = await createSubmission({
        project_id: project.project_id,
        submission_type: selectedChapter.value,
        chapter_label: selectedChapter.label,
        file: selectedFile,
      });

      setSubmissions((prev) => [...prev, newSub]);
      setSubmitSuccess(true);
      setShowUploadForm(false);
      setSelectedFile(null);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sortedSubmissions = [...submissions].sort(
    (a, b) =>
      new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-content-primary text-2xl font-bold">
            Submissions
          </h1>
          <p className="text-content-secondary text-sm mt-1">
            Upload and track your chapter drafts
          </p>
        </div>
        {project && project.status !== "archived" && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowUploadForm(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Upload Chapter
          </motion.button>
        )}
      </motion.div>

      {/* No project state */}
      {project && project.status === "archived" && (
        <motion.div
          variants={cardVariants}
          className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center text-center"
        >
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
            <PartyPopper className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-green-700 font-semibold text-sm">
            This project is complete and archived
          </p>
          <p className="text-green-600 text-xs mt-1">
            No further submissions are needed. Great work!
          </p>
        </motion.div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-background-surface rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-content-primary font-bold text-base">
                Upload Chapter Draft
              </h2>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setFileError("");
                }}
                className="text-content-secondary hover:text-content-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              {/* Chapter selection */}
              <div>
                <label className="block text-sm font-medium text-content-primary mb-1">
                  Chapter / Stage
                </label>
                <select
                  value={selectedChapter.label}
                  onChange={(e) => {
                    const found = CHAPTER_OPTIONS.find(
                      (c) => c.label === e.target.value,
                    );
                    if (found) setSelectedChapter(found);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  {CHAPTER_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.label}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-content-primary mb-1">
                  File
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <label className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all">
                  {selectedFile ? (
                    <>
                      <FileText className="w-8 h-8 text-primary" />
                      <p className="text-content-primary text-sm font-medium text-center">
                        {selectedFile.name}
                      </p>
                      <p className="text-content-secondary text-xs">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-content-secondary/50" />
                      <p className="text-content-primary text-sm font-medium">
                        Click to choose a file
                      </p>
                      <p className="text-content-secondary text-xs">
                        PDF or Word document · Max {MAX_SIZE_MB}MB
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {fileError && (
                  <p className="text-red-600 text-xs mt-1">{fileError}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <motion.button
                  type="submit"
                  disabled={!selectedFile || isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadForm(false);
                    setSelectedFile(null);
                    setFileError("");
                  }}
                  className="px-5 py-2.5 rounded-xl border border-border text-content-secondary text-sm font-medium hover:bg-background transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Success toast */}
      {submitSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 right-6 z-50 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Chapter uploaded successfully
        </motion.div>
      )}

      {/* Submissions list */}
      {project && (
        <motion.div variants={cardVariants}>
          {sortedSubmissions.length > 0 ? (
            <div className="space-y-3">
              {sortedSubmissions.map((sub) => {
                const feedback = feedbackList.find(
                  (f) => f.submission_id === sub.submission_id,
                );
                return (
                  <motion.div
                    key={sub.submission_id}
                    variants={cardVariants}
                    className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-content-primary font-semibold text-sm">
                            {sub.chapter_label}
                          </h3>
                          <p className="text-content-secondary text-xs truncate">
                            {sub.file_name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-content-secondary" />
                            <p className="text-content-secondary text-xs">
                              {new Date(sub.submitted_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {feedback ? (
                          <DecisionBadge decision={feedback.decision} />
                        ) : (
                          <span className="text-xs text-content-secondary bg-background border border-border px-2.5 py-1 rounded-full">
                            Awaiting review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Feedback preview */}
                    {feedback && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                          Supervisor Feedback
                        </p>
                        <p className="text-content-secondary text-sm leading-relaxed line-clamp-2">
                          {feedback.comments}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-background-surface rounded-2xl border border-dashed border-border p-10 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="text-content-primary font-semibold text-sm mb-1">
                No submissions yet
              </p>
              <p className="text-content-secondary text-xs mb-4">
                Upload your first chapter draft to get started
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadForm(true)}
                className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition"
              >
                Upload Chapter
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
