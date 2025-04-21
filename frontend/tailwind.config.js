/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#669900', // Green
          foreground: '#ffffff', // White
        },
        secondary: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#1f2937", // Gray-800
        },
        muted: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#6b7280", // Gray-500
        },
        accent: {
          DEFAULT: "#f3f4f6", // Gray-100
          foreground: "#1f2937", // Gray-800
        },
        destructive: {
          DEFAULT: "#ef4444", // Red-500
          foreground: "#ffffff",
        },
        background: "#ffffff",
        foreground: "#1f2937", // Gray-800
        card: "#ffffff",
        "card-foreground": "#1f2937", // Gray-800
        border: "#e5e7eb", // Gray-200
        input: "#e5e7eb", // Gray-200
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
}

