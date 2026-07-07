"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { getSimilarityReport } from "@/lib/services/similarity.service";
import { Project, Submission, SimilarityReport } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  ScanSearch,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertTriangle,
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

interface EnrichedReport {
  report: SimilarityReport;
  submission: Submission;
  project: Project;
}

function ScoreBadge({ score }: { score: number }) {
  const isLow = score <= 20;
  const isMid = score > 20 && score <= 40;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
        isLow
          ? "bg-green-50 text-green-700 border-green-200"
          : isMid
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-red-50 text-red-700 border-red-200"
      }`}
    >
      <ShieldCheck className="w-3 h-3" />
      {score}% similarity
    </span>
  );
}

export default function SimilarityReportsPage() {
  const { user } = useAuth();

  const [enrichedReports, setEnrichedReports] = useState<EnrichedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const projects = await getProjects({ supervisor_id: user.user_id });
        const results: EnrichedReport[] = [];

        for (const project of projects) {
          const subs = await getSubmissions({ project_id: project.project_id });
          for (const sub of subs) {
            const report = await getSimilarityReport(sub.submission_id);
            if (report) {
              results.push({ report, submission: sub, project });
            }
          }
        }

        setEnrichedReports(results);
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

  const filtered = enrichedReports.filter(({ report }) => {
    if (filter === "low") return report.score <= 20;
    if (filter === "medium") return report.score > 20 && report.score <= 40;
    if (filter === "high") return report.score > 40;
    return true;
  });

  const lowCount = enrichedReports.filter((r) => r.report.score <= 20).length;
  const midCount = enrichedReports.filter(
    (r) => r.report.score > 20 && r.report.score <= 40
  ).length;
  const highCount = enrichedReports.filter((r) => r.report.score > 40).length;

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
          Similarity Reports
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Plagiarism and similarity analytics for all student submissions
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center cursor-pointer hover:border-green-300 transition"
          onClick={() => setFilter(filter === "low" ? "all" : "low")}
        >
          <p className="text-2xl font-bold text-green-600">{lowCount}</p>
          <p className="text-green-600 text-xs mt-1">Low (≤20%)</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-center cursor-pointer hover:border-amber-300 transition"
          onClick={() => setFilter(filter === "medium" ? "all" : "medium")}
        >
          <p className="text-2xl font-bold text-amber-600">{midCount}</p>
          <p className="text-amber-600 text-xs mt-1">Medium (21–40%)</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center cursor-pointer hover:border-red-300 transition"
          onClick={() => setFilter(filter === "high" ? "all" : "high")}
        >
          <p className="text-2xl font-bold text-red-600">{highCount}</p>
          <p className="text-red-600 text-xs mt-1">High (&gt;40%)</p>
        </motion.div>
      </div>

      {/* Filter tabs */}
      <motion.div variants={cardVariants} className="flex items-center gap-2">
        {[
          { key: "all", label: "All Reports" },
          { key: "low", label: "Low" },
          { key: "medium", label: "Medium" },
          { key: "high", label: "High" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setFilter(tab.key as "all" | "low" | "medium" | "high")
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

      {/* Reports list */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(({ report, submission, project }) => {
            const student = mockUsers.find(
              (u) => u.user_id === project.student_id
            );
            const isHigh = report.score > 40;
            const isMid = report.score > 20 && report.score <= 40;

            return (
              <motion.div
                key={report.report_id}
                variants={cardVariants}
                className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all space-y-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isHigh
                          ? "bg-red-50 border border-red-200"
                          : isMid
                          ? "bg-amber-50 border border-amber-200"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      {isHigh || isMid ? (
                        <AlertTriangle
                          className={`w-5 h-5 ${
                            isHigh ? "text-red-500" : "text-amber-500"
                          }`}
                        />
                      ) : (
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-content-primary font-bold text-sm">
                        {submission.chapter_label}
                      </p>
                      <p className="text-content-secondary text-xs truncate">
                        {student?.full_name ?? "Unknown"} ·{" "}
                        {project.title}
                      </p>
                    </div>
                  </div>
                  <ScoreBadge score={report.score} />
                </div>

                {/* Score bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-content-secondary text-xs">
                      Similarity
                    </p>
                    <p className="text-content-primary text-xs font-bold">
                      {report.score}%
                    </p>
                  </div>
                  <div className="w-full h-2 bg-background rounded-full border border-border overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHigh
                          ? "bg-red-500"
                          : isMid
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(report.score, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Matched sources preview */}
                <div className="space-y-2">
                  <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider">
                    {report.matched_sources.length} Matched Source
                    {report.matched_sources.length !== 1 ? "s" : ""}
                  </p>
                  {report.matched_sources.slice(0, 2).map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-3 p-3 bg-background rounded-xl border border-border"
                    >
                      <p className="text-content-primary text-xs font-medium truncate flex-1">
                        {source.source_title}
                      </p>
                      <span className="text-xs font-bold text-content-secondary flex-shrink-0">
                        {source.matched_percentage}%
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Generated{" "}
                    {new Date(report.generated_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <Link
                    href={`/supervisor/similarity/${report.report_id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition"
                  >
                    Full Report
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
            <ScanSearch className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            {filter !== "all"
              ? `No ${filter} similarity reports`
              : "No similarity reports yet"}
          </p>
          <p className="text-content-secondary text-xs">
            {filter !== "all"
              ? "Try switching to a different filter"
              : "Reports will appear here once students submit chapters"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}