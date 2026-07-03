// ============================================
// FEEDBACK SERVICE
// ============================================

import { Feedback } from "../types";
import { mockFeedback } from "../mock-data";

export async function getFeedback(filters?: {
  submission_id?: string;
  supervisor_id?: string;
}): Promise<Feedback[]> {
  await new Promise((res) => setTimeout(res, 600));

  let results = [...mockFeedback];

  if (filters?.submission_id) {
    results = results.filter((f) => f.submission_id === filters.submission_id);
  }
  if (filters?.supervisor_id) {
    results = results.filter((f) => f.supervisor_id === filters.supervisor_id);
  }

  return results;
}

export async function getFeedbackById(id: string): Promise<Feedback | null> {
  await new Promise((res) => setTimeout(res, 400));

  return mockFeedback.find((f) => f.feedback_id === id) ?? null;
}

export async function createFeedback(
  data: Omit<Feedback, "feedback_id" | "created_at">
): Promise<Feedback> {
  await new Promise((res) => setTimeout(res, 800));

  const newFeedback: Feedback = {
    ...data,
    feedback_id: `fb_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  mockFeedback.push(newFeedback);
  return newFeedback;
}