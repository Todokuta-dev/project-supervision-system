// ============================================
// ACTIVITY LOG SERVICE
// Admin-only audit trail — read-only, immutable.
// Entries are created automatically by backend
// observers whenever a Project/Submission/
// Feedback/Approval is created or updated.
// ============================================

import { apiFetch } from "@/lib/api-client";
import { ActivityLog } from "../types";

export async function getActivityLogs(): Promise<ActivityLog[]> {
  return apiFetch<ActivityLog[]>("/activity-logs", { method: "GET" });
}