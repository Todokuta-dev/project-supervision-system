"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, Variants } from "framer-motion";
import {
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  FileText,
  Users,
} from "lucide-react";

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
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
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
}: {
  icon: React.ElementType;
  label: string;
  className?: string;
}) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 flex items-center gap-2 ${className}`}
    >
      <Icon className="w-4 h-4 text-accent" />
      <span className="text-white/90 text-xs font-medium">{label}</span>
    </motion.div>
  );
}

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);

      if (email === "emeka.obi@student.edu") {
        router.push("/student/dashboard");
      } else if (email === "l.adeyemi@staff.edu") {
        router.push("/supervisor/dashboard");
      } else if (email === "admin@staff.edu") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* --- LEFT PANEL --- */}
        <motion.div
          variants={leftVariants}
          initial="hidden"
          animate="visible"
          className="bg-primary relative flex flex-col justify-between p-10 lg:w-1/2 min-h-[320px] lg:min-h-[600px] overflow-hidden"
        >
          {/* Background circle decorations */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

          {/* Floating cards */}
          <FloatingCard
            icon={BookOpen}
            label="Submit Chapters"
            className="top-24 right-6"
          />
          <FloatingCard
            icon={FileText}
            label="Similarity Reports"
            className="top-52 right-10"
          />
          <FloatingCard
            icon={Users}
            label="Supervisor Review"
            className="bottom-28 left-6"
          />

          {/* Top — logo area */}
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
              Supervise.
              <br />
              <span className="text-accent">Submit.</span>
              <br />
              Succeed.
            </h1>

            <p className="text-white/60 text-sm mt-4 max-w-xs leading-relaxed">
              The intelligent project supervision and digital repository
              platform for Adekunle Ajasin University.
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
            <motion.div variants={fadeUp} className="mb-8">
              <h2 className="text-content-primary text-2xl font-bold mb-1">
                Welcome back
              </h2>
              <p className="text-content-secondary text-sm">
                Sign in to your institutional account to continue.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <motion.div variants={fadeUp}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-content-primary mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@aaua.edu.ng"
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Dev credentials */}
            <motion.div
              variants={fadeUp}
              className="mt-6 p-4 bg-background rounded-xl border border-border"
            >
              <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
                Development — Test Accounts
              </p>
              <div className="space-y-1 text-xs text-content-secondary">
                <p>
                  <span className="font-medium text-content-primary">
                    Student:
                  </span>{" "}
                  emeka.obi@student.edu
                </p>
                <p>
                  <span className="font-medium text-content-primary">
                    Supervisor:
                  </span>{" "}
                  l.adeyemi@staff.edu
                </p>
                <p>
                  <span className="font-medium text-content-primary">
                    Admin:
                  </span>{" "}
                  admin@staff.edu
                </p>
                <p className="mt-1 italic">Any password works for now.</p>
              </div>
            </motion.div>
            {/* Sign up link */}
            <motion.p
              variants={fadeUp}
              className="mt-4 text-center text-sm text-content-secondary"
            >
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="text-primary font-semibold hover:text-primary-light transition"
              >
                Create one
              </a>
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
