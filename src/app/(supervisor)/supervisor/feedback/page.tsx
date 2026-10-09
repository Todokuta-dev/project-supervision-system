"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { getFeedback } from "@/lib/services/feedback.service";
import { Project, Submission, Feedback } from "@/lib/types";
import { getUsers } from "@/lib/services/users.service";
import { User } from "@/lib/types";
import { motion } from "framer-motion";
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
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

export default function SupervisorFeedbackPage() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supervisorProjects = await getProjects({
          supervisor_id: user.user_id,
        });
        setProjects(supervisorProjects);

        const allUsers = await getUsers();
        setUsers(allUsers);

        const allSubs: Submission[] = [];
        const allFeedback: Feedback[] = [];

        for (const project of supervisorProjects) {
          const subs = await getSubmissions({ project_id: project.project_id });
          allSubs.push(...subs);

          for (const sub of subs) {
            const fb = await getFeedback({ submission_id: sub.submission_id });
            allFeedback.push(...fb);
          }
        }

        setSubmissions(allSubs);
        setFeedbackList(allFeedback);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);
  const [filter, setFilter] = useState<
    "all" | "approve" | "correction_required"
  >("all");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supervisorProjects = await getProjects({
          supervisor_id: user.user_id,
        });
        setProjects(supervisorProjects);

        const allSubs: Submission[] = [];
        const allFeedback: Feedback[] = [];

        for (const project of supervisorProjects) {
          const subs = await getSubmissions({ project_id: project.project_id });
          allSubs.push(...subs);

          for (const sub of subs) {
            const fb = await getFeedback({ submission_id: sub.submission_id });
            allFeedback.push(...fb);
          }
        }

        setSubmissions(allSubs);
        setFeedbackList(allFeedback);
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

  const sorted = [...filtered].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const approvedCount = feedbackList.filter(
    (f) => f.decision === "approve",
  ).length;
  const correctionCount = feedbackList.filter(
    (f) => f.decision === "correction_required",
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
          All feedback you have given across your assigned students
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-primary rounded-2xl border border-primary p-4 text-center"
        >
          <p className="text-2xl font-bold text-white">{feedbackList.length}</p>
          <p className="text-white/60 text-xs mt-1">Total Feedback</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center"
        >
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-green-600 text-xs mt-1">Approved</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center"
        >
          <p className="text-2xl font-bold text-red-600">{correctionCount}</p>
          <p className="text-red-600 text-xs mt-1">Corrections Given</p>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div variants={cardVariants} className="flex items-center gap-2">
        {[
          { key: "all", label: "All" },
          { key: "approve", label: "Approved" },
          { key: "correction_required", label: "Corrections" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setFilter(tab.key as "all" | "approve" | "correction_required")
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

      {/* Feedback list */}
      {sorted.length > 0 ? (
        <div className="space-y-3">
          {sorted.map((fb) => {
            const sub = submissions.find(
              (s) => s.submission_id === fb.submission_id,
            );
            const project = projects.find(
              (p) => p.project_id === sub?.project_id,
            );
            const student = users.find(
              (u) => u.user_id === project?.student_id,
            );

            return (
              <motion.div
                key={fb.feedback_id}
                variants={cardVariants}
                className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-bold">
                        {student?.full_name.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-content-primary font-semibold text-sm">
                        {student?.full_name ?? "Unknown Student"}
                      </p>
                      <p className="text-content-secondary text-xs truncate">
                        {sub?.chapter_label ?? "Submission"} ·{" "}
                        {project?.title ?? "—"}
                      </p>
                    </div>
                  </div>
                  <DecisionBadge decision={fb.decision} />
                </div>

                <p className="text-content-secondary text-sm leading-relaxed line-clamp-2">
                  {fb.comments}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(fb.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <Link
                    href={`/supervisor/feedback/${fb.feedback_id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
                  >
                    View Full
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            {filter !== "all"
              ? "No feedback matches this filter"
              : "No feedback given yet"}
          </p>
          <p className="text-content-secondary text-xs">
            {filter !== "all"
              ? "Try switching to a different filter"
              : "Feedback will appear here once you review student submissions"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
