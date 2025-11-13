/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        omniwallet: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#ec4899',
          dark: '#1e1b4b',
          light: '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
}
