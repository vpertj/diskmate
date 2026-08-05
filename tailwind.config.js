/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // macOS 系统色 - 强调色
        macos: {
          blue: "#0A84FF",
          green: "#30D158",
          purple: "#5E5CE6",
          red: "#FF453A",
          yellow: "#FFD60A",
          orange: "#FF9F0A",
        },
        // 背景色 - 深色主题层次
        surface: {
          DEFAULT: "#1C1C1E",
          secondary: "#2C2C2E",
          tertiary: "#3A3A3C",
          elevated: "#48484A",
        },
        // 文字色
        ink: {
          primary: "#FFFFFF",
          secondary: "#E5E5E7",
          tertiary: "#AEAEB2",
          quaternary: "#8E8E93",
        },
        // 蓝绿渐变强调色
        accent: {
          from: "#0A84FF",
          to: "#30D158",
        },
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        heading: ["24px", { fontWeight: "700", lineHeight: "1.2" }],
        subheading: ["16px", { fontWeight: "600", lineHeight: "1.4" }],
        body: ["14px", { fontWeight: "400", lineHeight: "1.5" }],
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(135deg, #0A84FF 0%, #30D158 100%)",
        "glass-overlay": "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(10, 132, 255, 0.35)",
        "glow-green": "0 0 40px rgba(48, 209, 88, 0.35)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "count-up": "countUp 1s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(10, 132, 255, 0.3)" },
          "50%": { boxShadow: "0 0 50px rgba(10, 132, 255, 0.6)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
