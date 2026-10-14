import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Palet diambil dari frame animasi: tempurung, seduhan, gula aren, kapur sirih
        sayak: { DEFAULT: "#1A0F0A", 900: "#120A06", 800: "#24150D", 700: "#33201A", 600: "#4A2F22" },
        seduh: { DEFAULT: "#C8782A", light: "#E8B25C", dark: "#9A5A1C" },
        kapur: { DEFAULT: "#F3E6D0", dim: "#C9B9A0" },
        daun: { DEFAULT: "#7FA650", dark: "#4F6F2E" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        nudge: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s ease-out infinite",
        nudge: "nudge 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
