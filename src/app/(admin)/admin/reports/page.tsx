"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/services/projects.service";
import { getApprovals } from "@/lib/services/approvals.service";
import { searchRepository } from "@/lib/services/repository.service";
import { getUsers } from "@/lib/services/users.service";
import { getDepartments, getActiveSession } from "@/lib/services/reference.service";
import {
  Project,
  Approval,
  RepositoryItem,
  User,
  Department,
  AcademicSession,
} from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  Library,
  CheckSquare,
  TrendingUp,
  Building2,
  CalendarDays,
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

export default function AdminReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [repoItems, setRepoItems] = useState<RepositoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeSession, setActiveSession] = useState<AcademicSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allProjects, allApprovals, allRepo, allUsers, allDepartments, session] =
          await Promise.all([
            getProjects(),
            getApprovals(),
            searchRepository(),
            getUsers(),
            getDepartments(),
            getActiveSession().catch(() => null),
          ]);
        setProjects(allProjects);
        setApprovals(allApprovals);
        setRepoItems(allRepo);
        setUsers(allUsers);
        setDepartments(allDepartments);
        setActiveSession(session);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalSupervisors = users.filter((u) => u.role === "supervisor").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  const byStatus = {
    topic_pending: projects.filter((p) => p.status === "topic_pending").length,
    under_review: projects.filter((p) => p.status === "under_review").length,
    correction_required: projects.filter(
      (p) => p.status === "correction_required"
    ).length,
    approved: projects.filter((p) => p.status === "approved").length,
    archived: projects.filter((p) => p.status === "archived").length,
  };

  const byDepartment = departments.map((dept) => ({
    dept,
    count: projects.filter((p) => p.department_id === dept.department_id)
      .length,
  }));

  // Only the active session is available (no "list all sessions" endpoint
  // exists yet), so this table shows just that one row rather than a
  // fabricated multi-session history.
  const sessionRow = activeSession
    ? {
        session: activeSession,
        count: projects.filter((p) => p.session_id === activeSession.session_id)
          .length,
        repoCount: repoItems.filter(
          (r) => r.session_id === activeSession.session_id
        ).length,
      }
    : null;

  const approvalStats = {
    pending: approvals.filter((a) => a.status === "pending").length,
    approved: approvals.filter((a) => a.status === "approved").length,
    rejected: approvals.filter((a) => a.status === "rejected").length,
  };

  const maxDeptCount = Math.max(...byDepartment.map((d) => d.count), 1);
  const maxStatusCount = Math.max(...Object.values(byStatus), 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">Reports</h1>
        <p className="text-content-secondary text-sm mt-1">
          System-wide analytics and overview for{" "}
          {activeSession?.label ?? "all sessions"}
        </p>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={users.length}
          icon={Users}
          accent
          sub={`${totalStudents} students · ${totalSupervisors} supervisors`}
        />
        <StatCard
          label="Total Projects"
          value={projects.length}
          icon={FolderOpen}
          sub="Across all sessions"
        />
        <StatCard
          label="Repository"
          value={repoItems.length}
          icon={Library}
          sub="Archived projects"
        />
        <StatCard
          label="Approvals"
          value={approvals.length}
          icon={CheckSquare}
          sub={`${approvalStats.pending} pending`}
        />
      </div>

      {/* Projects by status */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h2 className="text-content-primary font-bold text-base">
            Projects by Status
          </h2>
        </div>
        <div className="space-y-3">
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <StatusBadge status={status as never} size="sm" />
                <span className="text-content-primary text-sm font-bold">
                  {count}
                </span>
              </div>
              <div className="w-full h-2 bg-background rounded-full border border-border overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(count / maxStatusCount) * 100}%`,
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    status === "approved"
                      ? "bg-green-500"
                      : status === "under_review"
                      ? "bg-amber-500"
                      : status === "correction_required"
                      ? "bg-red-500"
                      : status === "archived"
                      ? "bg-gray-400"
                      : "bg-blue-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Projects by department */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-content-primary font-bold text-base">
              Projects by Department
            </h2>
          </div>
          <div className="space-y-3">
            {byDepartment.map(({ dept, count }) => (
              <div key={dept.department_id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-lg border border-primary/20">
                      {dept.code}
                    </span>
                    <span className="text-content-secondary text-xs truncate max-w-[120px]">
                      {dept.name}
                    </span>
                  </div>
                  <span className="text-content-primary text-sm font-bold">
                    {count}
                  </span>
                </div>
                <div className="w-full h-2 bg-background rounded-full border border-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(count / maxDeptCount) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="h-full rounded-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Approval breakdown */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <CheckSquare className="w-4 h-4 text-primary" />
            <h2 className="text-content-primary font-bold text-base">
              Approval Breakdown
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                label: "Pending",
                count: approvalStats.pending,
                color: "bg-amber-500",
                bg: "bg-amber-50",
                text: "text-amber-600",
                border: "border-amber-200",
              },
              {
                label: "Approved",
                count: approvalStats.approved,
                color: "bg-green-500",
                bg: "bg-green-50",
                text: "text-green-600",
                border: "border-green-200",
              },
              {
                label: "Rejected",
                count: approvalStats.rejected,
                color: "bg-red-500",
                bg: "bg-red-50",
                text: "text-red-600",
                border: "border-red-200",
              },
            ].map(({ label, count, color, bg, text, border }) => (
              <div
                key={label}
                className={`flex items-center justify-between p-3 rounded-xl border ${bg} ${border}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className={`text-sm font-medium ${text}`}>
                    {label}
                  </span>
                </div>
                <span className={`text-lg font-bold ${text}`}>{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-content-secondary text-sm">
              Total Approvals
            </span>
            <span className="text-content-primary text-lg font-bold">
              {approvals.length}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Session breakdown */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h2 className="text-content-primary font-bold text-base">
            Breakdown by Academic Session
          </h2>
        </div>
        {sessionRow ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-content-secondary text-xs font-semibold uppercase tracking-wider pb-3">
                    Session
                  </th>
                  <th className="text-left text-content-secondary text-xs font-semibold uppercase tracking-wider pb-3">
                    Projects
                  </th>
                  <th className="text-left text-content-secondary text-xs font-semibold uppercase tracking-wider pb-3">
                    Repository
                  </th>
                  <th className="text-left text-content-secondary text-xs font-semibold uppercase tracking-wider pb-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-background transition">
                  <td className="py-3 pr-4">
                    <p className="text-content-primary text-sm font-semibold">
                      {sessionRow.session.label}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-content-primary text-sm font-bold">
                      {sessionRow.count}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-content-primary text-sm font-bold">
                      {sessionRow.repoCount}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                      Active
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="text-content-secondary text-xs mt-3">
              Only the active session is shown — historical session records
              aren&apos;t tracked separately yet.
            </p>
          </div>
        ) : (
          <p className="text-content-secondary text-sm">
            No active academic session found.
          </p>
        )}
      </motion.div>

      {/* Users breakdown */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="text-content-primary font-bold text-base">
            Users Breakdown
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Students",
              count: totalStudents,
              bg: "bg-blue-50",
              text: "text-blue-600",
              border: "border-blue-200",
            },
            {
              label: "Supervisors",
              count: totalSupervisors,
              bg: "bg-primary/5",
              text: "text-primary",
              border: "border-primary/20",
            },
            {
              label: "Admins",
              count: totalAdmins,
              bg: "bg-accent/10",
              text: "text-accent-dark",
              border: "border-accent/20",
            },
          ].map(({ label, count, bg, text, border }) => (
            <div
              key={label}
              className={`p-4 rounded-2xl border ${bg} ${border} text-center`}
            >
              <p className={`text-2xl font-bold ${text}`}>{count}</p>
              <p className={`text-xs font-medium mt-1 ${text}`}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}