// ============================================
// MOCK DATA

// Replace service calls with real API later
// ============================================

import {
  User,
  Department,
  AcademicSession,
  Project,
  Submission,
  Feedback,
  RepositoryItem,
  SimilarityReport,
  Approval,
  ActivityLog,
  AuthUser,
} from "./types";

// --- ACADEMIC SESSIONS ---

export const mockSessions: AcademicSession[] = [
  {
    session_id: "session_001",
    label: "2023/2024",
    is_active: false,
    start_date: "2023-09-01",
    end_date: "2024-07-31",
  },
  {
    session_id: "session_002",
    label: "2024/2025",
    is_active: true,
    start_date: "2024-09-01",
    end_date: "2025-07-31",
  },
];

// --- DEPARTMENTS ---

export const mockDepartments: Department[] = [
  {
    department_id: "dept_001",
    name: "Computer Science",
    code: "CSC",
  },
  {
    department_id: "dept_002",
    name: "Information Technology",
    code: "ITC",
  },
  {
    department_id: "dept_003",
    name: "Software Engineering",
    code: "SWE",
  },
];

// --- USERS ---

export const mockUsers: User[] = [
  {
    user_id: "user_001",
    full_name: "Chukwuemeka Obi",
    email: "emeka.obi@student.edu",
    role: "student",
    department_id: "dept_001",
    session_id: "session_002",
    created_at: "2024-09-05T08:00:00Z",
  },
  {
    user_id: "user_002",
    full_name: "Aisha Bello",
    email: "aisha.bello@student.edu",
    role: "student",
    department_id: "dept_002",
    session_id: "session_002",
    created_at: "2024-09-05T08:30:00Z",
  },
  {
    user_id: "user_003",
    full_name: "Dr. Lanre Adeyemi",
    email: "l.adeyemi@staff.edu",
    role: "supervisor",
    department_id: "dept_001",
    session_id: "session_002",
    created_at: "2024-09-01T07:00:00Z",
  },
  {
    user_id: "user_004",
    full_name: "Prof. Ngozi Eze",
    email: "n.eze@staff.edu",
    role: "supervisor",
    department_id: "dept_002",
    session_id: "session_002",
    created_at: "2024-09-01T07:00:00Z",
  },
  {
    user_id: "user_005",
    full_name: "Admin Coordinator",
    email: "admin@staff.edu",
    role: "admin",
    department_id: "dept_001",
    session_id: "session_002",
    created_at: "2024-08-01T07:00:00Z",
  },
];

// --- MOCK AUTH USERS (for login simulation) ---

export const mockAuthUsers: AuthUser[] = [
  {
    user_id: "user_001",
    full_name: "Chukwuemeka Obi",
    email: "emeka.obi@student.edu",
    role: "student",
    department_id: "dept_001",
    session_id: "session_002",
    token: "mock_token_student_001",
  },
  {
    user_id: "user_003",
    full_name: "Dr. Lanre Adeyemi",
    email: "l.adeyemi@staff.edu",
    role: "supervisor",
    department_id: "dept_001",
    session_id: "session_002",
    token: "mock_token_supervisor_003",
  },
  {
    user_id: "user_005",
    full_name: "Admin Coordinator",
    email: "admin@staff.edu",
    role: "admin",
    department_id: "dept_001",
    session_id: "session_002",
    token: "mock_token_admin_005",
  },
];

// --- PROJECTS ---

export const mockProjects: Project[] = [
  {
    project_id: "proj_001",
    title: "Intelligent Traffic Management System Using Machine Learning",
    description:
      "A system that uses ML algorithms to optimize traffic flow at intersections.",
    student_id: "user_001",
    supervisor_id: "user_003",
    department_id: "dept_001",
    session_id: "session_002",
    status: "under_review",
    created_at: "2024-10-01T09:00:00Z",
    updated_at: "2024-11-15T14:00:00Z",
  },
  {
    project_id: "proj_002",
    title: "Blockchain-Based Student Result Management System",
    description:
      "A decentralized approach to storing and verifying academic results.",
    student_id: "user_002",
    supervisor_id: "user_004",
    department_id: "dept_002",
    session_id: "session_002",
    status: "correction_required",
    created_at: "2024-10-03T10:00:00Z",
    updated_at: "2024-11-20T11:00:00Z",
  },
  {
    project_id: "proj_003",
    title: "Smart Library Management System with RFID",
    description:
      "Automating library operations using RFID technology and a web interface.",
    student_id: "user_001",
    supervisor_id: "user_003",
    department_id: "dept_001",
    session_id: "session_001",
    status: "archived",
    created_at: "2023-10-01T09:00:00Z",
    updated_at: "2024-06-30T12:00:00Z",
  },
];

