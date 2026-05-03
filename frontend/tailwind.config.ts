import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#667085",
        panel: "#ffffff",
        page: "#f6f7f9",
      },
    },
  },
  plugins: [],
};

export default config;
