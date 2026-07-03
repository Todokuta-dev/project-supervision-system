// ============================================
// PROJECTS SERVICE
// ============================================

import { Project, ProjectStatus } from "../types";
import { mockProjects } from "../mock-data";

export async function getProjects(filters?: {
  student_id?: string;
  supervisor_id?: string;
  session_id?: string;
  department_id?: string;
  status?: ProjectStatus;
}): Promise<Project[]> {
  await new Promise((res) => setTimeout(res, 600));

  let results = [...mockProjects];

  if (filters?.student_id) {
    results = results.filter((p) => p.student_id === filters.student_id);
  }
  if (filters?.supervisor_id) {
    results = results.filter((p) => p.supervisor_id === filters.supervisor_id);
  }
  if (filters?.session_id) {
    results = results.filter((p) => p.session_id === filters.session_id);
  }
  if (filters?.department_id) {
    results = results.filter((p) => p.department_id === filters.department_id);
  }
  if (filters?.status) {
    results = results.filter((p) => p.status === filters.status);
  }

  return results;

  // Real implementation:
  // const params = new URLSearchParams(filters as Record<string, string>);
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?${params}`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // return res.json();
}

export async function getProjectById(id: string): Promise<Project | null> {
  await new Promise((res) => setTimeout(res, 400));

  return mockProjects.find((p) => p.project_id === id) ?? null;
}

export async function createProject(
  data: Omit<Project, "project_id" | "created_at" | "updated_at" | "status">
): Promise<Project> {
  await new Promise((res) => setTimeout(res, 800));

  const newProject: Project = {
    ...data,
    project_id: `proj_${Date.now()}`,
    status: "topic_pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockProjects.push(newProject);
  return newProject;
}

export async function updateProjectStatus(
  project_id: string,
  status: ProjectStatus
): Promise<Project> {
  await new Promise((res) => setTimeout(res, 600));

  const project = mockProjects.find((p) => p.project_id === project_id);
  if (!project) throw new Error("Project not found");

  project.status = status;
  project.updated_at = new Date().toISOString();
  return project;
}