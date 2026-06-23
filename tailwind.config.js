/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#f1f3f4',       // light app background (Google grey)
        primary: '#1a73e8',  // Google blue
        accent: '#0ABFBF',   // accessibility teal (pins / brand)
        alert: '#ea4335',    // Google red
        card: '#ffffff',
        ink: '#202124',      // primary text
        muted: '#5f6368',    // secondary text
        border: '#e3e6ea',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        map: '0 1px 3px rgba(60,64,67,0.3), 0 4px 12px rgba(60,64,67,0.15)',
        lift: '0 1px 2px rgba(60,64,67,0.2), 0 2px 6px rgba(60,64,67,0.12)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.4)', opacity: '0.7' },
          '100%': { transform: 'scale(2.6)', opacity: '0' },
        },
        alertGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(234,67,53,0.4)' },
          '50%': { boxShadow: '0 0 16px 3px rgba(234,67,53,0.4)' },
        },
        pageIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pinDrop: {
          '0%': { transform: 'translateY(-40px) scale(0.6)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        'alert-glow': 'alertGlow 2s ease-in-out infinite',
        'page-in': 'pageIn 320ms ease-out both',
        'pin-drop': 'pinDrop 520ms cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
}
