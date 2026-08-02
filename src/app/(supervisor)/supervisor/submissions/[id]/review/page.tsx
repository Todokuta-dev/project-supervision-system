"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSubmissionById } from "@/lib/services/submissions.service";
import { getProjectById } from "@/lib/services/projects.service";
import { getFeedback, createFeedback } from "@/lib/services/feedback.service";
import { getSimilarityReport } from "@/lib/services/similarity.service";
import { Submission, Project, Feedback, SimilarityReport } from "@/lib/types";
import { getUsers } from "@/lib/services/users.service";
import { User as UserType } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Send,
  Download,
  ExternalLink,
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

export default function ReviewSubmissionPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(
    null,
  );
  const [similarityReport, setSimilarityReport] =
    useState<SimilarityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<UserType[]>([]);

  // Form state
  const [comments, setComments] = useState("");
  const [decision, setDecision] = useState<"approve" | "correction_required">(
    "approve",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sub = await getSubmissionById(submissionId);
        if (!sub) {
          router.replace("/supervisor/submissions");
          return;
        }
        setSubmission(sub);

        const proj = await getProjectById(sub.project_id);
        setProject(proj);

        const feedback = await getFeedback({ submission_id: submissionId });
        setExistingFeedback(feedback[0] ?? null);
        if (feedback[0]) {
          setComments(feedback[0].comments);
          setDecision(feedback[0].decision);
        }

        const allUsers = await getUsers();
        setUsers(allUsers);

        const report = await getSimilarityReport(submissionId);
        setSimilarityReport(report);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [submissionId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (comments.trim().length < 10) {
      setError("Please provide at least 10 characters of feedback.");
      return;
    }

    if (!user || !submission) return;

    setIsSubmitting(true);
    try {
      await createFeedback({
        submission_id: submission.submission_id,
        supervisor_id: user.user_id,
        comments: comments.trim(),
        decision,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/supervisor/submissions");
      }, 2000);
    } catch {
      setError("Failed to submit feedback. Please try again.");
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

  if (!submission) return null;

  const student = users.find((u) => u.user_id === project?.student_id);

  
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-content-primary text-xl font-bold">
            Feedback Submitted
          </h2>
          <p className="text-content-secondary text-sm max-w-xs">
            Your feedback has been sent to the student successfully.
          </p>
          <p className="text-content-secondary text-xs">
            Redirecting to review queue...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Back */}
      <motion.div variants={cardVariants}>
        <Link
          href="/supervisor/submissions"
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Review Queue
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">
          Review Submission
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Review the submission and provide feedback to the student
        </p>
      </motion.div>

      {/* Submission details */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6 space-y-4"
      >
        <h2 className="text-content-primary font-bold text-base">
          Submission Details
        </h2>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-content-primary font-semibold text-sm">
              {submission.chapter_label}
            </p>
            <p className="text-content-secondary text-xs">
              {submission.file_name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-content-secondary" />
            <div>
              <p className="text-content-secondary text-xs">Student</p>
              <p className="text-content-primary text-sm font-medium">
                {student?.full_name ?? "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-content-secondary" />
            <div>
              <p className="text-content-secondary text-xs">Submitted</p>
              <p className="text-content-primary text-sm font-medium">
                {new Date(submission.submitted_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {project && (
          <div className="p-3 bg-background rounded-xl border border-border">
            <p className="text-content-secondary text-xs mb-1">Project</p>
            <p className="text-content-primary text-sm font-medium">
              {project.title}
            </p>
          </div>
        )}

        {/* File access */}
        <div className="pt-2">
          <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider mb-2">
            Submitted File
          </p>
          <div className="flex items-center justify-between gap-3 p-3 bg-background rounded-xl border border-border">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-primary/8 border border-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-content-primary text-sm font-medium truncate">
                  {submission.file_name}
                </p>
                <p className="text-content-secondary text-xs">
                  PDF / Word Document
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={submission.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition bg-primary/8 hover:bg-primary/15 px-3 py-2 rounded-xl border border-primary/10"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View
              </a>
              <a
                href={submission.file_path}
                download={submission.file_name}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-light transition px-3 py-2 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Similarity report */}
      {similarityReport && (
        <motion.div
          variants={cardVariants}
          className={`rounded-2xl border p-6 space-y-4 ${
            similarityReport.score <= 20
              ? "bg-green-50 border-green-200"
              : similarityReport.score <= 40
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  similarityReport.score <= 20
                    ? "bg-green-100"
                    : similarityReport.score <= 40
                      ? "bg-amber-100"
                      : "bg-red-100"
                }`}
              >
                <ShieldCheck
                  className={`w-5 h-5 ${
                    similarityReport.score <= 20
                      ? "text-green-600"
                      : similarityReport.score <= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                />
              </div>
              <div>
                <p
                  className={`text-sm font-bold ${
                    similarityReport.score <= 20
                      ? "text-green-700"
                      : similarityReport.score <= 40
                        ? "text-amber-700"
                        : "text-red-700"
                  }`}
                >
                  Similarity Score: {similarityReport.score}%
                </p>
                <p
                  className={`text-xs ${
                    similarityReport.score <= 20
                      ? "text-green-600"
                      : similarityReport.score <= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {similarityReport.score <= 20
                    ? "Within acceptable range"
                    : similarityReport.score <= 40
                      ? "Moderate similarity — review matched sources"
                      : "High similarity — significant revision required"}
                </p>
              </div>
            </div>
          </div>

          {/* Matched sources */}
          <div className="space-y-2">
            <p
              className={`text-xs font-semibold uppercase tracking-wider ${
                similarityReport.score <= 20
                  ? "text-green-700"
                  : similarityReport.score <= 40
                    ? "text-amber-700"
                    : "text-red-700"
              }`}
            >
              Matched Sources
            </p>
            {similarityReport.matched_sources.map((source, index) => (
              <div
                key={index}
                className="bg-white/70 rounded-xl p-3 border border-white space-y-2"
              >
                <div className="flex items-center justify-between">
                  <p className="text-content-primary text-xs font-semibold">
                    {source.source_title}
                  </p>
                  <span className="text-xs font-bold text-content-secondary">
                    {source.matched_percentage}% match
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <p className="text-content-secondary text-xs font-medium mb-1">
                      Submitted text:
                    </p>
                    <p className="text-content-secondary text-xs leading-relaxed italic bg-white/60 p-2 rounded-lg">
                      &ldquo;{source.matched_excerpt}&rdquo;
                    </p>
                  </div>
                  <div>
                    <p className="text-content-secondary text-xs font-medium mb-1">
                      Source text:
                    </p>
                    <p className="text-content-secondary text-xs leading-relaxed italic bg-white/60 p-2 rounded-lg">
                      &ldquo;{source.source_excerpt}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Feedback form */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <h2 className="text-content-primary font-bold text-base mb-5">
          {existingFeedback ? "Feedback Given" : "Give Feedback"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-2">
              Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision("approve")}
                disabled={!!existingFeedback}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  decision === "approve"
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-background border-border text-content-secondary hover:border-green-200"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                type="button"
                onClick={() => setDecision("correction_required")}
                disabled={!!existingFeedback}
                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  decision === "correction_required"
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "bg-background border-border text-content-secondary hover:border-red-200"
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <AlertCircle className="w-4 h-4" />
                Correction Required
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label
              htmlFor="comments"
              className="block text-sm font-medium text-content-primary mb-1"
            >
              Comments
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              id="comments"
              rows={5}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={!!existingFeedback}
              placeholder="Write your feedback for the student here. Be specific about what needs to be improved or what was done well..."
              className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <p className="text-content-secondary text-xs mt-1">
              Minimum 10 characters.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}

          {/* Already reviewed notice */}
          {existingFeedback && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-green-700 text-sm">
                You have already submitted feedback for this submission.
              </p>
            </div>
          )}

          {/* Submit */}
          {!existingFeedback && (
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </motion.button>
          )}
        </form>
      </motion.div>
    </motion.div>
  );
}
