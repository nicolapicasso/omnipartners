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
          primary: '#3e95b0',
          secondary: '#255664',
          accent: '#4dbbdd',
          dark: '#232323',
          light: '#f7f7f7',
        },
      },
    },
  },
  plugins: [],
}