// --- SUBMISSIONS ---

export const mockSubmissions: Submission[] = [
  {
    submission_id: "sub_001",
    project_id: "proj_001",
    submission_type: "topic_proposal",
    chapter_label: "Topic Proposal",
    file_path: "/uploads/sub_001_proposal.pdf",
    file_name: "sub_001_proposal.pdf",
    submitted_at: "2024-10-05T10:00:00Z",
  },
  {
    submission_id: "sub_002",
    project_id: "proj_001",
    submission_type: "chapter_draft",
    chapter_label: "Chapter One",
    file_path: "/uploads/sub_002_chapter1.pdf",
    file_name: "sub_002_chapter1.pdf",
    submitted_at: "2024-11-01T11:00:00Z",
  },
  {
    submission_id: "sub_003",
    project_id: "proj_002",
    submission_type: "chapter_draft",
    chapter_label: "Chapter Two",
    file_path: "/uploads/sub_003_chapter2.pdf",
    file_name: "sub_003_chapter2.pdf",
    submitted_at: "2024-11-10T09:30:00Z",
  },
];

// --- FEEDBACK ---

export const mockFeedback: Feedback[] = [
  {
    feedback_id: "fb_001",
    submission_id: "sub_001",
    supervisor_id: "user_003",
    comments:
      "Good topic choice. Please narrow down the scope to a specific city or region and resubmit the proposal with a clearer problem statement.",
    decision: "correction_required",
    created_at: "2024-10-08T14:00:00Z",
  },
  {
    feedback_id: "fb_002",
    submission_id: "sub_002",
    supervisor_id: "user_003",
    comments:
      "Chapter One is well structured. Background and problem statement are clear. Approved to proceed to Chapter Two.",
    decision: "approve",
    created_at: "2024-11-10T16:00:00Z",
  },
  {
    feedback_id: "fb_003",
    submission_id: "sub_003",
    supervisor_id: "user_004",
    comments:
      "Literature review needs more recent sources (post-2020). Also, the research gap is not clearly identified. Please revise.",
    decision: "correction_required",
    created_at: "2024-11-18T10:00:00Z",
  },
];

// --- REPOSITORY ITEMS ---

export const mockRepositoryItems: RepositoryItem[] = [
  {
    repo_id: "repo_001",
    title: "Smart Library Management System with RFID",
    abstract:
      "This project automates library operations using RFID technology. It covers book tracking, member management, and automated check-in/check-out processes through a web interface.",
    keywords: ["RFID", "library", "automation", "web application"],
    department_id: "dept_001",
    session_id: "session_001",
    student_id: "user_001",
    supervisor_id: "user_003",
    file_path: "/repository/repo_001_smart_library.pdf",
    archived_at: "2024-07-01T12:00:00Z",
  },
  {
    repo_id: "repo_002",
    title: "E-Learning Platform for Secondary Schools in Nigeria",
    abstract:
      "A responsive e-learning platform tailored for Nigerian secondary school students. Features include video lessons, quizzes, progress tracking, and offline access.",
    keywords: ["e-learning", "education", "Nigeria", "secondary school"],
    department_id: "dept_002",
    session_id: "session_001",
    student_id: "user_002",
    supervisor_id: "user_004",
    file_path: "/repository/repo_002_elearning.pdf",
    archived_at: "2024-07-05T12:00:00Z",
  },
  {
    repo_id: "repo_003",
    title: "Hospital Patient Record Management System",
    abstract:
      "A secure digital system for managing patient records in a hospital environment. Supports patient registration, appointment scheduling, and medical history tracking.",
    keywords: ["hospital", "health", "patient records", "management system"],
    department_id: "dept_001",
    session_id: "session_001",
    student_id: "user_001",
    supervisor_id: "user_003",
    file_path: "/repository/repo_003_hospital.pdf",
    archived_at: "2024-07-10T12:00:00Z",
  },
];

