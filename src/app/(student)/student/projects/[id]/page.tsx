"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProjectById } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { getFeedback } from "@/lib/services/feedback.service";
import { getSimilarityReport } from "@/lib/services/similarity.service";
import { getUsers } from "@/lib/services/users.service";
import { getDepartments, getAllSessions } from "@/lib/services/reference.service";
import {
  Project,
  Submission,
  Feedback,
  SimilarityReport,
  User,
  Department,
  AcademicSession,
} from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  MessageSquare,
  ShieldCheck,
  Clock,
  User as UserIcon,
  Building2,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
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

const statusSteps = [
  { key: "topic_pending", label: "Topic Submitted" },
  { key: "under_review", label: "Under Review" },
  { key: "correction_required", label: "Correction Required" },
  { key: "approved", label: "Approved" },
  { key: "archived", label: "Archived" },
];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-start gap-0">
      {statusSteps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === statusSteps.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-primary border-primary"
                    : isCurrent
                    ? "bg-background-surface border-primary"
                    : "bg-background border-border"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-border" />
                )}
              </div>
              <p
                className={`text-xs text-center max-w-[70px] leading-tight ${
                  isCurrent
                    ? "text-primary font-semibold"
                    : isCompleted
                    ? "text-content-primary font-medium"
                    : "text-content-secondary"
                }`}
              >
                {step.label}
              </p>
            </div>
            {!isLast && (
              <div
                className={`flex-1 h-0.5 mb-5 mx-1 ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [similarityReport, setSimilarityReport] =
    useState<SimilarityReport | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "feedback">("overview");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [proj, allUsers, allDepartments, allSessions] = await Promise.all([
          getProjectById(projectId),
          getUsers(),
          getDepartments(),
          getAllSessions().catch(() => []),
        ]);

        if (!proj) {
          router.replace("/student/dashboard");
          return;
        }
        setProject(proj);
        setUsers(allUsers);
        setDepartments(allDepartments);
        setSessions(allSessions);

        const subs = await getSubmissions({ project_id: projectId });
        setSubmissions(subs);

        const allFeedback: Feedback[] = [];
        for (const sub of subs) {
          const fb = await getFeedback({ submission_id: sub.submission_id });
          allFeedback.push(...fb);
        }
        setFeedbackList(allFeedback);

        if (subs.length > 0) {
          const latestSub = subs[subs.length - 1];
          const report = await getSimilarityReport(latestSub.submission_id);
          setSimilarityReport(report);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const supervisor = users.find((u) => u.user_id === project.supervisor_id);
  const department = departments.find(
    (d) => d.department_id === project.department_id
  );
  const session = sessions.find((s) => s.session_id === project.session_id);

  const tabs = [
    { key: "overview", label: "Overview", icon: FileText },
    { key: "submissions", label: `Submissions (${submissions.length})`, icon: Upload },
    { key: "feedback", label: `Feedback (${feedbackList.length})`, icon: MessageSquare },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Back link */}
      <motion.div variants={cardVariants}>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Project Header */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-content-primary text-xl font-bold leading-snug">
              {project.title}
            </h1>
            <p className="text-content-secondary text-sm mt-2 leading-relaxed">
              {project.description}
            </p>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-content-secondary text-xs">Supervisor</p>
              <p className="text-content-primary text-sm font-medium">
                {supervisor?.full_name ?? "Not assigned"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-content-secondary text-xs">Department</p>
              <p className="text-content-primary text-sm font-medium">
                {department?.name ?? "—"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-content-secondary flex-shrink-0" />
            <div>
              <p className="text-content-secondary text-xs">Session</p>
              <p className="text-content-primary text-sm font-medium">
                {session?.label ?? "—"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Status Timeline */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <h2 className="text-content-primary font-bold text-base mb-6">
          Project Progress
        </h2>
        <StatusTimeline currentStatus={project.status} />
      </motion.div>

      {/* Similarity Score */}
      {similarityReport && (
        <motion.div
          variants={cardVariants}
          className={`rounded-2xl border p-6 ${
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
                    ? "Within acceptable range — no action needed"
                    : similarityReport.score <= 40
                    ? "Moderate similarity — review matched sources"
                    : "High similarity — significant revision required"}
                </p>
              </div>
            </div>
            <Link
              href={`/student/repository`}
              className={`text-xs font-semibold flex items-center gap-1 ${
                similarityReport.score <= 20
                  ? "text-green-700 hover:text-green-800"
                  : similarityReport.score <= 40
                  ? "text-amber-700 hover:text-amber-800"
                  : "text-red-700 hover:text-red-800"
              } transition`}
            >
              View sources
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {similarityReport.matched_sources.length > 0 && (
            <div className="mt-4 space-y-2">
              {similarityReport.matched_sources.map((source, index) => (
                <div
                  key={index}
                  className="bg-white/60 rounded-xl p-3 border border-white/80"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-content-primary text-xs font-semibold">
                      {source.source_title}
                    </p>
                    <span className="text-xs font-bold text-content-secondary">
                      {source.matched_percentage}% match
                    </span>
                  </div>
                  <p className="text-content-secondary text-xs leading-relaxed italic">
                    &ldquo;{source.matched_excerpt}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-1 bg-background-surface border border-border rounded-2xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(tab.key as "overview" | "submissions" | "feedback")
                }
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h2 className="text-content-primary font-bold text-base">
              Project Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-content-secondary text-xs mb-1">
                  Date Created
                </p>
                <p className="text-content-primary text-sm font-semibold">
                  {new Date(project.created_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-content-secondary text-xs mb-1">
                  Last Updated
                </p>
                <p className="text-content-primary text-sm font-semibold">
                  {new Date(project.updated_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-content-secondary text-xs mb-1">
                  Total Submissions
                </p>
                <p className="text-content-primary text-sm font-semibold">
                  {submissions.length}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background border border-border">
                <p className="text-content-secondary text-xs mb-1">
                  Feedback Received
                </p>
                <p className="text-content-primary text-sm font-semibold">
                  {feedbackList.length}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/student/submissions"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
              >
                <Upload className="w-4 h-4" />
                Upload New Chapter
              </Link>
            </div>
          </div>
        )}

        {activeTab === "submissions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-content-primary font-bold text-base">
                Submissions
              </h2>
              <Link
                href="/student/submissions"
                className="text-xs font-semibold text-primary hover:text-primary-light transition"
              >
                Upload new
              </Link>
            </div>

            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions
                  .sort(
                    (a, b) =>
                      new Date(b.submitted_at).getTime() -
                      new Date(a.submitted_at).getTime()
                  )
                  .map((sub) => {
                    const feedback = feedbackList.find(
                      (f) => f.submission_id === sub.submission_id
                    );
                    return (
                      <div
                        key={sub.submission_id}
                        className="flex items-center justify-between gap-3 p-4 rounded-xl border border-border bg-background"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-content-primary text-sm font-semibold">
                              {sub.chapter_label}
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
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        {feedback ? (
                          <DecisionBadge decision={feedback.decision} />
                        ) : (
                          <span className="text-xs text-content-secondary bg-background border border-border px-2.5 py-0.5 rounded-full">
                            Awaiting review
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Upload className="w-8 h-8 text-content-secondary/40 mb-2" />
                <p className="text-content-primary text-sm font-semibold mb-1">
                  No submissions yet
                </p>
                <p className="text-content-secondary text-xs mb-4">
                  Upload your first chapter draft to get started
                </p>
                <Link
                  href="/student/submissions"
                  className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition"
                >
                  Upload Chapter
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="space-y-4">
            <h2 className="text-content-primary font-bold text-base">
              Feedback
            </h2>

            {feedbackList.length > 0 ? (
              <div className="space-y-3">
                {feedbackList
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((fb) => {
                    const sub = submissions.find(
                      (s) => s.submission_id === fb.submission_id
                    );
                    return (
                      <div
                        key={fb.feedback_id}
                        className="p-4 rounded-xl border border-border bg-background space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-content-primary text-sm font-semibold">
                              {sub?.chapter_label ?? "Submission"}
                            </p>
                            <p className="text-content-secondary text-xs">
                              {supervisor?.full_name ?? "Supervisor"} ·{" "}
                              {new Date(fb.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <DecisionBadge decision={fb.decision} />
                        </div>
                        <p className="text-content-secondary text-sm leading-relaxed">
                          {fb.comments}
                        </p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare className="w-8 h-8 text-content-secondary/40 mb-2" />
                <p className="text-content-primary text-sm font-semibold mb-1">
                  No feedback yet
                </p>
                <p className="text-content-secondary text-xs">
                  Feedback will appear here once your supervisor reviews your
                  submissions
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}