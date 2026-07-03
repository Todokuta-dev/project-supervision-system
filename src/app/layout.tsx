import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth.context";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
      <body className={spaceGrotesk.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}