module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.3s ease-out',
        'loading-dot': 'loadingDot 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        loadingDot: {
          '0%, 80%, 100%': { opacity: 0 },
          '40%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
