"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getSubmissions } from "@/lib/services/submissions.service";
import { Project, Submission } from "@/lib/types";
import { mockUsers, mockDepartments, mockSessions } from "@/lib/mock-data";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  Upload,
  ArrowRight,
  Building2,
  CalendarDays,
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

export default function SupervisorStudentsPage() {
  const { user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getProjects({ supervisor_id: user.user_id });
        setProjects(data);

        const allSubs: Submission[] = [];
        for (const project of data) {
          const subs = await getSubmissions({ project_id: project.project_id });
          allSubs.push(...subs);
        }
        setSubmissions(allSubs);
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

  const filtered = projects.filter((p) => {
    const student = mockUsers.find((u) => u.user_id === p.student_id);
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      student?.full_name.toLowerCase().includes(search.toLowerCase());
    const matchesSession = !selectedSession || p.session_id === selectedSession;
    return matchesSearch && matchesSession;
  });

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
          My Students
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          All students assigned to you for supervision
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-primary rounded-2xl border border-primary p-4 text-center"
        >
          <p className="text-2xl font-bold text-white">{projects.length}</p>
          <p className="text-white/60 text-xs mt-1">Total Students</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-4 text-center"
        >
          <p className="text-2xl font-bold text-content-primary">
            {projects.filter((p) => p.status === "approved").length}
          </p>
          <p className="text-content-secondary text-xs mt-1">Approved</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-4 text-center"
        >
          <p className="text-2xl font-bold text-content-primary">
            {projects.filter((p) => p.status === "under_review").length}
          </p>
          <p className="text-content-secondary text-xs mt-1">Under Review</p>
        </motion.div>
      </div>

      {/* Search + Filter */}
      <motion.div
        variants={cardVariants}
        className="flex items-center gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or project title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-content-primary bg-background-surface placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        >
          <option value="">All Sessions</option>
          {mockSessions.map((s) => (
            <option key={s.session_id} value={s.session_id}>
              {s.label}
              {s.is_active ? " (Current)" : ""}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Students list */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((project) => {
            const student = mockUsers.find(
              (u) => u.user_id === project.student_id
            );
            const department = mockDepartments.find(
              (d) => d.department_id === project.department_id
            );
            const session = mockSessions.find(
              (s) => s.session_id === project.session_id
            );
            const projectSubs = submissions.filter(
              (s) => s.project_id === project.project_id
            );

            return (
              <motion.div
                key={project.project_id}
                variants={cardVariants}
                className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Student info */}
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
                      <p className="text-content-secondary text-xs truncate">
                        {student?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={project.status} size="sm" />
                </div>

                {/* Project title */}
                <div className="mt-4 p-3 bg-background rounded-xl border border-border">
                  <div className="flex items-start gap-2">
                    <FolderOpen className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-content-primary text-sm font-medium leading-snug">
                      {project.title}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                    <Building2 className="w-3.5 h-3.5" />
                    {department?.name ?? "—"}
                  </div>
                  <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {session?.label ?? "—"}
                  </div>
                  <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                    <Upload className="w-3.5 h-3.5" />
                    {projectSubs.length} submission
                    {projectSubs.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                  <Link
                    href={`/supervisor/submissions/${project.project_id}/review`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Review Submissions
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
            <Users className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            {search || selectedSession
              ? "No students match your search"
              : "No students assigned yet"}
          </p>
          <p className="text-content-secondary text-xs">
            {search || selectedSession
              ? "Try adjusting your filters"
              : "Students will appear here once assigned by the admin"}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}