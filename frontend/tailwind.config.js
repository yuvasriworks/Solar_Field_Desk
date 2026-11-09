/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          sky: "#38BDF8",
          lightSky: "#E0F2FE",
          deepBlue: "#0284C7",
          navy: "#0F2A43",
          yellow: "#FACC15",
          green: "#22C55E",
          cyan: "#CFFAFE",
          surface: "rgba(255, 255, 255, 0.88)",
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'cloud-slow': 'cloudDrift 35s linear infinite',
        'cloud-fast': 'cloudDrift 22s linear infinite',
        'pulse-glow': 'sunGlow 3s ease-in-out infinite alternate',
        'spin-slow': 'spin 18s linear infinite',
        'particle-up': 'particleFloat 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(0.8deg)' },
        },
        cloudDrift: {
          '0%': { transform: 'translateX(-15%)' },
          '100%': { transform: 'translateX(115%)' },
        },
        sunGlow: {
          '0%': { filter: 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.45)) scale(1)' },
          '100%': { filter: 'drop-shadow(0 0 35px rgba(250, 204, 21, 0.85)) scale(1.05)' },
        },
        particleFloat: {
          '0%': { transform: 'translateY(20px) scale(0.6)', opacity: '0.2' },
          '50%': { opacity: '0.9' },
          '100%': { transform: 'translateY(-40px) scale(1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
