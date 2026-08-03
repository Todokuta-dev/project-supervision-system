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

export async function getAllSessions(): Promise<AcademicSession[]> {
  return apiFetch<AcademicSession[]>("/academic-sessions", { method: "GET" });
}

export async function createSession(data: {
  label: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}): Promise<AcademicSession> {
  return apiFetch<AcademicSession>("/academic-sessions", {
    method: "POST",
    body: data,
  });
}

export async function updateSession(
  session_id: string,
  data: { label: string; start_date: string; end_date: string; is_active: boolean }
): Promise<AcademicSession> {
  return apiFetch<AcademicSession>(`/academic-sessions/${session_id}`, {
    method: "PUT",
    body: data,
  });
}

export async function setActiveSession(session_id: string): Promise<AcademicSession> {
  return apiFetch<AcademicSession>(`/academic-sessions/${session_id}/set-active`, {
    method: "PUT",
    body: {},
  });
}

export async function deleteSession(session_id: string): Promise<void> {
  await apiFetch<void>(`/academic-sessions/${session_id}`, {
    method: "DELETE",
  });
}