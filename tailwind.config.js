
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Aquí agregaremos los colores y tipografía de veleiro.ai
      colors: {
        // Ejemplo:
        // 'veleiro-blue': '#001a70',
        // 'veleiro-gray': '#f0f2f5',
      },
      fontFamily: {
        // sans: ['TuFuente', 'sans-serif'], // Ejemplo
      },
    },
  },
  plugins: [],
}