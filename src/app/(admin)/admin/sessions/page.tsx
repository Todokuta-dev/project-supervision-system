"use client";

import { useEffect, useState } from "react";
import {
  getAllSessions,
  createSession,
  updateSession,
  setActiveSession,
  deleteSession,
} from "@/lib/services/reference.service";
import { AcademicSession } from "@/lib/types";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Plus,
  X,
  CheckCircle2,
  Pencil,
  Trash2,
  AlertCircle,
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

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    start_date: "",
    end_date: "",
    is_active: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const data = await getAllSessions();
        setSessions(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOpenCreate = () => {
    setEditingSession(null);
    setFormData({ label: "", start_date: "", end_date: "", is_active: false });
    setError("");
    setShowForm(true);
  };

  const handleOpenEdit = (session: AcademicSession) => {
    setEditingSession(session);
    setFormData({
      label: session.label,
      start_date: session.start_date,
      end_date: session.end_date,
      is_active: session.is_active,
    });
    setError("");
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingSession(null);
    setFormData({ label: "", start_date: "", end_date: "", is_active: false });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.label.trim().length < 4) {
      setError("Session label must be at least 4 characters e.g. 2024/2025.");
      return;
    }
    if (!formData.start_date) {
      setError("Please select a start date.");
      return;
    }
    if (!formData.end_date) {
      setError("Please select an end date.");
      return;
    }
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError("End date must be after start date.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSession) {
        const updated = await updateSession(editingSession.session_id, {
          label: formData.label.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: formData.is_active,
        });
        // Backend deactivates other sessions atomically if this one goes
        // active — refetch to reflect the authoritative state across all rows.
        const refreshed = await getAllSessions();
        setSessions(refreshed);
        setSuccessMsg("Session updated successfully.");
        void updated;
      } else {
        await createSession({
          label: formData.label.trim(),
          start_date: formData.start_date,
          end_date: formData.end_date,
          is_active: formData.is_active,
        });
        const refreshed = await getAllSessions();
        setSessions(refreshed);
        setSuccessMsg("Session created successfully.");
      }
      handleClose();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActive = async (sessionId: string) => {
    try {
      await setActiveSession(sessionId);
      const refreshed = await getAllSessions();
      setSessions(refreshed);
      setSuccessMsg("Active session updated.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set active session.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDelete = async (session: AcademicSession) => {
    if (session.is_active) {
      setError("Cannot delete the active session.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    try {
      await deleteSession(session.session_id);
      setSessions((prev) => prev.filter((s) => s.session_id !== session.session_id));
      setSuccessMsg(`Session "${session.label}" deleted.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete session.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const activeSession = sessions.find((s) => s.is_active);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={cardVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-content-primary text-2xl font-bold">
            Academic Sessions
          </h1>
          <p className="text-content-secondary text-sm mt-1">
            Manage academic sessions — only one session can be active at a time
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Add Session
        </motion.button>
      </motion.div>

      {/* Success / Error toasts */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </motion.div>
      )}
      {error && !showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.div>
      )}

      {/* Active session banner */}
      {activeSession && (
        <motion.div
          variants={cardVariants}
          className="bg-accent/10 border border-accent/20 rounded-2xl px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-accent-dark" />
            </div>
            <div>
              <p className="text-content-primary text-sm font-semibold">
                Active Session: {activeSession.label}
              </p>
              <p className="text-content-secondary text-xs">
                {new Date(activeSession.start_date).toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "short", year: "numeric" }
                )}{" "}
                —{" "}
                {new Date(activeSession.end_date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
            Current
          </span>
        </motion.div>
      )}

      {/* Sessions list */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border overflow-hidden"
      >
        {sessions.length > 0 ? (
          <div className="divide-y divide-border">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-background">
              <p className="col-span-3 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Session
              </p>
              <p className="col-span-3 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Start Date
              </p>
              <p className="col-span-3 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                End Date
              </p>
              <p className="col-span-1 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Status
              </p>
              <p className="col-span-2 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Actions
              </p>
            </div>

            {sessions.map((session) => (
              <div
                key={session.session_id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition ${
                  session.is_active ? "bg-primary/5" : "hover:bg-background"
                }`}
              >
                <div className="col-span-3">
                  <p className="text-content-primary text-sm font-semibold">
                    {session.label}
                  </p>
                </div>
                <p className="col-span-3 text-content-secondary text-sm">
                  {new Date(session.start_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="col-span-3 text-content-secondary text-sm">
                  {new Date(session.end_date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <div className="col-span-1">
                  {session.is_active ? (
                    <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  {!session.is_active && (
                    <button
                      onClick={() => handleSetActive(session.session_id)}
                      className="text-xs font-semibold text-primary hover:text-primary-light transition"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(session)}
                    className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-content-secondary hover:text-primary hover:border-primary/30 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(session)}
                    className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-content-secondary hover:text-red-500 hover:border-red-200 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-primary/8 rounded-2xl flex items-center justify-center mb-3">
              <CalendarDays className="w-6 h-6 text-primary" />
            </div>
            <p className="text-content-primary font-semibold text-sm mb-1">
              No sessions yet
            </p>
            <p className="text-content-secondary text-xs mb-4">
              Add your first academic session to get started
            </p>
            <button
              onClick={handleOpenCreate}
              className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition"
            >
              Add Session
            </button>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-background-surface rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-content-primary font-bold text-base">
                {editingSession ? "Edit Session" : "Add Session"}
              </h2>
              <button
                onClick={handleClose}
                className="text-content-secondary hover:text-content-primary transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-primary mb-1">
                  Session Label
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  name="label"
                  type="text"
                  required
                  value={formData.label}
                  onChange={handleChange}
                  placeholder="e.g. 2025/2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-content-primary mb-1">
                    Start Date
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    name="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-content-primary mb-1">
                    End Date
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <input
                    name="end_date"
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 accent-primary"
                />
                <label
                  htmlFor="is_active"
                  className="text-content-primary text-sm font-medium cursor-pointer"
                >
                  Set as active session
                </label>
              </div>
              <p className="text-content-secondary text-xs -mt-2">
                Setting this as active will deactivate all other sessions.
              </p>

              {error && showForm && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 bg-primary hover:bg-primary-light text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : editingSession ? (
                    "Save Changes"
                  ) : (
                    "Add Session"
                  )}
                </motion.button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl border border-border text-content-secondary text-sm font-medium hover:bg-background transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}