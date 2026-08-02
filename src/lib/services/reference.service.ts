// ============================================
// REFERENCE DATA SERVICE
// Departments & academic sessions (public, no auth)
// ============================================

import { apiFetch } from "@/lib/api-client";
import { Department, AcademicSession } from "@/lib/types";

export async function getDepartments(): Promise<Department[]> {
  return apiFetch<Department[]>("/departments", {
    method: "GET",
    skipAuth: true,
  });
}

export async function getActiveSession(): Promise<AcademicSession> {
  return apiFetch<AcademicSession>("/academic-sessions/active", {
    method: "GET",
    skipAuth: true,
  });
}

export async function createDepartment(data: {
  name: string;
  code: string;
}): Promise<Department> {
  return apiFetch<Department>("/departments", {
    method: "POST",
    body: data,
  });
}

export async function updateDepartment(
  department_id: string,
  data: { name: string; code: string }
): Promise<Department> {
  return apiFetch<Department>(`/departments/${department_id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteDepartment(department_id: string): Promise<void> {
  await apiFetch<void>(`/departments/${department_id}`, {
    method: "DELETE",
  });
}