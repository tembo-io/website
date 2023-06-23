// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false, // disable Tailwind's reset
  },
  content: ["./src/**/*.{js,jsx,ts,tsx}", "../docs/**/*.mdx"], // my markdown stuff is in ../docs, not /src
  darkMode: ['class', '[data-theme="dark"]'], // hooks into docusaurus' dark mode settigns
  theme: {
    fontFamily: {
      "headline": ["supply-mono, san serif"],
      "display": ["'Bai Jamjuree', san-serif"],
      "body": ["Inter"] 
    },
    extend: {},
  },
  plugins: [],
}