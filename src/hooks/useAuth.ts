// ============================================
// useAuth HOOK
// Convenient access to auth context
// Use this in every component that needs
// the logged-in user or auth actions
// ============================================

import { useAuthContext } from "@/context/auth.context";
import { UserRole } from "@/lib/types";

export function useAuth() {
  const { user, isLoading, login, logout } = useAuthContext();

  const isAuthenticated = !!user;
  const role: UserRole | null = user?.role ?? null;

  const isStudent = role === "student";
  const isSupervisor = role === "supervisor";
  const isAdmin = role === "admin";

  return {
    user,
    isLoading,
    isAuthenticated,
    role,
    isStudent,
    isSupervisor,
    isAdmin,
    login,
    logout,
  };
}