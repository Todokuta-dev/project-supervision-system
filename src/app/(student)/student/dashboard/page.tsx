"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { getFeedback } from "@/lib/services/feedback.service";
import { getSimilarityReport } from "@/lib/services/similarity.service";
import { Project, Submission, Feedback, SimilarityReport } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Upload,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

// --- Animation Variants ---
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

// --- Stat Card ---
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

// --- Decision Badge ---
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

export default function StudentDashboard() {
  const { user } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [similarityReport, setSimilarityReport] =
    useState<SimilarityReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch student's project
        const projects = await getProjects({ student_id: user.user_id });
        const activeProject = projects.find(
          (p) => p.session_id === user.session_id
        ) ?? projects[0] ?? null;
        setProject(activeProject);

        if (activeProject) {
          // Fetch submissions for this project
          const subs = await getSubmissions({
            project_id: activeProject.project_id,
          });
          setSubmissions(subs);

          // Fetch similarity report for latest submission
          if (subs.length > 0) {
            const latestSub = subs[subs.length - 1];
            const report = await getSimilarityReport(latestSub.submission_id);
            setSimilarityReport(report);

            // Fetch feedback for all submissions
            const allFeedback: Feedback[] = [];
            for (const sub of subs) {
              const fb = await getFeedback({
                submission_id: sub.submission_id,
              });
              allFeedback.push(...fb);
            }
            setFeedbackList(allFeedback);
          }
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

  const pendingFeedback = feedbackList.filter(
    (f) => f.decision === "correction_required"
  ).length;

  const recentSubmissions = [...submissions]
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
    )
    .slice(0, 3);

  const recentFeedback = [...feedbackList]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 2);

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
          label="Project Status"
          value={project ? project.status.replace(/_/g, " ") : "No Project"}
          icon={FolderOpen}
          accent
          sub={project ? "Active this session" : "Submit a topic to start"}
        />
        <StatCard
          label="Submissions"
          value={submissions.length}
          icon={Upload}
          sub={
            submissions.length === 0
              ? "None yet"
              : `Latest: ${recentSubmissions[0]?.chapter_label ?? "—"}`
          }
        />
        <StatCard
          label="Pending Actions"
          value={pendingFeedback}
          icon={MessageSquare}
          sub={
            pendingFeedback === 0
              ? "All clear"
              : "Correction(s) required"
          }
        />
        <StatCard
          label="Similarity Score"
          value={
            similarityReport ? `${similarityReport.score}%` : "—"
          }
          icon={ShieldCheck}
          sub={
            similarityReport
              ? similarityReport.score <= 20
                ? "Within acceptable range"
                : "Review matched sources"
              : "No report yet"
          }
        />
      </div>

      {/* --- CURRENT PROJECT CARD --- */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-content-primary font-bold text-base">
            Current Project
          </h2>
          {project && (
            <Link
              href={`/student/projects/${project.project_id}`}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
            >
              View details
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {project ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-content-primary font-semibold text-sm leading-snug flex-1">
                {project.title}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-content-secondary text-sm leading-relaxed">
              {project.description}
            </p>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-content-secondary">
                <Clock className="w-3.5 h-3.5" />
                Started{" "}
                {new Date(project.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <p className="text-content-primary font-semibold text-sm mb-1">
              No project yet
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
          </div>
        )}
      </motion.div>

      {/* --- BOTTOM ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Submissions */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-content-primary font-bold text-base">
              Recent Submissions
            </h2>
            <Link
              href="/student/submissions"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.submission_id}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/8 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Upload className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-content-primary text-sm font-medium">
                        {sub.chapter_label}
                      </p>
                      <p className="text-content-secondary text-xs">
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
                  </div>
                  <span className="text-xs text-content-secondary bg-background px-2 py-1 rounded-lg border border-border capitalize">
                    {sub.submission_type.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Upload className="w-8 h-8 text-content-secondary/40 mb-2" />
              <p className="text-content-secondary text-xs">
                No submissions yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Recent Feedback */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-content-primary font-bold text-base">
              Recent Feedback
            </h2>
            <Link
              href="/student/feedback"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentFeedback.length > 0 ? (
            <div className="space-y-3">
              {recentFeedback.map((fb) => (
                <div
                  key={fb.feedback_id}
                  className="p-3 rounded-xl border border-border bg-background space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">
                          S
                        </span>
                      </div>
                      <span className="text-xs font-medium text-content-primary">
                        Supervisor
                      </span>
                    </div>
                    <DecisionBadge decision={fb.decision} />
                  </div>
                  <p className="text-content-secondary text-xs leading-relaxed line-clamp-2">
                    {fb.comments}
                  </p>
                  <p className="text-content-secondary text-xs">
                    {new Date(fb.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="w-8 h-8 text-content-secondary/40 mb-2" />
              <p className="text-content-secondary text-xs">
                No feedback yet
              </p>
            </div>
          )}
        </motion.div>
      </div>

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
            href="/student/topics/new"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Submit Topic
              </p>
              <p className="text-content-secondary text-xs">
                Propose a new project
              </p>
            </div>
          </Link>

          <Link
            href="/student/submissions"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <Upload className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Upload Chapter
              </p>
              <p className="text-content-secondary text-xs">
                Submit a chapter draft
              </p>
            </div>
          </Link>

          <Link
            href="/student/repository"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Search Repository
              </p>
              <p className="text-content-secondary text-xs">
                Browse past projects
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}