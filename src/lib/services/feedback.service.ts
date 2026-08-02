// ============================================
// FEEDBACK SERVICE
// ============================================

import { apiFetch, ApiError } from "@/lib/api-client";
import { Feedback } from "../types";

export async function getFeedback(filters?: {
  submission_id?: string;
  supervisor_id?: string;
}): Promise<Feedback[]> {
  // Backend already scopes by role (student sees own, supervisor sees
  // assigned, admin sees all) — these filters narrow further, client-side.
  let results = await apiFetch<Feedback[]>("/feedback", { method: "GET" });

  if (filters?.submission_id) {
    results = results.filter((f) => f.submission_id === filters.submission_id);
  }
  if (filters?.supervisor_id) {
    results = results.filter((f) => f.supervisor_id === filters.supervisor_id);
  }

  return results;
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  try {
    return await apiFetch<Feedback>(`/feedback/${id}`, { method: "GET" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createFeedback(
  data: Omit<Feedback, "feedback_id" | "created_at">
): Promise<Feedback> {
  return apiFetch<Feedback>("/feedback", {
    method: "POST",
    body: data,
  });
}