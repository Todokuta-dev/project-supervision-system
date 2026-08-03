"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createProject } from "@/lib/services/projects.service";
import { getDepartments, getActiveSession } from "@/lib/services/reference.service";
import { Department, AcademicSession } from "@/lib/types";
import { motion } from "framer-motion";
import {
  FolderOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
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

export default function SubmitTopicPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeSession, setActiveSession] = useState<AcademicSession | null>(null);
  const [isLoadingReference, setIsLoadingReference] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const loadReferenceData = async () => {
      setIsLoadingReference(true);
      try {
        const [allDepartments, session] = await Promise.all([
          getDepartments(),
          getActiveSession().catch(() => null),
        ]);
        setDepartments(allDepartments);
        setActiveSession(session);
      } finally {
        setIsLoadingReference(false);
      }
    };
    loadReferenceData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.title.trim().length < 10) {
      setError("Project title must be at least 10 characters.");
      return;
    }

    if (formData.description.trim().length < 30) {
      setError("Description must be at least 30 characters.");
      return;
    }

    if (!user) return;
    if (!activeSession) {
      setError("No active academic session found. Please contact the admin.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        student_id: user.user_id,
        department_id: user.department_id,
        session_id: activeSession.session_id,
      });

      setIsSuccess(true);

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit topic. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Topic Submitted!
          </h2>
          <p className="text-content-secondary text-sm max-w-xs">
            Your topic proposal has been submitted successfully. Your supervisor
            will review it shortly.
          </p>
          <p className="text-content-secondary text-xs">
            Redirecting to dashboard...
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
      className="max-w-2xl mx-auto space-y-6"
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

      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">
          Submit Topic Proposal
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Propose your final year project topic for supervisor review and
          approval.
        </p>
      </motion.div>

      {/* Active session info */}
      {activeSession && (
        <motion.div
          variants={cardVariants}
          className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-content-primary text-sm font-semibold">
              Academic Session: {activeSession.label}
            </p>
            <p className="text-content-secondary text-xs">
              Your project will be registered under this session
            </p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6 space-y-5"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-content-primary mb-1"
            >
              Project Title
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Intelligent Traffic Management System Using Machine Learning"
              className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <p className="text-content-secondary text-xs mt-1">
              Be specific and descriptive. Minimum 10 characters.
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-content-primary mb-1"
            >
              Project Description
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe what your project is about, the problem it solves, and your proposed approach..."
              className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
            />
            <p className="text-content-secondary text-xs mt-1">
              Minimum 30 characters. Be clear and concise.
            </p>
          </div>

          {/* Department (read-only, from user profile) */}
          <div>
            <label className="block text-sm font-medium text-content-primary mb-1">
              Department
            </label>
            <div className="w-full px-4 py-2.5 rounded-xl border border-border bg-background/60 text-content-secondary text-sm">
              {departments.find(
                (d) => d.department_id === user?.department_id
              )?.name ?? "—"}
            </div>
            <p className="text-content-secondary text-xs mt-1">
              Automatically assigned from your profile.
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-amber-700 text-xs font-semibold">
                Before you submit
              </p>
            </div>
            <ul className="text-amber-700 text-xs space-y-1 list-disc list-inside">
              <li>Ensure your topic is original and not a repeat of past projects</li>
              <li>Your supervisor will be assigned by the admin after submission</li>
              <li>You will be notified once your topic is reviewed</li>
              <li>You can only have one active project per session</li>
            </ul>
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

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting || isLoadingReference}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Topic Proposal"
              )}
            </motion.button>

            <Link
              href="/student/dashboard"
              className="px-5 py-2.5 rounded-xl border border-border text-content-secondary text-sm font-medium hover:bg-background transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}