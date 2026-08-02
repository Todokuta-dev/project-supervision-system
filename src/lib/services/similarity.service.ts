// ============================================
// SIMILARITY SERVICE
// Always returns matched sources + excerpts
// Never just a raw score
// ============================================

import { apiFetch, ApiError } from "@/lib/api-client";
import { SimilarityReport } from "../types";

// Laravel serializes decimal columns as strings (e.g. "12.50") — normalize
// to a real number here so every caller can do numeric comparisons safely.
function normalizeReport(raw: SimilarityReport & { score: number | string }): SimilarityReport {
  return {
    ...raw,
    score: typeof raw.score === "string" ? parseFloat(raw.score) : raw.score,
  };
}

export async function getSimilarityReport(
  submission_id: string
): Promise<SimilarityReport | null> {
  // Backend has no per-submission filter endpoint — fetch the (role-scoped)
  // list and find the matching one client-side, same pattern used elsewhere.
  const all = await apiFetch<SimilarityReport[]>("/similarity-reports", {
    method: "GET",
  });

  const match = all.find((r) => r.submission_id === submission_id);
  return match ? normalizeReport(match) : null;
}

export async function getSimilarityReportById(
  report_id: string
): Promise<SimilarityReport | null> {
  try {
    const report = await apiFetch<SimilarityReport>(
      `/similarity-reports/${report_id}`,
      { method: "GET" }
    );
    return normalizeReport(report);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

// There is no manual "generate" action on the backend — a placeholder report
// (score: 0, no matched sources) is created automatically the instant a
// submission is made. This function just fetches that existing report.
// A real similarity engine can replace the auto-creation logic on the
// backend later without needing any change here.
export async function generateSimilarityReport(
  submission_id: string
): Promise<SimilarityReport> {
  const report = await getSimilarityReport(submission_id);

  if (!report) {
    throw new Error(
      "No similarity report found for this submission. It should have been created automatically when the submission was made."
    );
  }

  return report;
}