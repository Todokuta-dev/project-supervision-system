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