// ============================================
// APPROVALS SERVICE
// ============================================

import { Approval, ApprovalStatus } from "../types";
import { mockApprovals } from "../mock-data";

export async function getApprovals(filters?: {
  project_id?: string;
  status?: ApprovalStatus;
}): Promise<Approval[]> {
  await new Promise((res) => setTimeout(res, 600));

  let results = [...mockApprovals];

  if (filters?.project_id) {
    results = results.filter((a) => a.project_id === filters.project_id);
  }
  if (filters?.status) {
    results = results.filter((a) => a.status === filters.status);
  }

  return results;
}

export async function getApprovalById(id: string): Promise<Approval | null> {
  await new Promise((res) => setTimeout(res, 400));

  return mockApprovals.find((a) => a.approval_id === id) ?? null;
}

export async function updateApproval(
  approval_id: string,
  data: { status: ApprovalStatus; notes: string; approved_by: string }
): Promise<Approval> {
  await new Promise((res) => setTimeout(res, 700));

  const approval = mockApprovals.find((a) => a.approval_id === approval_id);
  if (!approval) throw new Error("Approval not found");

  approval.status = data.status;
  approval.notes = data.notes;
  approval.approved_by = data.approved_by;
  approval.approval_date = new Date().toISOString();

  return approval;
}

export async function createApproval(
  data: Omit<Approval, "approval_id" | "approval_date">
): Promise<Approval> {
  await new Promise((res) => setTimeout(res, 800));

  const newApproval: Approval = {
    ...data,
    approval_id: `appr_${Date.now()}`,
    approval_date: new Date().toISOString(),
  };

  mockApprovals.push(newApproval);
  return newApproval;
}