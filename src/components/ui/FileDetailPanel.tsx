// src/components/ui/FileDetailPanel.tsx
'use client';
import { XMarkIcon, PencilSquareIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { File as FileType } from '@/types';
import { fetcher } from '@/lib/fetcher'; // <-- Importar fetcher
import { useState } from 'react';
import Modal from './Modal'; 



interface FileDetailPanelProps {
  file: FileType | null;
  onClose: () => void;
  onEdit: (file: FileType) => void; // <-- Nueva prop para manejar la edición
}

export default function FileDetailPanel({ file, onClose, onEdit }: FileDetailPanelProps) {

  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  

  // Si no hay archivo, no renderizamos nada.
  if (!file) return null;

  const rawMetadata = typeof file.pulse_raw_metadata === 'object' 
    ? file.pulse_raw_metadata 
    : null;
  
  const markdownSnippet = rawMetadata?.markdown
    ? rawMetadata.markdown.split('\n').slice(0, 15).join('\n')
    : null;

  const handleReprocess = async () => {
    if (!file) return;
    setIsReprocessing(true);
    try {
      await fetcher(`/api/files/${file.id}/reprocess`, { method: 'POST' });
      setShowSuccessModal(true); // <-- Reemplaza alert de éxito
    } catch (error) {
      setShowErrorModal(true); // <-- Reemplaza alert de error
    } finally {
      setIsReprocessing(false);
    }
};

  const isEditable = file.mime_type.startsWith('text/');

  return (
    <>
    <aside className="absolute top-0 right-0 h-full w-full max-w-sm bg-surface border-l border-border shadow-lg z-20 transform transition-transform duration-300 ease-in-out">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold truncate">{file.name}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {isEditable && (
          <div className="mb-4">
            <button
              onClick={() => onEdit(file)}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
            >
              <PencilSquareIcon className="w-5 h-5" />
              Editar Archivo
            </button>

          </div>
        )}

        <button
            onClick={handleReprocess}
            disabled={isReprocessing}
            className="m-2 flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isReprocessing ? 'animate-spin' : ''}`} />
            {isReprocessing ? 'Procesando...' : 'Reprocesar'}
          </button>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-bold text-gray-500">Estado</h4>
            <p className="capitalize rounded-full bg-green-100 text-green-800 px-2 py-1 inline-block">{file.processing_status}</p>
          </div>
          {markdownSnippet && (
            <div>
              <h4 className="font-bold text-gray-500">Vista Previa del Texto Extraído</h4>
              <pre className="mt-1 bg-gray-100 p-2 rounded-md overflow-x-auto text-xs h-60">
                {markdownSnippet}
                {rawMetadata.markdown.split('\n').length > 15 && "\n..."}
              </pre>
            </div>
          )}
          <div>
            <h4 className="font-bold text-gray-500">Conteo de Líneas</h4>
            <p>{file.pulse_line_count || 'N/A'}</p>
          </div>
        </div>
      </div>
    </aside>

    <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Petición Enviada"
      >
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-2">
            El archivo ha sido enviado a reprocesar. Los datos se actualizarán en breve.
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="mt-4 bg-secondary text-white font-bold py-2 px-4 rounded-lg"
          >
            Aceptar
          </button>
        </div>
      </Modal>

      {/* MODAL DE ERROR */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
      >
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2">
            Ocurrió un error al intentar reprocesar el archivo. Por favor, inténtalo de nuevo.
          </p>
          <button
            onClick={() => setShowErrorModal(false)}
            className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </>
  );
}