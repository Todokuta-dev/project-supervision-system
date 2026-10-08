// ============================================
// REPOSITORY SERVICE
// Permanent — not session-bound
// Search must work across all sessions
// ============================================

import { apiFetch } from "@/lib/api-client";
import { RepositoryItem } from "../types";

export async function searchRepository(filters?: {
  keyword?: string;
  department_id?: string;
  session_id?: string;
  supervisor_id?: string;
}): Promise<RepositoryItem[]> {
  const params = new URLSearchParams();

  // keyword, department_id, session_id are supported natively by the
  // backend's search endpoint — session_id is deliberately optional there,
  // so omitting it here means search spans all sessions by default.
  if (filters?.keyword) params.set("keyword", filters.keyword);
  if (filters?.department_id) params.set("department_id", filters.department_id);
  if (filters?.session_id) params.set("session_id", filters.session_id);

  const query = params.toString() ? `?${params.toString()}` : "";
  let results = await apiFetch<RepositoryItem[]>(`/repository-items${query}`, {
    method: "GET",
  });

  // supervisor_id isn't a backend filter — narrow client-side.
  if (filters?.supervisor_id) {
    results = results.filter((r) => r.supervisor_id === filters.supervisor_id);
  }

  return results;
}

export async function getRepositoryItemById(
  id: string
): Promise<RepositoryItem | null> {
  try {
    return await apiFetch<RepositoryItem>(`/repository-items/${id}`, {
      method: "GET",
    });
  } catch {
    return null;
  }
}

// There is no manual "archive" action on the backend — archiving happens
// automatically, atomically, after a final approval or approval of final
// submission feedback. This function just confirms
// and returns the item that was already created by that process, matched
// by project id so matching project titles cannot select the wrong record.
export async function archiveToRepository(
  data: Omit<RepositoryItem, "repo_id" | "archived_at" | "project_id"> & {
    project_id: string;
  }
): Promise<RepositoryItem> {
  const results = await searchRepository({
    department_id: data.department_id,
    session_id: data.session_id,
  });

  const match = results.find(
    (r) => r.project_id === data.project_id
  );

  if (!match) {
    throw new Error(
      "No repository item was found. Archiving happens automatically after final approval. Make sure that step has completed first."
    );
  }

  return match;
}

export async function deleteRepositoryItem(repo_id: string): Promise<void> {
  await apiFetch<void>(`/repository-items/${repo_id}`, {
    method: "DELETE",
  });
}
