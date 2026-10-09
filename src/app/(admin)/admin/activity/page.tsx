"use client";

import { useEffect, useState } from "react";
import { getActivityLogs } from "@/lib/services/activity-logs.service";
import { ActivityLog } from "@/lib/types";
import { motion } from "framer-motion";
import {
  ActivitySquare,
  Search,
  User,
  Clock,
  FolderOpen,
  Upload,
  MessageSquare,
  CheckSquare,
  Shield,
  GraduationCap,
  BookOpen,
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

function RoleBadge({ role }: { role: string }) {
  const config = {
    student: {
      label: "Student",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: GraduationCap,
    },
    supervisor: {
      label: "Supervisor",
      className: "bg-primary/10 text-primary border-primary/20",
      icon: BookOpen,
    },
    admin: {
      label: "Admin",
      className: "bg-accent/10 text-accent-dark border-accent/20",
      icon: Shield,
    },
  }[role] ?? {
    label: role,
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: User,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function EntityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ElementType> = {
    Submission: Upload,
    Feedback: MessageSquare,
    Approval: CheckSquare,
    Project: FolderOpen,
    User: User,
  };
  const Icon = icons[type] ?? ActivitySquare;
  return (
    <div className="w-9 h-9 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-primary" />
    </div>
  );
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "student" | "supervisor" | "admin"
  >("all");
  const [entityFilter, setEntityFilter] = useState("all");

useEffect(() => {
  const fetchLogs = async () => {
    const data = await getActivityLogs();
    const sorted = [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    setLogs(sorted);
  };
  fetchLogs();
}, []);

  const entityTypes = [
    "all",
    ...Array.from(new Set(logs.map((l) => l.entity_type))),
  ];

  const filtered = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || log.actor_role === roleFilter;
    const matchesEntity =
      entityFilter === "all" || log.entity_type === entityFilter;
    return matchesSearch && matchesRole && matchesEntity;
  });

  const studentActions = logs.filter((l) => l.actor_role === "student").length;
  const supervisorActions = logs.filter(
    (l) => l.actor_role === "supervisor",
  ).length;
  const adminActions = logs.filter((l) => l.actor_role === "admin").length;

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
          Activity Log
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Full audit trail — every action taken in the system, by whom, and when
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-primary rounded-2xl border border-primary p-4 text-center"
        >
          <p className="text-2xl font-bold text-white">{logs.length}</p>
          <p className="text-white/60 text-xs mt-1">Total Actions</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-4 text-center"
        >
          <p className="text-2xl font-bold text-content-primary">
            {new Set(logs.map((l) => l.actor_id)).size}
          </p>
          <p className="text-content-secondary text-xs mt-1">Active Users</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-4 text-center"
        >
          <p className="text-2xl font-bold text-content-primary">
            {new Set(logs.map((l) => l.entity_type)).size}
          </p>
          <p className="text-content-secondary text-xs mt-1">Entity Types</p>
        </motion.div>
      </div>

      {/* Role breakdown */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border p-5"
      >
        <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider mb-3">
          Actions by Role
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Students",
              count: studentActions,
              color: "bg-blue-500",
              bg: "bg-blue-50",
              text: "text-blue-600",
              border: "border-blue-200",
            },
            {
              label: "Supervisors",
              count: supervisorActions,
              color: "bg-primary",
              bg: "bg-primary/5",
              text: "text-primary",
              border: "border-primary/20",
            },
            {
              label: "Admins",
              count: adminActions,
              color: "bg-accent",
              bg: "bg-accent/10",
              text: "text-accent-dark",
              border: "border-accent/20",
            },
          ].map(({ label, count, bg, text, border }) => (
            <div
              key={label}
              className={`p-3 rounded-xl border ${bg} ${border} text-center`}
            >
              <p className={`text-xl font-bold ${text}`}>{count}</p>
              <p className={`text-xs font-medium mt-0.5 ${text}`}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Search + Filters */}
      <motion.div variants={cardVariants} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, actor, or entity type..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-content-primary bg-background-surface placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role filter */}
          {["all", "student", "supervisor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() =>
                setRoleFilter(r as "all" | "student" | "supervisor" | "admin")
              }
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                roleFilter === r
                  ? "bg-primary text-white"
                  : "bg-background-surface border border-border text-content-secondary hover:text-content-primary"
              }`}
            >
              {r}
            </button>
          ))}

          <div className="w-px h-5 bg-border mx-1" />

          {/* Entity filter */}
          {entityTypes.map((e) => (
            <button
              key={e}
              onClick={() => setEntityFilter(e)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                entityFilter === e
                  ? "bg-accent text-white"
                  : "bg-background-surface border border-border text-content-secondary hover:text-content-primary"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results count */}
      <motion.div variants={cardVariants}>
        <p className="text-content-secondary text-sm">
          Showing{" "}
          <span className="text-content-primary font-semibold">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="text-content-primary font-semibold">
            {logs.length}
          </span>{" "}
          log entries
        </p>
      </motion.div>

      {/* Log entries */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((log, index) => (
            <motion.div
              key={log.log_id}
              variants={cardVariants}
              className="bg-background-surface rounded-2xl border border-border p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-primary/30" />
                  {index < filtered.length - 1 && (
                    <div className="w-0.5 h-8 bg-border" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <EntityIcon type={log.entity_type} />
                      <div>
                        <p className="text-content-primary text-sm font-semibold">
                          {log.action}
                        </p>
                        <p className="text-content-secondary text-xs">
                          {log.entity_type} · ID: {log.entity_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actor + time */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary text-xs font-bold">
                          {log.actor_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-content-primary text-xs font-medium">
                        {log.actor_name}
                      </p>
                    </div>
                    <RoleBadge role={log.actor_role} />
                    <div className="flex items-center gap-1.5 text-content-secondary text-xs ml-auto">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(log.timestamp).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(log.timestamp).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
            <ActivitySquare className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            No activity found
          </p>
          <p className="text-content-secondary text-xs">
            Try adjusting your search or filters
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
