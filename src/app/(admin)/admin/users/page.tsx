"use client";

import { useState } from "react";
import { mockUsers, mockDepartments, mockSessions } from "@/lib/mock-data";
import { User } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  GraduationCap,
  BookOpen,
  Shield,
  Building2,
  CalendarDays,
  Mail,
} from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

function RoleBadge({ role }: { role: string }) {
  const config = {
    student: {
      label: "Student",
      className: "bg-blue-50 text-blue-600 border-blue-200",
      icon: GraduationCap,
    },
    supervisor: {
      label: "Supervisor",
      className: "bg-primary/10 text-primary border-primary/20",
      icon: BookOpen,
    },
    admin: {
      label: "Admin",
      className: "bg-accent/10 text-accent-dark border-accent/20",
      icon: Shield,
    },
  }[role] ?? {
    label: role,
    className: "bg-gray-50 text-gray-600 border-gray-200",
    icon: Users,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${config.className}`}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "supervisor" | "admin">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = mockUsers.filter((u) => {
    const matchesSearch =
      !search ||
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const studentCount = mockUsers.filter((u) => u.role === "student").length;
  const supervisorCount = mockUsers.filter((u) => u.role === "supervisor").length;
  const adminCount = mockUsers.filter((u) => u.role === "admin").length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-content-primary text-2xl font-bold">Users</h1>
          <p className="text-content-secondary text-sm mt-1">
            Manage all students, supervisors and administrators
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          variants={cardVariants}
          className="bg-primary rounded-2xl border border-primary p-4 text-center cursor-pointer hover:bg-primary-light transition"
          onClick={() => setRoleFilter(roleFilter === "student" ? "all" : "student")}
        >
          <p className="text-2xl font-bold text-white">{studentCount}</p>
          <p className="text-white/60 text-xs mt-1">Students</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-4 text-center cursor-pointer hover:border-primary/30 transition"
          onClick={() => setRoleFilter(roleFilter === "supervisor" ? "all" : "supervisor")}
        >
          <p className="text-2xl font-bold text-content-primary">
            {supervisorCount}
          </p>
          <p className="text-content-secondary text-xs mt-1">Supervisors</p>
        </motion.div>
        <motion.div
          variants={cardVariants}
          className="bg-background-surface rounded-2xl border border-border p-4 text-center cursor-pointer hover:border-primary/30 transition"
          onClick={() => setRoleFilter(roleFilter === "admin" ? "all" : "admin")}
        >
          <p className="text-2xl font-bold text-content-primary">{adminCount}</p>
          <p className="text-content-secondary text-xs mt-1">Admins</p>
        </motion.div>
      </div>

      {/* Search + Filter */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-content-primary bg-background-surface placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "student", "supervisor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() =>
                setRoleFilter(r as "all" | "student" | "supervisor" | "admin")
              }
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                roleFilter === r
                  ? "bg-primary text-white"
                  : "bg-background-surface border border-border text-content-secondary hover:text-content-primary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Users table */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border overflow-hidden"
      >
        {filtered.length > 0 ? (
          <div className="divide-y divide-border">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-background">
              <p className="col-span-4 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                User
              </p>
              <p className="col-span-2 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Role
              </p>
              <p className="col-span-3 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Department
              </p>
              <p className="col-span-2 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Session
              </p>
              <p className="col-span-1 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Action
              </p>
            </div>

            {/* Rows */}
            {filtered.map((user) => {
              const department = mockDepartments.find(
                (d) => d.department_id === user.department_id
              );
              const session = mockSessions.find(
                (s) => s.session_id === user.session_id
              );
              return (
                <div
                  key={user.user_id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 hover:bg-background transition"
                >
                  {/* User */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-bold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-content-primary text-sm font-semibold truncate">
                        {user.full_name}
                      </p>
                      <div className="flex items-center gap-1 text-content-secondary text-xs">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-2 flex items-center">
                    <RoleBadge role={user.role} />
                  </div>

                  {/* Department */}
                  <div className="col-span-3 flex items-center gap-1.5 text-content-secondary text-xs">
                    <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {department?.name ?? "—"}
                    </span>
                  </div>

                  {/* Session */}
                  <div className="col-span-2 flex items-center gap-1.5 text-content-secondary text-xs">
                    <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{session?.label ?? "—"}</span>
                  </div>

                  {/* Action */}
                  <div className="col-span-1 flex items-center">
                    <button
                      onClick={() =>
                        setSelectedUser(
                          selectedUser?.user_id === user.user_id ? null : user
                        )
                      }
                      className="text-xs font-semibold text-primary hover:text-primary-light transition"
                    >
                      {selectedUser?.user_id === user.user_id
                        ? "Close"
                        : "View"}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {selectedUser?.user_id === user.user_id && (
                    <div className="col-span-12 mt-2 p-4 bg-background rounded-xl border border-border space-y-3">
                      <p className="text-content-secondary text-xs font-semibold uppercase tracking-wider">
                        User Details
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-content-secondary text-xs">
                            Full Name
                          </p>
                          <p className="text-content-primary text-sm font-medium">
                            {user.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-content-secondary text-xs">
                            Email
                          </p>
                          <p className="text-content-primary text-sm font-medium truncate">
                            {user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-content-secondary text-xs">
                            Role
                          </p>
                          <p className="text-content-primary text-sm font-medium capitalize">
                            {user.role}
                          </p>
                        </div>
                        <div>
                          <p className="text-content-secondary text-xs">
                            Joined
                          </p>
                          <p className="text-content-primary text-sm font-medium">
                            {new Date(user.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <p className="text-content-primary font-semibold text-sm mb-1">
              No users found
            </p>
            <p className="text-content-secondary text-xs">
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}