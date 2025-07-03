import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css'; // Asegúrate que la ruta sea correcta

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'File Intake System - Veleiro',
  description: 'Sube, gestiona y procesa tus archivos de forma eficiente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-background text-primary`}>
        {children}
      </body>
    </html>
  );
}