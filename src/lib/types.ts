// ============================================
// CORE ENTITY TYPES
// Mirrors Chapter 4, Table 4.2 exactly
// This file is the data contract between
// frontend and backend (Laravel API)
// ============================================

// --- ENUMS ---

export type UserRole = "student" | "supervisor" | "admin";

export type ProjectStatus =
  | "topic_pending"
  | "under_review"
  | "correction_required"
  | "approved"
  | "archived";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type SubmissionType =
  | "topic_proposal"
  | "chapter_draft"
  | "final_submission";

// --- ENTITIES ---

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string;
  session_id: string;
  created_at: string;
}

export interface Department {
  department_id: string;
  name: string;
  code: string;
}

export interface AcademicSession {
  session_id: string;
  label: string; // e.g. "2024/2025"
  is_active: boolean;
  start_date: string;
  end_date: string;
}

export interface Project {
  project_id: string;
  title: string;
  description: string;
  student_id: string;
  supervisor_id: string;
  department_id: string;
  session_id: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  submission_id: string;
  project_id: string;
  submission_type: SubmissionType;
  chapter_label: string;
  file_path: string;
  file_name: string;
  submitted_at: string;
}

export interface Feedback {
  feedback_id: string;
  submission_id: string;
  supervisor_id: string;
  comments: string;
  decision: "approve" | "correction_required";
  created_at: string;
}

export interface RepositoryItem {
  repo_id: string;
  title: string;
  abstract: string;
  keywords: string[];
  department_id: string;
  session_id: string;
  student_id: string;
  supervisor_id: string;
  file_path: string;
  archived_at: string;
}

export interface SimilarityReport {
  report_id: string;
  submission_id: string;
  score: number; // 0-100 percentage
  matched_sources: MatchedSource[];
  generated_at: string;
}

export interface MatchedSource {
  source_title: string;
  source_id: string;
  matched_percentage: number;
  matched_excerpt: string;
  source_excerpt: string;
}

export interface Approval {
  approval_id: string;
  project_id: string;
  approved_by: string; // user_id of admin/supervisor
  stage: string; // e.g. "topic", "final"
  status: ApprovalStatus;
  notes: string;
  approval_date: string;
}

// --- AUDIT / ACTIVITY TRAIL ---

export interface ActivityLog {
  log_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
}

// --- AUTH ---

export interface AuthUser {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id: string;
  session_id: string;
  token: string;
}