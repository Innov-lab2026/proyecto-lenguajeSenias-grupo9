/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Nunito variable: cargada con expo-font en app/_layout.tsx (nativo y web).
        // El peso se controla con font-normal / font-bold.
        nunito: ["Nunito"],
      },
      colors: {
        // Tokens semánticos → leen las variables CSS de global.css.
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        "active-icon": "rgb(var(--color-active-icon) / <alpha-value>)",
        progress: "rgb(var(--color-progress) / <alpha-value>)",
        "progress-fill": "rgb(var(--color-progress-fill) / <alpha-value>)",
        "tab-locked": "rgb(var(--color-tab-locked) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
      },
    },
  },
  plugins: [],
}

