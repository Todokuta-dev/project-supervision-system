"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getProjects } from "@/lib/services/projects.service";
import { getUsers } from "@/lib/services/users.service";
import { getDepartments, getActiveSession, getAllSessions } from "@/lib/services/reference.service";
import { Project, User, Department, AcademicSession } from "@/lib/types";
import StatusBadge from "@/components/ui/StatusBadge";
import { motion } from "framer-motion";
import {
  FolderOpen,
  ArrowRight,
  Clock,
  User as UserIcon,
  Building2,
  CalendarDays,
  Plus,
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

export default function StudentProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeSession, setActiveSession] = useState<AcademicSession | null>(null);
  const [allSessions, setAllSessions] = useState<AcademicSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [data, allUsers, allDepartments, session, sessions] = await Promise.all([
          getProjects({ student_id: user.user_id }),
          getUsers(),
          getDepartments(),
          getActiveSession().catch(() => null),
          getAllSessions().catch(() => []),
        ]);
        setProjects(data);
        setUsers(allUsers);
        setDepartments(allDepartments);
        setActiveSession(session);
        setAllSessions(sessions);
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

  const currentProject = projects.find(
    (p) => p.session_id === activeSession?.session_id
  );
  const pastProjects = projects.filter(
    (p) => p.session_id !== activeSession?.session_id
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-content-primary text-2xl font-bold">
            My Projects
          </h1>
          <p className="text-content-secondary text-sm mt-1">
            Your current and past final year projects
          </p>
        </div>
        {!currentProject && (
          <Link
            href="/student/topics/new"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Submit Topic
          </Link>
        )}
      </motion.div>

      {/* Current Session Project */}
      <motion.div variants={cardVariants}>
        <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider mb-3">
          Current Session — {activeSession?.label ?? "—"}
        </p>

        {currentProject ? (
          <div className="bg-background-surface rounded-2xl border border-border p-6 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-content-primary font-bold text-base leading-snug truncate">
                    {currentProject.title}
                  </h2>
                  <p className="text-content-secondary text-xs mt-0.5">
                    Active project
                  </p>
                </div>
              </div>
              <StatusBadge status={currentProject.status} />
            </div>

            <p className="text-content-secondary text-sm leading-relaxed mb-4">
              {currentProject.description}
            </p>

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-3.5 h-3.5 text-content-secondary flex-shrink-0" />
                <div>
                  <p className="text-content-secondary text-xs">Supervisor</p>
                  <p className="text-content-primary text-xs font-medium">
                    {users.find(
                      (u) => u.user_id === currentProject.supervisor_id
                    )?.full_name ?? "Not assigned"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-content-secondary flex-shrink-0" />
                <div>
                  <p className="text-content-secondary text-xs">Department</p>
                  <p className="text-content-primary text-xs font-medium">
                    {departments.find(
                      (d) => d.department_id === currentProject.department_id
                    )?.code ?? "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-content-secondary flex-shrink-0" />
                <div>
                  <p className="text-content-secondary text-xs">Started</p>
                  <p className="text-content-primary text-xs font-medium">
                    {new Date(currentProject.created_at).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" }
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={`/student/projects/${currentProject.project_id}`}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              View Project
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="bg-background-surface rounded-2xl border border-dashed border-border p-10 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
              <FolderOpen className="w-6 h-6 text-primary" />
            </div>
            <p className="text-content-primary font-semibold text-sm mb-1">
              No active project
            </p>
            <p className="text-content-secondary text-xs mb-4">
              You have not submitted a topic for the current session yet
            </p>
            <Link
              href="/student/topics/new"
              className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition"
            >
              Submit Topic Proposal
            </Link>
          </div>
        )}
      </motion.div>

      {/* Past Projects */}
      {pastProjects.length > 0 && (
        <motion.div variants={cardVariants}>
          <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider mb-3">
            Past Projects
          </p>
          <div className="space-y-3">
            {pastProjects.map((project) => {
              const session = allSessions.find(
                (s) => s.session_id === project.session_id
              );
              return (
                <div
                  key={project.project_id}
                  className="bg-background-surface rounded-2xl border border-border p-5 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 bg-background border border-border rounded-xl flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-content-secondary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-content-primary font-semibold text-sm truncate">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="flex items-center gap-1 text-content-secondary text-xs">
                            <CalendarDays className="w-3 h-3" />
                            {session?.label ?? "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusBadge status={project.status} size="sm" />
                      <Link
                        href={`/student/projects/${project.project_id}`}
                        className="text-xs font-semibold text-primary hover:text-primary-light transition flex items-center gap-1"
                      >
                        View
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}