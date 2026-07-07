"use client";

import { useState } from "react";
import { mockDepartments } from "@/lib/mock-data";
import { Department } from "@/lib/types";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  X,
  CheckCircle2,
  Pencil,
  Trash2,
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

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "" });
    setError("");
    setShowForm(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setError("");
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingDept(null);
    setFormData({ name: "", code: "" });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length < 3) {
      setError("Department name must be at least 3 characters.");
      return;
    }
    if (formData.code.trim().length < 2) {
      setError("Department code must be at least 2 characters.");
      return;
    }

    // Check for duplicate code
    const duplicate = departments.find(
      (d) =>
        d.code.toLowerCase() === formData.code.trim().toLowerCase() &&
        d.department_id !== editingDept?.department_id
    );
    if (duplicate) {
      setError("A department with this code already exists.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));

    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.department_id === editingDept.department_id
            ? {
                ...d,
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
              }
            : d
        )
      );
      setSuccessMsg("Department updated successfully.");
    } else {
      const newDept: Department = {
        department_id: `dept_${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
      };
      setDepartments((prev) => [...prev, newDept]);
      setSuccessMsg("Department created successfully.");
    }

    setIsSubmitting(false);
    handleClose();

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (dept: Department) => {
    setDepartments((prev) =>
      prev.filter((d) => d.department_id !== dept.department_id)
    );
    setSuccessMsg(`"${dept.name}" deleted.`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

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
            Departments
          </h1>
          <p className="text-content-secondary text-sm mt-1">
            Manage academic departments — these drive all dropdowns across the
            system
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </motion.button>
      </motion.div>

      {/* Success toast */}
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

      {/* Stat */}
      <motion.div
        variants={cardVariants}
        className="bg-primary rounded-2xl border border-primary p-5 flex items-center justify-between"
      >
        <div>
          <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
            Total Departments
          </p>
          <p className="text-white text-3xl font-bold">{departments.length}</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
          <Building2 className="w-6 h-6 text-accent" />
        </div>
      </motion.div>

      {/* Departments list */}
      <motion.div
        variants={cardVariants}
        className="bg-background-surface rounded-2xl border border-border overflow-hidden"
      >
        {departments.length > 0 ? (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-background">
              <p className="col-span-1 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                #
              </p>
              <p className="col-span-2 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Code
              </p>
              <p className="col-span-7 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Name
              </p>
              <p className="col-span-2 text-content-secondary text-xs font-semibold uppercase tracking-wider">
                Actions
              </p>
            </div>

            {departments.map((dept, index) => (
              <div
                key={dept.department_id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-background transition items-center"
              >
                <p className="col-span-1 text-content-secondary text-sm">
                  {index + 1}
                </p>
                <div className="col-span-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-lg border border-primary/20">
                    {dept.code}
                  </span>
                </div>
                <p className="col-span-7 text-content-primary text-sm font-medium">
                  {dept.name}
                </p>
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-content-secondary hover:text-primary hover:border-primary/30 transition"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept)}
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
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <p className="text-content-primary font-semibold text-sm mb-1">
              No departments yet
            </p>
            <p className="text-content-secondary text-xs mb-4">
              Add your first department to get started
            </p>
            <button
              onClick={handleOpenCreate}
              className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary-light transition"
            >
              Add Department
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
                {editingDept ? "Edit Department" : "Add Department"}
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
                  Department Name
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-content-primary mb-1">
                  Department Code
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  name="code"
                  type="text"
                  required
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. CSC"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
                <p className="text-content-secondary text-xs mt-1">
                  Short unique identifier. Will be uppercased automatically.
                </p>
              </div>

              {error && (
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
                  ) : editingDept ? (
                    "Save Changes"
                  ) : (
                    "Add Department"
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