// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0F172A',     // Azul oscuro casi negro para texto y elementos principales
        'secondary': '#4F46E5',   // Púrpura/Índigo para acentos y botones
        'background': '#F8FAFC', // Gris muy claro para el fondo principal
        'surface': '#FFFFFF',    // Blanco para tarjetas y superficies elevadas
        'border': '#E2E8F0',     // Gris claro para bordes y separadores
      },
    },
  },
  plugins: [],
};