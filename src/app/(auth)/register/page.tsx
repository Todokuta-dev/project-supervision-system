"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  FileText,
  Users,
} from "lucide-react";
import { mockDepartments } from "@/lib/mock-data";

// --- Animation Variants ---
const leftVariants: Variants = {
  hidden: { x: -60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const rightVariants: Variants = {
  hidden: { x: 60, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
};

const fadeUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// --- Floating Icon Card ---
function FloatingCard({
  icon: Icon,
  label,
  className,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`absolute bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2 ${className}`}
    >
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-white/90 text-xs font-medium">{label}</span>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "student",
    department_id: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!formData.department_id) {
      setError("Please select your department.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock registration delay
      await new Promise((res) => setTimeout(res, 1000));

      // Real implementation:
      // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // Redirect to login after successful registration
      router.push("/login");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* --- LEFT PANEL --- */}
        <motion.div
          variants={leftVariants}
          initial="hidden"
          animate="visible"
          className="bg-primary relative flex flex-col justify-between p-10 lg:w-1/2 min-h-[320px] lg:min-h-[680px] overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

          {/* Floating cards */}
          <FloatingCard
            icon={BookOpen}
            label="Track Progress"
            className="top-24 right-6"
            delay={0}
          />
          <FloatingCard
            icon={FileText}
            label="Digital Repository"
            className="top-52 right-10"
            delay={0.5}
          />
          <FloatingCard
            icon={Users}
            label="Get Supervised"
            className="bottom-28 left-6"
            delay={1}
          />

          {/* Top */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <span className="text-white/80 text-sm font-semibold tracking-wide uppercase">
                AAUA
              </span>
            </div>

            <h1 className="text-white text-4xl lg:text-5xl font-bold leading-tight">
              Join the
              <br />
              <span className="text-accent">Platform.</span>
            </h1>

            <p className="text-white/60 text-sm mt-4 max-w-xs leading-relaxed">
              Create your institutional account to start submitting projects,
              getting feedback, and accessing the digital repository.
            </p>
          </div>

          {/* Bottom */}
          <div className="relative z-10">
            <div className="h-px bg-white/10 mb-4" />
            <p className="text-white/40 text-xs">
              &copy; {new Date().getFullYear()} Adekunle Ajasin University,
              Akungba-Akoko.
            </p>
          </div>
        </motion.div>

        {/* --- RIGHT PANEL --- */}
        <motion.div
          variants={rightVariants}
          initial="hidden"
          animate="visible"
          className="bg-background-surface flex flex-col justify-center px-8 py-10 lg:px-12 lg:w-1/2"
        >
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="w-full max-w-sm mx-auto"
          >
            {/* Heading */}
            <motion.div variants={fadeUp} className="mb-6">
              <h2 className="text-content-primary text-2xl font-bold mb-1">
                Create your account
              </h2>
              <p className="text-content-secondary text-sm">
                Fill in your details to get started.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <motion.div variants={fadeUp}>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium text-content-primary mb-1"
                >
                  Full name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Chukwuemeka Obi"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </motion.div>

              {/* Email */}
              <motion.div variants={fadeUp}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-content-primary mb-1"
                >
                  Institutional email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@aaua.edu.ng"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </motion.div>

              {/* Role + Department — side by side */}
              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-content-primary mb-1"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    <option value="student">Student</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>

                {/* Department — data-driven from mockDepartments */}
                <div>
                  <label
                    htmlFor="department_id"
                    className="block text-sm font-medium text-content-primary mb-1"
                  >
                    Department
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  >
                    <option value="">Select</option>
                    {mockDepartments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.code}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={fadeUp}>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-content-primary mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary transition"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fadeUp}>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-content-primary mb-1"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-secondary hover:text-content-primary transition"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit */}
              <motion.div variants={fadeUp}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary hover:bg-primary-light text-content-inverse font-semibold py-2.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Sign in link */}
            <p className="mt-4 text-center text-sm text-content-secondary">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-primary font-semibold hover:text-primary-light transition"
              >
                Sign in
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}