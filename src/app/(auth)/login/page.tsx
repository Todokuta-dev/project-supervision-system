"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);

      // Redirect is handled by root page but we
      // push manually here for speed
      const stored = localStorage.getItem("auth_token");
      if (!stored) throw new Error("Login failed");

      // Role-based redirect
      if (email.includes("student")) router.push("/student/dashboard");
      else if (email.includes("staff") && email.includes("adeyemi"))
        router.push("/supervisor/dashboard");
      else if (email.includes("admin")) router.push("/admin/dashboard");
      else router.push("/");
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-background-surface rounded-2xl shadow-lg overflow-hidden">
          {/* Green Header */}
          <div className="bg-primary px-8 py-8">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-1">
              Adekunle Ajasin University
            </p>
            <h1 className="text-content-inverse text-2xl font-bold leading-tight">
              Project Supervision
              <br />& Repository System
            </h1>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-content-primary text-lg font-semibold mb-1">
              Sign in to your account
            </h2>
            <p className="text-content-secondary text-sm mb-6">
              Enter your institutional email and password to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
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
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-content-primary mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg border border-border text-content-primary bg-background placeholder:text-content-secondary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-light text-content-inverse font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Dev credentials hint */}
            <div className="mt-6 p-4 bg-background rounded-lg border border-border">
              <p className="text-xs font-semibold text-content-secondary uppercase tracking-wider mb-2">
                Development — Test Accounts
              </p>
              <div className="space-y-1 text-xs text-content-secondary">
                <p>
                  <span className="font-medium text-content-primary">Student:</span>{" "}
                  emeka.obi@student.edu
                </p>
                <p>
                  <span className="font-medium text-content-primary">Supervisor:</span>{" "}
                  l.adeyemi@staff.edu
                </p>
                <p>
                  <span className="font-medium text-content-primary">Admin:</span>{" "}
                  admin@staff.edu
                </p>
                <p className="mt-1 italic">Any password works for now.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-content-secondary mt-6">
          &copy; {new Date().getFullYear()} Adekunle Ajasin University, Akungba-Akoko.
          All rights reserved.
        </p>
      </div>
    </div>
  );
}