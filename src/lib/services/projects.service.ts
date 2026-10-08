// ============================================
// PROJECTS SERVICE
// ============================================

import { apiFetch, ApiError } from "@/lib/api-client";
import { Project, ProjectStatus } from "../types";

export async function getProjects(filters?: {
  student_id?: string;
  supervisor_id?: string;
  session_id?: string;
  department_id?: string;
  status?: ProjectStatus;
}): Promise<Project[]> {
  // Backend already scopes results by role (student sees own, supervisor sees
  // assigned, admin sees all) — these filters narrow further, client-side.
  let results = await apiFetch<Project[]>("/projects", { method: "GET" });

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
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    return await apiFetch<Project>(`/projects/${id}`, { method: "GET" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createProject(
  data: Omit<Project, "project_id" | "created_at" | "updated_at" | "status" | "supervisor_id"> & {
    supervisor_id?: string;
  }
): Promise<Project> {
  return apiFetch<Project>("/projects", {
    method: "POST",
    body: data,
  });
}

export async function assignSupervisor(
  project_id: string,
  supervisor_id: string
): Promise<Project> {
  return apiFetch<Project>(`/projects/${project_id}/assign-supervisor`, {
    method: "PUT",
    body: { supervisor_id },
  });
}
