'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowUpTrayIcon } from '@heroicons/react/24/solid';

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
}

export default function FileDropzone({ onFilesAccepted }: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesAccepted(acceptedFiles);
  }, [onFilesAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { // Define los tipos de archivo aceptados según los requisitos
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
      ${isDragActive ? 'border-secondary bg-indigo-50' : 'border-border hover:border-secondary'}`}
    >
      <input {...getInputProps()} />
      <ArrowUpTrayIcon className="w-12 h-12 text-gray-400" />
      {isDragActive ? (
        <p className="mt-2 font-semibold text-secondary">Suelta los archivos aquí...</p>
      ) : (
        <p className="mt-2 text-gray-500">Arrastra y suelta archivos aquí, o haz clic para seleccionar</p>
      )}
      <p className="text-xs text-gray-400 mt-1">Soporta .txt, .pdf, .csv, .xlsx</p>
    </div>
  );
}