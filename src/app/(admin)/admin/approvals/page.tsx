"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getApprovals, updateApproval } from "@/lib/services/approvals.service";
import { getProjects } from "@/lib/services/projects.service";
import { getUsers } from "@/lib/services/users.service";
import { Approval, Project, User } from "@/lib/types";
import { motion } from "framer-motion";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  User as UserIcon,
  FolderOpen,
  X,
} from "lucide-react";

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

function ApprovalStatusBadge({ status }: { status: string }) {
  const config = {
    pending: {
      label: "Pending",
      className: "bg-amber-50 text-amber-600 border-amber-200",
    },
    approved: {
      label: "Approved",
      className: "bg-green-50 text-green-600 border-green-200",
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-50 text-red-600 border-red-200",
    },
  }[status] ?? {
    label: status,
    className: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function AdminApprovalsPage() {
  const { user } = useAuth();

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allApprovals, allProjects, allUsers] = await Promise.all([
          getApprovals(),
          getProjects(),
          getUsers(),
        ]);
        setApprovals(allApprovals);
        setProjects(allProjects);
        setUsers(allUsers);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDecision = async (
    approval: Approval,
    decision: "approved" | "rejected"
  ) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const updated = await updateApproval(approval.approval_id, {
        status: decision,
        notes: notes.trim(),
      });

      setApprovals((prev) =>
        prev.map((a) =>
          a.approval_id === approval.approval_id ? updated : a
        )
      );

      // Project status was updated atomically on the backend as part of the
      // same request — refetch to get the authoritative current state.
      const refreshedProjects = await getProjects();
      setProjects(refreshedProjects);

      setSuccessMsg(
        `Approval ${decision === "approved" ? "approved" : "rejected"} successfully.`
      );
      setSelectedApproval(null);
      setNotes("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = approvals.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  const approvedCount = approvals.filter((a) => a.status === "approved").length;
  const rejectedCount = approvals.filter((a) => a.status === "rejected").length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">Approvals</h1>
        <p className="text-content-secondary text-sm mt-1">
          Review and approve or reject student project topic proposals
        </p>
      </motion.div>

      {/* Success toast */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-center cursor-pointer hover:border-amber-300 transition"
          onClick={() => setFilter(filter === "pending" ? "all" : "pending")}
        >
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-amber-600 text-xs mt-1">Pending</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-green-50 rounded-2xl border border-green-200 p-4 text-center cursor-pointer hover:border-green-300 transition"
          onClick={() => setFilter(filter === "approved" ? "all" : "approved")}
        >
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
          <p className="text-green-600 text-xs mt-1">Approved</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-red-50 rounded-2xl border border-red-200 p-4 text-center cursor-pointer hover:border-red-300 transition"
          onClick={() => setFilter(filter === "rejected" ? "all" : "rejected")}
        >
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
          <p className="text-red-600 text-xs mt-1">Rejected</p>
        </motion.div>
      </div>

      {/* Filter tabs */}
      <motion.div variants={cardVariants} className="flex items-center gap-2">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() =>
              setFilter(f as "all" | "pending" | "approved" | "rejected")
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f
                ? "bg-primary text-white"
                : "bg-background-surface border border-border text-content-secondary hover:text-content-primary"
            }`}
          >
            {f}
          </button>
        ))}
      </motion.div>

      {/* Approvals list */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((approval) => {
            const project = projects.find(
              (p) => p.project_id === approval.project_id
            );
            const student = users.find(
              (u) => u.user_id === project?.student_id
            );
            const approvedBy = users.find(
              (u) => u.user_id === approval.approved_by
            );
            const isPending = approval.status === "pending";

            return (
              <motion.div
                key={approval.approval_id}
                variants={cardVariants}
                className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all space-y-4"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">
                        {student?.full_name.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-content-primary font-bold text-sm">
                        {student?.full_name ?? "Unknown Student"}
                      </p>
                      <p className="text-content-secondary text-xs capitalize">
                        {approval.stage} approval
                      </p>
                    </div>
                  </div>
                  <ApprovalStatusBadge status={approval.status} />
                </div>

                {/* Project */}
                {project && (
                  <div className="flex items-start gap-3 p-3 bg-background rounded-xl border border-border">
                    <div className="w-8 h-8 bg-primary/8 border border-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FolderOpen className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-content-secondary text-xs">Project</p>
                      <p className="text-content-primary text-sm font-medium leading-snug">
                        {project.title}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes if resolved */}
                {!isPending && approval.notes && (
                  <div className="p-3 bg-background rounded-xl border border-border">
                    <p className="text-content-secondary text-xs mb-1">
                      Notes
                    </p>
                    <p className="text-content-primary text-sm">
                      {approval.notes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4">
                    {approval.approval_date && (
                      <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(approval.approval_date).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    )}
                    {approvedBy && !isPending && (
                      <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                        <UserIcon className="w-3.5 h-3.5" />
                        {approvedBy.full_name}
                      </div>
                    )}
                  </div>

                  {isPending && (
                    <button
                      onClick={() => {
                        setSelectedApproval(approval);
                        setNotes("");
                      }}
                      className="text-xs font-semibold text-primary hover:text-primary-light transition"
                    >
                      Review
                    </button>
                  )}
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
            <CheckSquare className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            {filter !== "all"
              ? `No ${filter} approvals`
              : "No approvals yet"}
          </p>
          <p className="text-content-secondary text-xs">
            {filter !== "all"
              ? "Try switching to a different filter"
              : "Approval requests will appear here once students submit topics"}
          </p>
        </motion.div>
      )}

      {/* Review Modal */}
      {selectedApproval && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-background-surface rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-content-primary font-bold text-base">
                Review Approval
              </h2>
              <button
                onClick={() => {
                  setSelectedApproval(null);
                  setNotes("");
                }}
                className="text-content-secondary hover:text-content-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Project info */}
            {(() => {
              const project = projects.find(
                (p) => p.project_id === selectedApproval.project_id
              );
              const student = users.find(
                (u) => u.user_id === project?.student_id
              );
              return (
                <div className="p-4 bg-background rounded-xl border border-border mb-4 space-y-2">
                  <p className="text-content-secondary text-xs">Student</p>
                  <p className="text-content-primary text-sm font-semibold">
                    {student?.full_name ?? "Unknown"}
                  </p>
                  <p className="text-content-secondary text-xs mt-2">
                    Project
                  </p>
                  <p className="text-content-primary text-sm font-medium leading-snug">
                    {project?.title ?? "—"}
                  </p>
                </div>
              );
            })()}

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-content-primary mb-1">
                Notes (optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the student or record..."
                className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
            </div>

            {/* Decision buttons */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                onClick={() =>
                  handleDecision(selectedApproval, "approved")
                }
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </>
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                onClick={() =>
                  handleDecision(selectedApproval, "rejected")
                }
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Reject
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}