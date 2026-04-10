import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        onerpm: {
          orange: "#f04f23",
          "orange-dark": "#d9431c",
          "orange-light": "#ff6840",
        },
      },
    },
  },
  plugins: [],
};
export default config;
