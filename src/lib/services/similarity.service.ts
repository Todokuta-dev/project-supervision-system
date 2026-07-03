// ============================================
// SIMILARITY SERVICE
// Always returns matched sources + excerpts
// Never just a raw score
// ============================================

import { SimilarityReport } from "../types";
import { mockSimilarityReports } from "../mock-data";

export async function getSimilarityReport(
  submission_id: string
): Promise<SimilarityReport | null> {
  await new Promise((res) => setTimeout(res, 600));

  return (
    mockSimilarityReports.find((r) => r.submission_id === submission_id) ?? null
  );
}

export async function getSimilarityReportById(
  report_id: string
): Promise<SimilarityReport | null> {
  await new Promise((res) => setTimeout(res, 400));

  return (
    mockSimilarityReports.find((r) => r.report_id === report_id) ?? null
  );
}

export async function generateSimilarityReport(
  submission_id: string
): Promise<SimilarityReport> {
  // Simulates async report generation
  await new Promise((res) => setTimeout(res, 2000));

  const existing = mockSimilarityReports.find(
    (r) => r.submission_id === submission_id
  );

  if (existing) return existing;

  // Fallback mock for new submissions
  const newReport: SimilarityReport = {
    report_id: `sim_${Date.now()}`,
    submission_id,
    score: 12,
    matched_sources: [
      {
        source_title: "Sample Repository Item",
        source_id: "repo_001",
        matched_percentage: 12,
        matched_excerpt: "Sample matched text from submitted document.",
        source_excerpt: "Sample matching text from repository source.",
      },
    ],
    generated_at: new Date().toISOString(),
  };

  mockSimilarityReports.push(newReport);
  return newReport;
}