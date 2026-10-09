"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { getFeedback } from "@/lib/services/feedback.service";
import { getUsers } from "@/lib/services/users.service";
import { Project, Submission, Feedback, User } from "@/lib/types";
import { motion } from "framer-motion";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
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

function DecisionBadge({ decision }: { decision: string }) {
  const isApproved = decision === "approve";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${
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

export default function FeedbackPage() {
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approve" | "correction_required">("all");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allUsers = await getUsers();
        setUsers(allUsers);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = feedbackList.filter((fb) => {
    if (filter === "all") return true;
    return fb.decision === filter;
  });

  const sortedFeedback = [...filtered].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const approvedCount = feedbackList.filter(
    (f) => f.decision === "approve"
  ).length;
  const correctionCount = feedbackList.filter(
    (f) => f.decision === "correction_required"
  ).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">Feedback</h1>
        <p className="text-content-secondary text-sm mt-1">
          All supervisor feedback on your submissions
        </p>
      </motion.div>

      {!project && (
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-dashed border-border p-10 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            No active project
          </p>
          <p className="text-content-secondary text-xs mb-4">
            Submit a topic proposal to get started
          </p>
          <Link
            href="/student/topics/new"
            className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition"
          >
            Submit Topic
          </Link>
        </motion.div>
      )}

      {project && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <motion.div
              variants={cardVariants}
              className="bg-background-surface rounded-2xl border border-border p-4 text-center"
            >
              <p className="text-2xl font-bold text-content-primary">
                {feedbackList.length}
              </p>
              <p className="text-content-secondary text-xs mt-1">
                Total Feedback
              </p>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center"
            >
              <p className="text-2xl font-bold text-green-600">
                {approvedCount}
              </p>
              <p className="text-green-600 text-xs mt-1">Approved</p>
            </motion.div>
            <motion.div
              variants={cardVariants}
              className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center"
            >
              <p className="text-2xl font-bold text-red-600">
                {correctionCount}
              </p>
              <p className="text-red-600 text-xs mt-1">
                Corrections Required
              </p>
            </motion.div>
          </div>

          <motion.div
            variants={cardVariants}
            className="flex items-center gap-2"
          >
            {[
              { key: "all", label: "All" },
              { key: "approve", label: "Approved" },
              { key: "correction_required", label: "Corrections" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setFilter(
                    tab.key as "all" | "approve" | "correction_required"
                  )
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-primary text-white"
                    : "bg-background-surface border border-border text-content-secondary hover:text-content-primary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {sortedFeedback.length > 0 ? (
            <div className="space-y-4">
              {sortedFeedback.map((fb) => {
                const sub = submissions.find(
                  (s) => s.submission_id === fb.submission_id
                );
                const supervisor = users.find(
                  (u) => u.user_id === fb.supervisor_id
                );

                return (
                  <motion.div
                    key={fb.feedback_id}
                    variants={cardVariants}
                    className="bg-background-surface rounded-2xl border border-border p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-sm font-bold">
                            {supervisor?.full_name.charAt(0).toUpperCase() ??
                              "S"}
                          </span>
                        </div>
                        <div>
                          <p className="text-content-primary text-sm font-semibold">
                            {supervisor?.full_name ?? "Supervisor"}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3 h-3 text-content-secondary" />
                            <p className="text-content-secondary text-xs">
                              {new Date(fb.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <DecisionBadge decision={fb.decision} />
                    </div>

                    {sub && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-xl border border-border">
                        <FileText className="w-4 h-4 text-content-secondary flex-shrink-0" />
                        <p className="text-content-secondary text-xs">
                          Re:{" "}
                          <span className="text-content-primary font-medium">
                            {sub.chapter_label}
                          </span>{" "}
                          — submitted{" "}
                          {new Date(sub.submitted_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider">
                        Comments
                      </p>
                      <p className="text-content-primary text-sm leading-relaxed">
                        {fb.comments}
                      </p>
                    </div>

                    {fb.decision === "correction_required" && (
                      <div className="pt-1">
                        <Link
                          href="/student/submissions"
                          className="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Upload Revised Version
                        </Link>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              variants={cardVariants}
              className="bg-background-surface rounded-2xl border border-dashed border-border p-10 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <p className="text-content-primary font-semibold text-sm mb-1">
                No feedback yet
              </p>
              <p className="text-content-secondary text-xs">
                {filter === "all"
                  ? "Feedback will appear here once your supervisor reviews your submissions"
                  : `No ${filter === "approve" ? "approved" : "correction"} feedback found`}
              </p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
