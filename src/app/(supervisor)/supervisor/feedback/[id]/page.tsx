"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFeedbackById } from "@/lib/services/feedback.service";
import { getSubmissionById } from "@/lib/services/submissions.service";
import { getProjectById } from "@/lib/services/projects.service";
import { Feedback, Submission, Project } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  FileText,
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

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const feedbackId = params.id as string;

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fb = await getFeedbackById(feedbackId);
        if (!fb) {
          router.replace("/supervisor/submissions");
          return;
        }
        setFeedback(fb);

        const sub = await getSubmissionById(fb.submission_id);
        setSubmission(sub);

        if (sub) {
          const proj = await getProjectById(sub.project_id);
          setProject(proj);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [feedbackId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!feedback) return null;

  const student = mockUsers.find((u) => u.user_id === project?.student_id);
  const supervisor = mockUsers.find((u) => u.user_id === feedback.supervisor_id);
  const isApproved = feedback.decision === "approve";

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
          Feedback Detail
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Full record of feedback given for this submission
        </p>
      </motion.div>

      {/* Decision banner */}
      <motion.div
        variants={cardVariants}
        className={`rounded-2xl border p-5 flex items-center gap-4 ${
          isApproved
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            isApproved ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {isApproved ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <p
            className={`text-base font-bold ${
              isApproved ? "text-green-700" : "text-red-700"
            }`}
          >
            {isApproved ? "Submission Approved" : "Correction Required"}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              isApproved ? "text-green-600" : "text-red-600"
            }`}
          >
            {isApproved
              ? "Student has been cleared to proceed to the next stage"
              : "Student must revise and resubmit before proceeding"}
          </p>
        </div>
      </motion.div>

      {/* Feedback details */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6 space-y-5"
      >
        <h2 className="text-content-primary font-bold text-base">
          Feedback Record
        </h2>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-content-secondary text-xs">Supervisor</p>
              <p className="text-content-primary text-sm font-medium">
                {supervisor?.full_name ?? "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-content-secondary text-xs">Student</p>
              <p className="text-content-primary text-sm font-medium">
                {student?.full_name ?? "Unknown"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-content-secondary text-xs">Date Given</p>
              <p className="text-content-primary text-sm font-medium">
                {new Date(feedback.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Submission reference */}
        {submission && (
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border">
            <div className="w-9 h-9 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-secondary text-xs">Submission</p>
              <p className="text-content-primary text-sm font-semibold">
                {submission.chapter_label}
              </p>
              <p className="text-content-secondary text-xs">
                {submission.file_name}
              </p>
            </div>
          </div>
        )}

        {/* Project reference */}
        {project && (
          <div className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border">
            <div className="w-9 h-9 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-secondary text-xs">Project</p>
              <p className="text-content-primary text-sm font-semibold leading-snug">
                {project.title}
              </p>
            </div>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Comments */}
        <div className="space-y-2">
          <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider">
            Comments
          </p>
          <p className="text-content-primary text-sm leading-relaxed">
            {feedback.comments}
          </p>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        variants={cardVariants}
        className="flex items-center gap-3"
      >
        <Link
          href="/supervisor/submissions"
          className="flex-1 text-center bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition text-sm"
        >
          Back to Review Queue
        </Link>
        {submission && (
          <Link
            href={`/supervisor/submissions/${submission.submission_id}/review`}
            className="flex-1 text-center bg-background-surface hover:bg-background border border-border text-content-primary font-semibold py-2.5 rounded-xl transition text-sm"
          >
            View Full Review
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}