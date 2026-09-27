import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {
    colors: {
      paper: "#F7FAFF", ink: "#0B1F3A", muted: "#52637A", border: "#DCE5F0",
      primary: { DEFAULT: "#12345B", light: "#1E4F87", dark: "#081A30" },
      accent: "#2563EB", premium: "#6D4AFF",
    },
    fontFamily: { serif: ["var(--font-serif)", "Georgia", "serif"], sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    maxWidth: { prose: "68ch" },
    boxShadow: { panel: "0 20px 60px rgba(11,31,58,.10)" }
  }},
  plugins: [],
};
export default config;
