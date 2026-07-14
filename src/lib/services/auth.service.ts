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
  token: string;
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

function flattenAuthResponse(res: LaravelAuthResponse): AuthUser {
  return {
    ...res.user,
    token: res.token,
  };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await apiFetch<LaravelAuthResponse>("/login", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
  return flattenAuthResponse(res);
}

export async function logout(): Promise<void> {
  await apiFetch<void>("/logout", { method: "POST" });
}

export async function getMe(token: string): Promise<AuthUser> {
  const res = await apiFetch<LaravelAuthResponse["user"]>("/user", {
    method: "GET",
  });
  return { ...res, token };
}


export async function register(payload: RegisterPayload): Promise<AuthUser> {
  const res = await apiFetch<LaravelAuthResponse>("/register", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
  return flattenAuthResponse(res);
}