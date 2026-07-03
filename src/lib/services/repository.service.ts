// ============================================
// REPOSITORY SERVICE
// Permanent — not session-bound
// Search must work across all sessions
// ============================================

import { RepositoryItem } from "../types";
import { mockRepositoryItems } from "../mock-data";

export async function searchRepository(filters?: {
  keyword?: string;
  department_id?: string;
  session_id?: string;
  supervisor_id?: string;
}): Promise<RepositoryItem[]> {
  await new Promise((res) => setTimeout(res, 700));

  let results = [...mockRepositoryItems];

  if (filters?.keyword) {
    const kw = filters.keyword.toLowerCase();
    results = results.filter(
      (r) =>
        r.title.toLowerCase().includes(kw) ||
        r.abstract.toLowerCase().includes(kw) ||
        r.keywords.some((k) => k.toLowerCase().includes(kw))
    );
  }

  if (filters?.department_id) {
    results = results.filter((r) => r.department_id === filters.department_id);
  }

  if (filters?.session_id) {
    results = results.filter((r) => r.session_id === filters.session_id);
  }

  if (filters?.supervisor_id) {
    results = results.filter((r) => r.supervisor_id === filters.supervisor_id);
  }

  return results;
}

export async function getRepositoryItemById(
  id: string
): Promise<RepositoryItem | null> {
  await new Promise((res) => setTimeout(res, 400));

  return mockRepositoryItems.find((r) => r.repo_id === id) ?? null;
}

export async function archiveToRepository(
  data: Omit<RepositoryItem, "repo_id" | "archived_at">
): Promise<RepositoryItem> {
  await new Promise((res) => setTimeout(res, 800));

  const newItem: RepositoryItem = {
    ...data,
    repo_id: `repo_${Date.now()}`,
    archived_at: new Date().toISOString(),
  };

  mockRepositoryItems.push(newItem);
  return newItem;
}