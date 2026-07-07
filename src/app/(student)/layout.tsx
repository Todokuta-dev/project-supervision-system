"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  Upload,
  MessageSquare,
  Library,
  LogOut,
  GraduationCap,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  {
    href: "/student/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/student/projects",
    label: "My Project",
    icon: FolderOpen,
  },
  {
    href: "/student/submissions",
    label: "Submissions",
    icon: Upload,
  },
  {
    href: "/student/feedback",
    label: "Feedback",
    icon: MessageSquare,
  },
  {
    href: "/student/repository",
    label: "Repository",
    icon: Library,
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout, isStudent } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Route protection
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!isStudent) {
      if (user.role === "supervisor") router.replace("/supervisor/dashboard");
      if (user.role === "admin") router.replace("/admin/dashboard");
    }
  }, [user, isLoading, isStudent, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Current page title from nav
  const currentPage =
    navLinks.find((link) => pathname.startsWith(link.href))?.label ??
    "Dashboard";

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

{/* --- SIDEBAR --- */}
<aside
 className={`fixed top-0 left-0 h-full w-64 bg-primary z-30 flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-auto ${
  sidebarOpen ? "translate-x-0" : "-translate-x-full"
}`}
>
  {/* Logo */}
  <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-white font-bold text-sm leading-tight">
          AAUA PSR
        </p>
        <p className="text-white/40 text-xs">Student Portal</p>
      </div>
    </div>
    <button
      onClick={() => setSidebarOpen(false)}
      className="text-white/60 hover:text-white lg:hidden"
    >
      <X className="w-5 h-5" />
    </button>
  </div>

  {/* Nav Links */}
  <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    {navLinks.map((link) => {
      const Icon = link.icon;
      const isActive = pathname.startsWith(link.href);

      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
            isActive
              ? "bg-white/15 text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon
            className={`w-4 h-4 flex-shrink-0 ${
              isActive
                ? "text-accent"
                : "text-white/50 group-hover:text-white/80"
            }`}
          />
          {link.label}
          {isActive && (
            <ChevronRight className="w-3 h-3 ml-auto text-accent" />
          )}
        </Link>
      );
    })}
  </nav>

  {/* User + Logout */}
  <div className="px-3 py-4 border-t border-white/10">
    <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
        <span className="text-accent text-xs font-bold">
          {user.full_name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="overflow-hidden">
        <p className="text-white text-sm font-medium truncate">
          {user.full_name}
        </p>
        <p className="text-white/40 text-xs truncate">{user.email}</p>
      </div>
    </div>

    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  </div>
</aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">

        {/* Top Header */}
        <header className="bg-background-surface border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-content-secondary hover:text-content-primary lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-content-primary font-bold text-lg leading-tight">
                {currentPage}
              </h1>
              <p className="text-content-secondary text-xs">
                Welcome back, {user.full_name.split(" ")[0]}
              </p>
            </div>
          </div>

          {/* Role badge */}
          <span className="bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20 capitalize">
            {user.role}
          </span>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}