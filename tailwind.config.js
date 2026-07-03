/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- PRIMARY (AAUA Green) ---
        primary: {
          DEFAULT: "#1A5C38",
          light: "#2E7D52",
          dark: "#134228",
        },

        // --- ACCENT (AAUA Gold) ---
        accent: {
          DEFAULT: "#C9951A",
          light: "#E0AA2E",
          dark: "#A87A10",
        },

        // --- BACKGROUNDS ---
        background: {
          DEFAULT: "#F8F9FA",
          surface: "#FFFFFF",
        },

        // --- TEXT ---
        content: {
          primary: "#1A1A2E",
          secondary: "#6B7280",
          inverse: "#FFFFFF",
        },

        // --- PROJECT STATUS COLORS ---
        status: {
          topic_pending: "#2563EB",
          under_review: "#D97706",
          correction_required: "#DC2626",
          approved: "#16A34A",
          archived: "#6B7280",
        },

        // --- BORDERS ---
        border: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
      },

      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};
