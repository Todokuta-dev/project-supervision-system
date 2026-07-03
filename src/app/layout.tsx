// ============================================
// ROOT LAYOUT
// Wraps the entire app with AuthProvider
// ============================================

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth.context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Supervision System",
  description:
    "Intelligent Project Supervision and Digital Repository System with Plagiarism and Similarity Analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}