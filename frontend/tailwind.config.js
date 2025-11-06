/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#008DA6",
        secondary: "#FF7A59",
        background: "#F8F8F8",
        text: "#333333",
        textSecondary: "#757575"
      },
      boxShadow: {
        navbar: "0 2px 8px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};