// --- SIMILARITY REPORTS ---

export const mockSimilarityReports: SimilarityReport[] = [
  {
    report_id: "sim_001",
    submission_id: "sub_002",
    score: 18,
    matched_sources: [
      {
        source_title: "Smart Library Management System with RFID",
        source_id: "repo_001",
        matched_percentage: 10,
        matched_excerpt:
          "The proposed system aims to automate the process of tracking and managing resources using modern web technologies.",
        source_excerpt:
          "This project automates library operations using web technologies to manage and track resources efficiently.",
      },
      {
        source_title: "E-Learning Platform for Secondary Schools in Nigeria",
        source_id: "repo_002",
        matched_percentage: 8,
        matched_excerpt:
          "The background of the study highlights the need for technology-driven solutions in Nigerian institutions.",
        source_excerpt:
          "Technology-driven solutions are increasingly necessary in Nigerian educational institutions.",
      },
    ],
    generated_at: "2024-11-02T08:00:00Z",
  },
  {
    report_id: "sim_002",
    submission_id: "sub_003",
    score: 34,
    matched_sources: [
      {
        source_title: "Hospital Patient Record Management System",
        source_id: "repo_003",
        matched_percentage: 20,
        matched_excerpt:
          "Blockchain technology provides a decentralized and immutable ledger that can be applied to record management systems.",
        source_excerpt:
          "Decentralized systems offer immutable record-keeping capabilities suitable for sensitive data management.",
      },
      {
        source_title: "Smart Library Management System with RFID",
        source_id: "repo_001",
        matched_percentage: 14,
        matched_excerpt:
          "The literature review presents existing systems and their limitations in managing academic records.",
        source_excerpt:
          "Existing systems have significant limitations in managing and securing academic records.",
      },
    ],
    generated_at: "2024-11-11T09:00:00Z",
  },
];

// --- APPROVALS ---

export const mockApprovals: Approval[] = [
  {
    approval_id: "appr_001",
    project_id: "proj_001",
    approved_by: "user_005",
    stage: "topic",
    status: "approved",
    notes: "Topic approved by coordinator. Student may proceed.",
    approval_date: "2024-10-10T10:00:00Z",
  },
  {
    approval_id: "appr_002",
    project_id: "proj_002",
    approved_by: "user_005",
    stage: "topic",
    status: "pending",
    notes: "",
    approval_date: "",
  },
];

// --- ACTIVITY LOG ---

export const mockActivityLog: ActivityLog[] = [
  {
    log_id: "log_001",
    actor_id: "user_001",
    actor_name: "Chukwuemeka Obi",
    actor_role: "student",
    action: "Submitted topic proposal",
    entity_type: "Submission",
    entity_id: "sub_001",
    timestamp: "2024-10-05T10:00:00Z",
  },
  {
    log_id: "log_002",
    actor_id: "user_003",
    actor_name: "Dr. Lanre Adeyemi",
    actor_role: "supervisor",
    action: "Gave feedback on topic proposal",
    entity_type: "Feedback",
    entity_id: "fb_001",
    timestamp: "2024-10-08T14:00:00Z",
  },
  {
    log_id: "log_003",
    actor_id: "user_005",
    actor_name: "Admin Coordinator",
    actor_role: "admin",
    action: "Approved project topic",
    entity_type: "Approval",
    entity_id: "appr_001",
    timestamp: "2024-10-10T10:00:00Z",
  },
  {
    log_id: "log_004",
    actor_id: "user_001",
    actor_name: "Chukwuemeka Obi",
    actor_role: "student",
    action: "Submitted Chapter One draft",
    entity_type: "Submission",
    entity_id: "sub_002",
    timestamp: "2024-11-01T11:00:00Z",
  },
  {
    log_id: "log_005",
    actor_id: "user_003",
    actor_name: "Dr. Lanre Adeyemi",
    actor_role: "supervisor",
    action: "Approved Chapter One draft",
    entity_type: "Feedback",
    entity_id: "fb_002",
    timestamp: "2024-11-10T16:00:00Z",
  },
];