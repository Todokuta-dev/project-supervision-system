"use client";

import { useEffect, useState } from "react";
import { searchRepository } from "@/lib/services/repository.service";
import { RepositoryItem } from "@/lib/types";
import { mockDepartments, mockSessions, mockUsers } from "@/lib/mock-data";
import { motion } from "framer-motion";
import {
  Search,
  Library,
  Filter,
  BookOpen,
  User,
  Building2,
  CalendarDays,
  Download,
  X,
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

export default function RepositoryPage() {
  const [items, setItems] = useState<RepositoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load all on mount
  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const data = await searchRepository();
        setItems(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setSearched(true);
    try {
      const data = await searchRepository({
        keyword: keyword.trim() || undefined,
        department_id: selectedDept || undefined,
        session_id: selectedSession || undefined,
      });
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    setKeyword("");
    setSelectedDept("");
    setSelectedSession("");
    setSearched(false);
    setIsLoading(true);
    try {
      const data = await searchRepository();
      setItems(data);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = keyword || selectedDept || selectedSession;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={cardVariants}>
        <h1 className="text-content-primary text-2xl font-bold">
          Digital Repository
        </h1>
        <p className="text-content-secondary text-sm mt-1">
          Browse and search past final year projects across all sessions and
          departments
        </p>
      </motion.div>

      {/* Search bar */}
      <motion.div variants={cardVariants}>
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-content-secondary" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by title, abstract, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-content-primary bg-background-surface placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </motion.button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition ${
                showFilters || selectedDept || selectedSession
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-background-surface border-border text-content-secondary hover:text-content-primary"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background-surface rounded-2xl border border-border p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Department filter — data-driven */}
              <div>
                <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="">All Departments</option>
                  {mockDepartments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Session filter — data-driven, searches across ALL sessions */}
              <div>
                <label className="block text-xs font-semibold text-content-secondary uppercase tracking-wider mb-1.5">
                  Academic Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="">All Sessions</option>
                  {mockSessions.map((session) => (
                    <option key={session.session_id} value={session.session_id}>
                      {session.label}
                      {session.is_active ? " (Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}

          {/* Active filters indicator */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-content-secondary text-xs">
                Active filters:
              </span>
              {keyword && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                  &ldquo;{keyword}&rdquo;
                  <button onClick={() => setKeyword("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedDept && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                  {mockDepartments.find(
                    (d) => d.department_id === selectedDept
                  )?.code ?? selectedDept}
                  <button onClick={() => setSelectedDept("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedSession && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full border border-primary/20">
                  {mockSessions.find(
                    (s) => s.session_id === selectedSession
                  )?.label ?? selectedSession}
                  <button onClick={() => setSelectedSession("")}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleClear}
                className="text-content-secondary text-xs hover:text-content-primary transition underline"
              >
                Clear all
              </button>
            </div>
          )}
        </form>
      </motion.div>

      {/* Results count */}
      {!isLoading && (
        <motion.div variants={cardVariants}>
          <p className="text-content-secondary text-sm">
            {searched || hasActiveFilters ? (
              <>
                <span className="text-content-primary font-semibold">
                  {items.length}
                </span>{" "}
                result{items.length !== 1 ? "s" : ""} found
              </>
            ) : (
              <>
                Showing all{" "}
                <span className="text-content-primary font-semibold">
                  {items.length}
                </span>{" "}
                projects in the repository
              </>
            )}
          </p>
        </motion.div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => {
                const department = mockDepartments.find(
                  (d) => d.department_id === item.department_id
                );
                const session = mockSessions.find(
                  (s) => s.session_id === item.session_id
                );
                const student = mockUsers.find(
                  (u) => u.user_id === item.student_id
                );
                const supervisor = mockUsers.find(
                  (u) => u.user_id === item.supervisor_id
                );

                return (
                  <motion.div
                    key={item.repo_id}
                    variants={cardVariants}
                    className="bg-background-surface rounded-2xl border border-border p-6 hover:border-primary/30 transition-all space-y-4"
                  >
                    {/* Title + download */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-primary/8 border border-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-content-primary font-bold text-base leading-snug">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1 text-content-secondary text-xs">
                              <Building2 className="w-3 h-3" />
                              {department?.name ?? "—"}
                            </div>
                            <div className="flex items-center gap-1 text-content-secondary text-xs">
                              <CalendarDays className="w-3 h-3" />
                              {session?.label ?? "—"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <a
                        href={item.file_path}
                        className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light transition flex-shrink-0 bg-primary/8 hover:bg-primary/15 px-3 py-2 rounded-xl border border-primary/10"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    </div>

                    {/* Abstract */}
                    <p className="text-content-secondary text-sm leading-relaxed line-clamp-3">
                      {item.abstract}
                    </p>

                    {/* Keywords */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="text-xs font-medium text-content-secondary bg-background border border-border px-2.5 py-1 rounded-full"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-4 pt-1 border-t border-border">
                      <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                        <User className="w-3.5 h-3.5" />
                        {student?.full_name ?? "Unknown"}
                      </div>
                      <div className="flex items-center gap-1.5 text-content-secondary text-xs">
                        <User className="w-3.5 h-3.5" />
                        Supervised by{" "}
                        <span className="text-content-primary font-medium">
                          {supervisor?.full_name ?? "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-content-secondary text-xs ml-auto">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Archived{" "}
                        {new Date(item.archived_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              variants={cardVariants}
              className="bg-background-surface rounded-2xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
                <Library className="w-6 h-6 text-primary" />
              </div>
              <p className="text-content-primary font-semibold text-sm mb-1">
                No results found
              </p>
              <p className="text-content-secondary text-xs mb-4">
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={handleClear}
                className="text-primary text-xs font-semibold hover:text-primary-light transition"
              >
                Clear search
              </button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}