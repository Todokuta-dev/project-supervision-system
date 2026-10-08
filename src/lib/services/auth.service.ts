// ============================================
// AUTH SERVICE
// ============================================

import { apiFetch } from "@/lib/api-client";
import { AuthUser } from "@/lib/types";

interface LaravelAuthResponse {
  user: {
    user_id: string;
    full_name: string;
    email: string;
    role: "student" | "supervisor" | "admin";
    department_id: string;
    session_id: string;
  };
}

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: "student" | "supervisor";
  department_id: string;
  session_id: string;
}

function apiOrigin(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  return apiUrl.replace(/\/api\/?$/, "");
}

async function prepareCsrfCookie(): Promise<void> {
  const response = await fetch(`${apiOrigin()}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Could not start a secure session. Please try again.");
  }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  await prepareCsrfCookie();
  const res = await apiFetch<LaravelAuthResponse>("/login", {
    method: "POST",
    body: { email, password },
  });
  return res.user;
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/logout", { method: "POST" });
}

export async function getMe(): Promise<AuthUser> {
  const res = await apiFetch<LaravelAuthResponse["user"]>("/user", {
    method: "GET",
  });
  return res;
}


export async function register(payload: RegisterPayload): Promise<AuthUser> {
  await prepareCsrfCookie();
  const res = await apiFetch<LaravelAuthResponse>("/register", {
    method: "POST",
    body: payload,
  });
  return res.user;
}
