"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSimilarityReportById } from "@/lib/services/similarity.service";
import { getSubmissionById } from "@/lib/services/submissions.service";
import { getProjectById } from "@/lib/services/projects.service";
import { SimilarityReport, Submission, Project } from "@/lib/types";
import { mockUsers } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  User,
  FileText,
  Clock,
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

export default function SimilarityReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;

  const [report, setReport] = useState<SimilarityReport | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const r = await getSimilarityReportById(reportId);
        if (!r) {
          router.replace("/supervisor/similarity");
          return;
        }
        setReport(r);

        const sub = await getSubmissionById(r.submission_id);
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
  }, [reportId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) return null;

  const student = mockUsers.find((u) => u.user_id === project?.student_id);
  const isHigh = report.score > 40;
  const isMid = report.score > 20 && report.score <= 40;

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
          href="/supervisor/similarity"
          className="inline-flex items-center gap-1.5 text-sm text-content-secondary hover:text-content-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Similarity Reports
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">
          Full Similarity Report
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Detailed breakdown of matched sources and excerpts
        </p>
      </motion.div>

      {/* Score card */}
      <motion.div
        variants={cardVariants}
        className={`rounded-2xl border p-6 ${
          isHigh
            ? "bg-red-50 border-red-200"
            : isMid
            ? "bg-amber-50 border-amber-200"
            : "bg-green-50 border-green-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              isHigh
                ? "bg-red-100"
                : isMid
                ? "bg-amber-100"
                : "bg-green-100"
            }`}
          >
            {isHigh || isMid ? (
              <AlertTriangle
                className={`w-8 h-8 ${
                  isHigh ? "text-red-500" : "text-amber-500"
                }`}
              />
            ) : (
              <ShieldCheck className="w-8 h-8 text-green-500" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={`text-3xl font-bold ${
                isHigh
                  ? "text-red-700"
                  : isMid
                  ? "text-amber-700"
                  : "text-green-700"
              }`}
            >
              {report.score}%
            </p>
            <p
              className={`text-sm font-semibold ${
                isHigh
                  ? "text-red-600"
                  : isMid
                  ? "text-amber-600"
                  : "text-green-600"
              }`}
            >
              {isHigh
                ? "High Similarity — Significant revision required"
                : isMid
                ? "Moderate Similarity — Review matched sources"
                : "Low Similarity — Within acceptable range"}
            </p>
            <p
              className={`text-xs mt-1 ${
                isHigh
                  ? "text-red-500"
                  : isMid
                  ? "text-amber-500"
                  : "text-green-500"
              }`}
            >
              This score is analytical evidence only — not a verdict.
              Use your academic judgment when reviewing.
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-4">
          <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-white">
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
          <div className="flex justify-between mt-1">
            <span className="text-xs text-green-600 font-medium">0%</span>
            <span className="text-xs text-amber-600 font-medium">20%</span>
            <span className="text-xs text-red-600 font-medium">40%+</span>
          </div>
        </div>
      </motion.div>

      {/* Submission info */}
      {submission && (
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-5"
        >
          <h2 className="text-content-primary font-bold text-base mb-4">
            Submission Info
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-content-secondary flex-shrink-0" />
              <div>
                <p className="text-content-secondary text-xs">Chapter</p>
                <p className="text-content-primary text-sm font-medium">
                  {submission.chapter_label}
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
                <p className="text-content-secondary text-xs">Generated</p>
                <p className="text-content-primary text-sm font-medium">
                  {new Date(report.generated_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Matched sources — full breakdown */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6 space-y-4"
      >
        <h2 className="text-content-primary font-bold text-base">
          Matched Sources ({report.matched_sources.length})
        </h2>
        <p className="text-content-secondary text-xs">
          Each matched source shows the text found in the submission alongside
          the original source text from the repository.
        </p>

        {report.matched_sources.map((source, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border overflow-hidden"
          >
            {/* Source header */}
            <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
              <p className="text-content-primary text-sm font-semibold">
                {index + 1}. {source.source_title}
              </p>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  source.matched_percentage > 20
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {source.matched_percentage}% match
              </span>
            </div>

            {/* Side by side excerpts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider">
                  From Submitted Document
                </p>
                <p className="text-content-primary text-sm leading-relaxed italic bg-background rounded-xl p-3 border border-border">
                  &ldquo;{source.matched_excerpt}&rdquo;
                </p>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider">
                  From Repository Source
                </p>
                <p className="text-content-primary text-sm leading-relaxed italic bg-background rounded-xl p-3 border border-border">
                  &ldquo;{source.source_excerpt}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}