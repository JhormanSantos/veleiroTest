// src/components/ui/FileDetailPanel.tsx
'use client';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { File as FileType } from '@/types';

interface FileDetailPanelProps {
  file: FileType | null;
  onClose: () => void;
}

export default function FileDetailPanel({ file, onClose }: FileDetailPanelProps) {
  if (!file) return null;

  return (
    // Panel que se superpone
    <aside className="absolute top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border shadow-lg z-20 transform transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold truncate">{file.name}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-bold text-gray-500">Estado</h4>
            <p className="capitalize rounded-full bg-green-100 text-green-800 px-2 py-1 inline-block">{file.processing_status}</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-500">Lenguaje Detectado</h4>
            <p>{file.pulse_language || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-500">Conteo de Líneas</h4>
            <p>{file.pulse_line_count || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-500">Entidades Nombradas</h4>
            <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs">
              {file.pulse_named_entities ? JSON.stringify(file.pulse_named_entities, null, 2) : 'N/A'}
            </pre>
          </div>
        </div>
      </div>
    </aside>
  );
}