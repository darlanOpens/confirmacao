/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  important: true,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        butler: ['var(--font-butler)', 'Butler', 'serif'],
        'work-sans': ['Work Sans', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        'helvetica-neue': ['Helvetica Neue', 'sans-serif'],
      },
      colors: {
        'primary.red': '#fb1b1f',
        'primary.purple': '#5b00b6',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #fb1b1f, #5b00b6)',
        'hero': "url('/Bg.png')",
      },
    },
  },
  plugins: [],
};