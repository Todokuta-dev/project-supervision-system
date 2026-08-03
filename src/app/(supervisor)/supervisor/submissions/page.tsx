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
  ClipboardList,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
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

export default function ReviewQueuePage() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");

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

        const allSubs: Submission[] = [];
        const allFeedback: Feedback[] = [];

        for (const project of supervisorProjects) {
          const subs = await getSubmissions({
            project_id: project.project_id,
          });
          allSubs.push(...subs);

          for (const sub of subs) {
            const fb = await getFeedback({
              submission_id: sub.submission_id,
            });
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

  const reviewedIds = new Set(feedbackList.map((f) => f.submission_id));

  const enriched = submissions.map((sub) => {
    const project = projects.find((p) => p.project_id === sub.project_id);
    const student = users.find((u) => u.user_id === project?.student_id);
    const feedback = feedbackList.find(
      (f) => f.submission_id === sub.submission_id
    );
    return { sub, project, student, feedback };
  });

  const filtered = enriched.filter(({ sub, student, project }) => {
    const matchesSearch =
      !search ||
      sub.chapter_label.toLowerCase().includes(search.toLowerCase()) ||
      student?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      project?.title.toLowerCase().includes(search.toLowerCase());

    const isReviewed = reviewedIds.has(sub.submission_id);
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && !isReviewed) ||
      (filter === "reviewed" && isReviewed);

    return matchesSearch && matchesFilter;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const aReviewed = reviewedIds.has(a.sub.submission_id);
    const bReviewed = reviewedIds.has(b.sub.submission_id);
    if (aReviewed !== bReviewed) return aReviewed ? 1 : -1;
    return (
      new Date(b.sub.submitted_at).getTime() -
      new Date(a.sub.submitted_at).getTime()
    );
  });

  const pendingCount = submissions.filter(
    (s) => !reviewedIds.has(s.submission_id)
  ).length;
  const reviewedCount = submissions.filter((s) =>
    reviewedIds.has(s.submission_id)
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
        <h1 className="text-content-primary text-2xl font-bold">
          Review Queue
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          All student submissions awaiting or completed review
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-primary rounded-2xl border border-primary p-4 text-center"
        >
          <p className="text-2xl font-bold text-white">
            {submissions.length}
          </p>
          <p className="text-white/60 text-xs mt-1">Total Submissions</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-center"
        >
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-amber-600 text-xs mt-1">Pending Review</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center"
        >
          <p className="text-2xl font-bold text-green-600">{reviewedCount}</p>
          <p className="text-green-600 text-xs mt-1">Reviewed</p>
        </motion.div>
      </div>

      {/* Search + Filter */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, chapter or project title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-content-primary bg-background-surface placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "pending", "reviewed"].map((f) => (
            <button
              key={f}
              onClick={() =>
                setFilter(f as "all" | "pending" | "reviewed")
              }
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-background-surface border border-border text-content-secondary hover:text-content-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Submissions list */}
      {sortedFiltered.length > 0 ? (
        <div className="space-y-3">
          {sortedFiltered.map(({ sub, project, student, feedback }) => {
            const isReviewed = reviewedIds.has(sub.submission_id);
            return (
              <motion.div
                key={sub.submission_id}
                variants={cardVariants}
                className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isReviewed
                          ? "bg-green-50 border border-green-200"
                          : "bg-amber-50 border border-amber-200"
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          isReviewed ? "text-green-500" : "text-amber-500"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-content-primary font-bold text-sm">
                        {sub.chapter_label}
                      </p>
                      <p className="text-content-secondary text-xs truncate">
                        {student?.full_name ?? "Unknown"} ·{" "}
                        {project?.title ?? "—"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-content-secondary" />
                        <p className="text-content-secondary text-xs">
                          Submitted{" "}
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

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isReviewed && feedback ? (
                      <DecisionBadge decision={feedback.decision} />
                    ) : (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {isReviewed && feedback && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-content-secondary text-xs line-clamp-2 leading-relaxed">
                      {feedback.comments}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <p className="text-content-secondary text-xs">
                    {sub.file_name}
                  </p>
                  <Link
                    href={`/supervisor/submissions/${sub.submission_id}/review`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition"
                  >
                    {isReviewed ? "View Review" : "Review Now"}
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
            <ClipboardList className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            {search || filter !== "all"
              ? "No submissions match your search"
              : "No submissions yet"}
          </p>
          <p className="text-content-secondary text-xs">
            {search || filter !== "all"
              ? "Try adjusting your filters"
              : "Submissions from your students will appear here"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}