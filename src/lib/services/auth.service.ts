// ============================================
// AUTH SERVICE
// Mock now → swap fetch calls for real
// Laravel Sanctum endpoints later
// ============================================

import { AuthUser } from "../types";
import { mockAuthUsers } from "../mock-data";

export async function login(
  email: string,
  password: string
): Promise<AuthUser> {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 800));

  const user = mockAuthUsers.find((u) => u.email === email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Real implementation:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ email, password }),
  // });
  // if (!res.ok) throw new Error("Invalid email or password");
  // return res.json();

  return user;
}

export async function logout(): Promise<void> {
  await new Promise((res) => setTimeout(res, 400));

  // Real implementation:
  // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
  //   method: "POST",
  //   headers: { Authorization: `Bearer ${token}` },
  // });
}

export async function getMe(token: string): Promise<AuthUser | null> {
  await new Promise((res) => setTimeout(res, 400));

  const user = mockAuthUsers.find((u) => u.token === token);
  return user ?? null;

  // Real implementation:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
  //   headers: { Authorization: `Bearer ${token}` },
  // });
  // if (!res.ok) return null;
  // return res.json();
}