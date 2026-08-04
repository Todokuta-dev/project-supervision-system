// ============================================
// SUBMISSIONS SERVICE
// ============================================

import { apiFetch, ApiError } from "@/lib/api-client";
import { Submission } from "../types";

export async function getSubmissions(filters?: {
  project_id?: string;
}): Promise<Submission[]> {
  // Backend already scopes by role (student sees own, supervisor sees
  // assigned, admin sees all) — this filter narrows further, client-side.
  let results = await apiFetch<Submission[]>("/submissions", { method: "GET" });

  if (filters?.project_id) {
    results = results.filter((s) => s.project_id === filters.project_id);
  }

  return results;
}

export async function getSubmissionById(
  id: string
): Promise<Submission | null> {
  try {
    return await apiFetch<Submission>(`/submissions/${id}`, { method: "GET" });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createSubmission(data: {
  project_id: string;
  submission_type: string;
  chapter_label?: string;
  file: File;
}): Promise<Submission> {
  const formData = new FormData();
  formData.append("project_id", data.project_id);
  formData.append("submission_type", data.submission_type);
  if (data.chapter_label) {
    formData.append("chapter_label", data.chapter_label);
  }
  formData.append("file", data.file);

  return apiFetch<Submission>("/submissions", {
    method: "POST",
    body: formData,
  });
}