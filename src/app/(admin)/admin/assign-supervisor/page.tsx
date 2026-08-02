"use client";

import { useEffect, useState } from "react";
import { getProjects, assignSupervisor } from "@/lib/services/projects.service";
import { getUsers } from "@/lib/services/users.service";
import { getDepartments } from "@/lib/services/reference.service";
import { Project, User, Department } from "@/lib/types";
import { motion } from "framer-motion";
import { UserPlus, FolderOpen, CheckCircle2 } from "lucide-react";

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

export default function AssignSupervisorPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allProjects, allSupervisors, allDepartments] = await Promise.all([
          getProjects(),
          getUsers({ role: "supervisor" }),
          getDepartments(),
        ]);
        setProjects(allProjects);
        setSupervisors(allSupervisors);
        setDepartments(allDepartments);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const departmentName = (id: string) =>
    departments.find((d) => d.department_id === id)?.name ?? "Unknown Department";

  const unassigned = projects.filter((p) => !p.supervisor_id);

  const handleAssign = async (project_id: string) => {
    const supervisor_id = selected[project_id];
    if (!supervisor_id) return;

    setSubmittingId(project_id);
    try {
      const updated = await assignSupervisor(project_id, supervisor_id);
      setProjects((prev) =>
        prev.map((p) => (p.project_id === project_id ? updated : p))
      );
      setSuccessMsg("Supervisor assigned successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } finally {
      setSubmittingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">
          Assign Supervisors
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Match unassigned student projects with a supervisor from the same department.
        </p>
      </motion.div>

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

      {unassigned.length > 0 ? (
        <div className="space-y-4">
          {unassigned.map((project) => {
            const matchingSupervisors = supervisors.filter(
              (s) => s.department_id === project.department_id
            );

            return (
              <motion.div
                key={project.project_id}
                variants={cardVariants}
                className="bg-background-surface rounded-2xl border border-border p-5 space-y-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/8 border border-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-content-primary text-sm font-semibold leading-snug">
                      {project.title}
                    </p>
                    <p className="text-content-secondary text-xs mt-0.5">
                      {departmentName(project.department_id)} · {project.status.replace("_", " ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selected[project.project_id] ?? ""}
                    onChange={(e) =>
                      setSelected((prev) => ({
                        ...prev,
                        [project.project_id]: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    <option value="">
                      {matchingSupervisors.length > 0
                        ? "Select supervisor"
                        : "No supervisors in this department"}
                    </option>
                    {matchingSupervisors.map((s) => (
                      <option key={s.user_id} value={s.user_id}>
                        {s.full_name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleAssign(project.project_id)}
                    disabled={
                      !selected[project.project_id] ||
                      submittingId === project.project_id
                    }
                    className="flex items-center gap-1.5 bg-primary hover:bg-primary-light text-white font-semibold px-4 py-2 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  >
                    {submittingId === project.project_id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Assign
                      </>
                    )}
                  </button>
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
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <p className="text-content-primary font-semibold text-sm mb-1">
            All projects are assigned
          </p>
          <p className="text-content-secondary text-xs">
            New unassigned projects will appear here.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}