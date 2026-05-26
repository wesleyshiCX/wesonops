import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        anchor: '#3a2a1a',
        primary: '#b37a4c',
        neutral: '#f5f1eb',
        olive: '#06c3a0',
        teal: '#264653',
        terracotta: '#bc6a4c',
        dusty: '#6a8c9c',
        gold: '#d4a017',
      },
    },
  },
  plugins: [],
};
export default config;
