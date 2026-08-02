// ============================================
// USERS SERVICE
// Admin-only user directory (for assigning
// supervisors, displaying names, etc.)
// ============================================

import { apiFetch } from "@/lib/api-client";
import { User, UserRole } from "@/lib/types";

export async function getUsers(filters?: { role?: UserRole }): Promise<User[]> {
  const params = new URLSearchParams();
  if (filters?.role) {
    params.set("role", filters.role);
  }
  const query = params.toString() ? `?${params.toString()}` : "";

  return apiFetch<User[]>(`/users${query}`, { method: "GET" });
}