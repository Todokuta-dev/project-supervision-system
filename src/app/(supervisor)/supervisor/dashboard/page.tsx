"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { getFeedback } from "@/lib/services/feedback.service";
import { getUsers } from "@/lib/services/users.service";
import { Project, Submission, Feedback, User } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  MessageSquare,
  ScanSearch,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
} from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl p-5 flex items-start justify-between border ${
        accent
          ? "bg-primary text-white border-primary"
          : "bg-background-surface border-border"
      }`}
    >
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
            accent ? "text-white/60" : "text-content-secondary"
          }`}
        >
          {label}
        </p>
        <p
          className={`text-2xl font-bold ${
            accent ? "text-white" : "text-content-primary"
          }`}
        >
          {value}
        </p>
        {sub && (
          <p
            className={`text-xs mt-1 ${
              accent ? "text-white/50" : "text-content-secondary"
            }`}
          >
            {sub}
          </p>
        )}
      </div>
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          accent ? "bg-white/10" : "bg-primary/8 border border-primary/10"
        }`}
      >
        <Icon
          className={`w-5 h-5 ${accent ? "text-accent" : "text-primary"}`}
        />
      </div>
    </motion.div>
  );
}

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

export default function SupervisorDashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allUsers = await getUsers();
        setUsers(allUsers);

        const supervisorProjects = await getProjects({
          supervisor_id: user.user_id,
        });
        setProjects(supervisorProjects);

        const allSubmissions: Submission[] = [];
        const allFeedback: Feedback[] = [];

        for (const project of supervisorProjects) {
          const subs = await getSubmissions({
            project_id: project.project_id,
          });
          allSubmissions.push(...subs);

          for (const sub of subs) {
            const fb = await getFeedback({
              submission_id: sub.submission_id,
            });
            allFeedback.push(...fb);
          }
        }

        setSubmissions(allSubmissions);
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

  const reviewedSubmissionIds = new Set(feedbackList.map((f) => f.submission_id));
  const pendingReviews = submissions.filter(
    (s) => !reviewedSubmissionIds.has(s.submission_id)
  );

  const recentFeedback = [...feedbackList]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 3);

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Students"
          value={projects.length}
          icon={Users}
          accent
          sub={`This session`}
        />
        <StatCard
          label="Pending Reviews"
          value={pendingReviews.length}
          icon={ClipboardList}
          sub={
            pendingReviews.length === 0
              ? "All reviewed"
              : "Awaiting your feedback"
          }
        />
        <StatCard
          label="Feedback Given"
          value={feedbackList.length}
          icon={MessageSquare}
          sub="Total across all students"
        />
        <StatCard
          label="Similarity Reports"
          value={submissions.length}
          icon={ScanSearch}
          sub="Submissions with reports"
        />
      </div>

      {/* --- BOTTOM ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assigned Students / Projects */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-content-primary font-bold text-base">
              Assigned Students
            </h2>
            <Link
              href="/supervisor/students"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => {
                const student = users.find(
                  (u) => u.user_id === project.student_id
                );
                return (
                  <div
                    key={project.project_id}
                    className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">
                          {student?.full_name.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-content-primary text-sm font-medium truncate">
                          {student?.full_name ?? "Unknown Student"}
                        </p>
                        <p className="text-content-secondary text-xs truncate">
                          {project.title}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="w-8 h-8 text-content-secondary/40 mb-2" />
              <p className="text-content-secondary text-xs">
                No students assigned yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Pending Review Queue */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-content-primary font-bold text-base">
              Review Queue
            </h2>
            <Link
              href="/supervisor/submissions"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingReviews.length > 0 ? (
            <div className="space-y-3">
              {pendingReviews.map((sub) => {
                const project = projects.find(
                  (p) => p.project_id === sub.project_id
                );
                const student = users.find(
                  (u) => u.user_id === project?.student_id
                );
                return (
                  <div
                    key={sub.submission_id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Upload className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-content-primary text-sm font-medium">
                          {sub.chapter_label}
                        </p>
                        <p className="text-content-secondary text-xs">
                          {student?.full_name ?? "Unknown"} ·{" "}
                          {new Date(sub.submitted_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/supervisor/submissions/${sub.submission_id}/review`}
                      className="text-xs font-semibold text-primary hover:text-primary-light transition flex-shrink-0"
                    >
                      Review
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-content-primary text-sm font-semibold mb-1">
                All caught up
              </p>
              <p className="text-content-secondary text-xs">
                No pending submissions to review
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* --- RECENT FEEDBACK --- */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-content-primary font-bold text-base">
            Recent Feedback Given
          </h2>
          <Link
            href="/supervisor/feedback"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentFeedback.length > 0 ? (
          <div className="space-y-3">
            {recentFeedback.map((fb) => {
              const sub = submissions.find(
                (s) => s.submission_id === fb.submission_id
              );
              const project = projects.find(
                (p) => p.project_id === sub?.project_id
              );
              const student = users.find(
                (u) => u.user_id === project?.student_id
              );
              return (
                <div
                  key={fb.feedback_id}
                  className="p-4 rounded-xl border border-border bg-background space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">
                          {student?.full_name.charAt(0).toUpperCase() ?? "?"}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-content-primary">
                          {student?.full_name ?? "Unknown"}
                        </span>
                        <span className="text-content-secondary text-xs">
                          {" "}
                          · {sub?.chapter_label ?? "Submission"}
                        </span>
                      </div>
                    </div>
                    <DecisionBadge decision={fb.decision} />
                  </div>
                  <p className="text-content-secondary text-xs leading-relaxed line-clamp-2">
                    {fb.comments}
                  </p>
                  <div className="flex items-center gap-1 text-content-secondary text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(fb.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-8 h-8 text-content-secondary/40 mb-2" />
            <p className="text-content-secondary text-xs">
              No feedback given yet
            </p>
          </div>
        )}
      </motion.div>

      {/* --- QUICK ACTIONS --- */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <h2 className="text-content-primary font-bold text-base mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/supervisor/students"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                My Students
              </p>
              <p className="text-content-secondary text-xs">
                View all assigned students
              </p>
            </div>
          </Link>

          <Link
            href="/supervisor/submissions"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Review Queue
              </p>
              <p className="text-content-secondary text-xs">
                Review pending submissions
              </p>
            </div>
          </Link>

          <Link
            href="/supervisor/similarity"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <ScanSearch className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Similarity Reports
              </p>
              <p className="text-content-secondary text-xs">
                View plagiarism analytics
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}