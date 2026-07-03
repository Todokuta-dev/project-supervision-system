// ============================================
// SUBMISSIONS SERVICE
// ============================================

import { Submission } from "../types";
import { mockSubmissions } from "../mock-data";

export async function getSubmissions(filters?: {
  project_id?: string;
}): Promise<Submission[]> {
  await new Promise((res) => setTimeout(res, 600));

  let results = [...mockSubmissions];

  if (filters?.project_id) {
    results = results.filter((s) => s.project_id === filters.project_id);
  }

  return results;
}

export async function getSubmissionById(
  id: string
): Promise<Submission | null> {
  await new Promise((res) => setTimeout(res, 400));

  return mockSubmissions.find((s) => s.submission_id === id) ?? null;
}

export async function createSubmission(
  data: Omit<Submission, "submission_id" | "submitted_at">
): Promise<Submission> {
  await new Promise((res) => setTimeout(res, 800));

  const newSubmission: Submission = {
    ...data,
    submission_id: `sub_${Date.now()}`,
    submitted_at: new Date().toISOString(),
  };

  mockSubmissions.push(newSubmission);
  return newSubmission;
}