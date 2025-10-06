import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'roca': ['var(--font-roca)', 'Arial', 'Helvetica', 'sans-serif'],
        'felix': ['var(--font-felix)', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        gray_background: "var(--gray-background)",
        foreground: "var(--foreground)",
        gray_foreground: "var(--gray-foreground)",
        system_primary: "var(--system-primary)",
        system_secondary: "var(--system-secondary)",
        system_foreground: "var(--system-foreground)",
        system_accent: "var(--system-accent)",
        system_light_accent:"var(--system-light-accent)",
        system_visual_primary: "var(--system-visual-primary)",
        system_light_primary:"var(--system-light-primary)",
        system_light_secondary: "var(--system-light-secondary)",
        system_dark_primary: "var(--system-dark-primary)",
        system_dark_secondary: "var(--system-dark-secondary)",
        visual_light_amber: "var(--visual-light-amber)",
        label_primary: "var(--label-primary)",
        label_secondary: "var(--label-secondary)",
        label_tertiary: "var(--label-tertiary)",
        gray_disable: "var(--gray-disable)",
        gray_divider: "var(--gray-divider)",
        gray_placeholder: "var(--gray-placeholder)",
        gray_icon: "var(--gray-icon)",
        semantic_red: "var(--semantic-red)",
        cream: {
          50: '#fefcf9',
          100: '#fdf8f0',
          200: '#f9ede1',
          300: '#f4e0c9',
          400: '#eccca6',
          500: '#e3b883',
          600: '#d9a35f',
          700: '#c88c4a',
          800: '#a5713e',
          900: '#845c36',
        },
      },
      boxShadow: {
        'sm':'0px 2px 0px 0px rgba(255, 255, 255, 0.30) inset;',
        '3xl': '0px 10px 8px 0px rgba(19, 59, 22, 0.10),0px -2.5px 0px 0px rgba(0, 0, 0, 0.25) inset,0px 2px 0px 0px rgba(255, 255, 255, 0.30) inset;',
        'header': ' 0px -4px 10px 0px rgba(0, 0, 0, 0.04), 0px -0.5px 0px 0px rgba(0, 0, 0, 0.06) inset;'
      },
    },
  },
};
export default config;
