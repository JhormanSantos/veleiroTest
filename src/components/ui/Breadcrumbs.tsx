// src/components/ui/Breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/solid';

interface BreadcrumbsProps {
  // El slug es un array de strings, ej: ['Reportes', '10', 'Q3', '25']
  slug: string[] | undefined;
}

export default function Breadcrumbs({ slug }: BreadcrumbsProps) {
  const pathSegments = slug || [];

  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center font-medium text-gray-700 hover:text-secondary"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Inicio
          </Link>
        </li>

        {pathSegments.map((segment, index) => {
          // Solo los segmentos en posiciones impares son IDs, no los mostramos.
          // Mostramos los nombres, que están en posiciones pares (0, 2, 4...).
          if (index % 2 !== 0) {
            return null;
          }

          // Construimos la ruta para este enlace.
          const href = `/${pathSegments.slice(0, index + 2).join('/')}`;
          const isLast = index === pathSegments.length - 2;

          return (
            <li key={index}>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                {isLast ? (
                  <span className="ml-1 font-medium text-gray-800 md:ml-2">
                    {decodeURIComponent(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="ml-1 font-medium text-gray-700 hover:text-secondary md:ml-2"
                  >
                    {decodeURIComponent(segment)}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}