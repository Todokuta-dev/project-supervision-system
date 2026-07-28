// ============================================
// APPROVALS SERVICE
// ============================================

import { apiFetch, ApiError } from "@/lib/api-client";
import { Approval, ApprovalStatus } from "../types";

export async function getApprovals(filters?: {
  project_id?: string;
  status?: ApprovalStatus;
}): Promise<Approval[]> {
  // Backend already scopes by role (student sees own, supervisor sees
  // assigned, admin sees all) — these filters narrow further, client-side.
  let results = await apiFetch<Approval[]>("/approvals", { method: "GET" });

  if (filters?.project_id) {
    results = results.filter((a) => a.project_id === filters.project_id);
  }
  if (filters?.status) {
    results = results.filter((a) => a.status === filters.status);
  }

  return results;
}

export async function getApprovalById(id: string): Promise<Approval | null> {
  try {
    return await apiFetch<Approval>(`/approvals/${id}`, { method: "GET" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function updateApproval(
  approval_id: string,
  data: { status: ApprovalStatus; notes: string; approved_by?: string }
): Promise<Approval> {
  // approved_by is accepted here for signature compatibility with existing
  // callers, but the backend ignores it — it always stamps the authenticated
  // user's own id, never trusting the client for who's performing the action.
  return apiFetch<Approval>(`/approvals/${approval_id}`, {
    method: "PUT",
    body: { status: data.status, notes: data.notes },
  });
}

export async function createApproval(
  data: Omit<Approval, "approval_id" | "approval_date">
): Promise<Approval> {
  return apiFetch<Approval>("/approvals", {
    method: "POST",
    body: data,
  });
}