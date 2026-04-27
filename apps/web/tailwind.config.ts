import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171a1f",
        muted: "#687076",
        line: "#dfe3e6",
        canvas: "#f6f6f3",
        panel: "#ffffff",
        action: "#0f6b57"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 26, 31, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
