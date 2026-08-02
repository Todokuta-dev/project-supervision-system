"use client";

import { useEffect, useState } from "react";
import { getProjects } from "@/lib/services/projects.service";
import { getApprovals } from "@/lib/services/approvals.service";
import { searchRepository } from "@/lib/services/repository.service";
import { getUsers } from "@/lib/services/users.service";
import { getDepartments, getActiveSession } from "@/lib/services/reference.service";
import { getActivityLogs } from "@/lib/services/activity-logs.service";
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
  ArrowRight,
  Clock,
  Building2,
  CalendarDays,
  ActivitySquare,
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
  href,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent?: boolean;
  sub?: string;
  href?: string;
}) {
  const content = (
    <motion.div
      variants={cardVariants}
      className={`rounded-2xl p-5 flex items-start justify-between border transition-all ${
        accent
          ? "bg-primary text-white border-primary"
          : "bg-background-surface border-border hover:border-primary/30"
      } ${href ? "cursor-pointer" : ""}`}
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

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [repoItems, setRepoItems] = useState<RepositoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeSession, setActiveSession] = useState<AcademicSession | null>(null);
  const [activityCount, setActivityCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          allProjects,
          allApprovals,
          allRepo,
          allUsers,
          allDepartments,
          session,
          allLogs,
        ] = await Promise.all([
          getProjects(),
          getApprovals(),
          searchRepository(),
          getUsers(),
          getDepartments(),
          getActiveSession().catch(() => null),
          getActivityLogs(),
        ]);
        setProjects(allProjects);
        setApprovals(allApprovals);
        setRepoItems(allRepo);
        setUsers(allUsers);
        setDepartments(allDepartments);
        setActiveSession(session);
        setActivityCount(allLogs.length);
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

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalSupervisors = users.filter((u) => u.role === "supervisor").length;
  const pendingApprovals = approvals.filter(
    (a) => a.status === "pending"
  ).length;

  const recentProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, 5);

  const pendingApprovalList = approvals
    .filter((a) => a.status === "pending")
    .slice(0, 4);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* --- ACTIVE SESSION BANNER --- */}
      {activeSession && (
        <motion.div
          variants={cardVariants}
          className="bg-accent/10 border border-accent/20 rounded-2xl px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-accent-dark" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Active Academic Session: {activeSession.label}
              </p>
              <p className="text-content-secondary text-xs">
                {new Date(activeSession.start_date).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}{" "}
                —{" "}
                {new Date(activeSession.end_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <Link
            href="/admin/sessions"
            className="text-xs font-semibold text-accent-dark hover:text-accent transition flex items-center gap-1"
          >
            Manage
            <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      )}

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={Users}
          accent
          sub={`${totalStudents} students · ${totalSupervisors} supervisors`}
          href="/admin/users"
        />
        <StatCard
          label="Total Projects"
          value={projects.length}
          icon={FolderOpen}
          sub={`Across all sessions`}
          href="/admin/users"
        />
        <StatCard
          label="Repository Items"
          value={repoItems.length}
          icon={Library}
          sub="Archived projects"
          href="/admin/repository"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingApprovals}
          icon={CheckSquare}
          sub={
            pendingApprovals === 0
              ? "All resolved"
              : "Requires your attention"
          }
          href="/admin/approvals"
        />
      </div>

      {/* --- MIDDLE ROW --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-content-primary font-bold text-base">
              Recent Projects
            </h2>
            <Link
              href="/admin/users"
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
                const department = departments.find(
                  (d) => d.department_id === project.department_id
                );
                return (
                  <div
                    key={project.project_id}
                    className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-content-primary text-sm font-medium truncate">
                        {project.title}
                      </p>
                      <p className="text-content-secondary text-xs mt-0.5">
                        {student?.full_name ?? "Unknown"} ·{" "}
                        {department?.code ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FolderOpen className="w-8 h-8 text-content-secondary/40 mb-2" />
              <p className="text-content-secondary text-xs">
                No projects yet
              </p>
            </div>
          )}
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-content-primary font-bold text-base">
              Pending Approvals
            </h2>
            <Link
              href="/admin/approvals"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-light transition"
            >
              View all
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingApprovalList.length > 0 ? (
            <div className="space-y-3">
              {pendingApprovalList.map((approval) => {
                const project = projects.find(
                  (p) => p.project_id === approval.project_id
                );
                const student = users.find(
                  (u) => u.user_id === project?.student_id
                );
                return (
                  <div
                    key={approval.approval_id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background hover:border-primary/30 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-content-primary text-sm font-medium">
                          {student?.full_name ?? "Unknown"}
                        </p>
                        <p className="text-content-secondary text-xs capitalize">
                          {approval.stage} approval
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/admin/approvals"
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
              <CheckSquare className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-content-primary text-sm font-semibold mb-1">
                All clear
              </p>
              <p className="text-content-secondary text-xs">
                No pending approvals
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* --- SYSTEM OVERVIEW --- */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-6"
      >
        <h2 className="text-content-primary font-bold text-base mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Departments */}
          <Link
            href="/admin/departments"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
          >
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-content-primary text-lg font-bold">
              {departments.length}
            </p>
            <p className="text-content-secondary text-xs font-medium">
              Departments
            </p>
          </Link>

          {/* Sessions — no "list all sessions" endpoint exists yet, so this
              shows 1 if an active session exists, 0 otherwise, rather than
              a fabricated count. */}
          <Link
            href="/admin/sessions"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
          >
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <p className="text-content-primary text-lg font-bold">
              {activeSession ? 1 : 0}
            </p>
            <p className="text-content-secondary text-xs font-medium">
              Sessions
            </p>
          </Link>

          {/* Repository */}
          <Link
            href="/admin/repository"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
          >
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <Library className="w-5 h-5 text-primary" />
            </div>
            <p className="text-content-primary text-lg font-bold">
              {repoItems.length}
            </p>
            <p className="text-content-secondary text-xs font-medium">
              Repository
            </p>
          </Link>

          {/* Activity */}
          <Link
            href="/admin/activity"
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group text-center"
          >
            <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <ActivitySquare className="w-5 h-5 text-primary" />
            </div>
            <p className="text-content-primary text-lg font-bold">
              {activityCount}
            </p>
            <p className="text-content-secondary text-xs font-medium">
              Activity Logs
            </p>
          </Link>
        </div>
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
            href="/admin/users"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Manage Users
              </p>
              <p className="text-content-secondary text-xs">
                Students and supervisors
              </p>
            </div>
          </Link>

          <Link
            href="/admin/sessions"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Academic Sessions
              </p>
              <p className="text-content-secondary text-xs">
                Manage active session
              </p>
            </div>
          </Link>

          <Link
            href="/admin/activity"
            className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <div className="w-9 h-9 bg-primary/8 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Activity Log
              </p>
              <p className="text-content-secondary text-xs">
                Full audit trail
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}