import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep black ground.
        ink: "#0A0A0A",
        // Slightly lifted surfaces (cards, bars).
        "ink-2": "#111111",
        "ink-3": "#161616",
        // Off-white text.
        bone: "#F2EEE6",
        // Muted body text.
        mute: "#A6A199",
        // Hairlines.
        line: "rgba(242, 238, 230, 0.10)",
        // The one accent. CTAs and score numbers only.
        gold: "#C9A961",
        "gold-deep": "#B8964F",
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: {
        // Large geometric sans needs more negative tracking than a serif did.
        tightest: "-0.035em",
        caps: "0.14em",
      },
      lineHeight: {
        display: "1.02",
        snugger: "1.12",
      },
      maxWidth: {
        page: "1200px",
        prose: "38rem",
      },
      transitionTimingFunction: {
        expensive: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201, 169, 97, 0.35)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(18px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        // Transform-only reveal for the hero h1: never paints at opacity 0,
        // so it stays an LCP candidate at first contentful paint.
        "slide-up": {
          from: { transform: "translateY(18px)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        // CSS-driven reveals for above-the-fold content (no hydration wait).
        "fade-up": "fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 1.2s ease-out both",
        "slide-up": "slide-up 1s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
