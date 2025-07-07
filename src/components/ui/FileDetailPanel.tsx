// src/components/ui/FileDetailPanel.tsx
'use client';
import { XMarkIcon, PencilSquareIcon, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import { File as FileType, Folder } from '@/types';
import { fetcher } from '@/lib/fetcher'; // <-- Importar fetcher
import { useState } from 'react';
import Modal from './Modal'; 
import { useRouter } from 'next/navigation'; 
import { ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid';

type Item = (FileType | Folder) & { type: 'file' | 'folder' };

interface FileDetailPanelProps {
  item: Item | null;
  onClose: () => void;
  onEdit: (file: FileType) => void; // <-- Nueva prop para manejar la edición
  onDelete: (item: {id: number, type: 'file' | 'folder'}) => void;
}

export default function FileDetailPanel({ item, onClose, onEdit, onDelete }: FileDetailPanelProps) {
  const router = useRouter();
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  

  // Si no hay archivo, no renderizamos nada.
  if (!item) return null;

  
  // Type guard para verificar si el item es un archivo
  const isFile = (item: Item): item is Item & FileType => {
    return item.type === 'file';
  };

  // Solo acceder a propiedades de archivo si es un archivo
  const rawMetadata = isFile(item) ? item.pulse_raw_metadata : null;
  
  const markdownSnippet = rawMetadata?.markdown
    ? rawMetadata.markdown.split('\n').slice(0, 15).join('\n')
    : null;

  // --- Funciones de Manejo de Eventos ---
  const handleReprocess = async () => {
    if (item.type !== 'file') return;
    setIsReprocessing(true);
    try {
      await fetcher(`/api/files/${item.id}/reprocess`, { method: 'POST' });
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error al reprocesar:", error);
      setShowErrorModal(true);
    } finally {
      setIsReprocessing(false);
    }
  };

    const handleOpenFolder = () => {
      const currentPath = window.location.pathname.split('/').filter(p => p);
      const newPath = [...currentPath, item.name, item.id].join('/');
      router.push(`/${newPath}`);
    };
  

  const isEditable = isFile(item) && item.mime_type.startsWith('text/');

  return (
    <>
    <aside className="absolute top-0 right-0 h-full w-full max-w-sm bg-white border-l border-gray-200 shadow-xl z-20 transform transition-transform duration-300 ease-in-out">
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 truncate">{item.name}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* --- Lógica de Botones Condicional --- */}
        <div className="space-y-2 mb-4">
          {item.type === 'folder' && (
             <button onClick={handleOpenFolder} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              Abrir Carpeta
            </button>
          )}
          {item.type === 'file' && isEditable && (
            <button onClick={() => onEdit(item as FileType)} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              <PencilSquareIcon className="w-5 h-5" />
              Editar
            </button>
          )}
          {item.type === 'file' && (
            <button onClick={handleReprocess} disabled={isReprocessing} className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
              <ArrowPathIcon className={`w-5 h-5 ${isReprocessing ? 'animate-spin' : ''}`} />
              {isReprocessing ? 'Procesando...' : 'Reprocesar'}
            </button>
          )}
        </div>

        {/* --- Lógica de Detalles Condicional --- */}
        {item.type === 'file' ? (
          <div className="space-y-4 text-sm mt-4 border-t border-gray-200 pt-4">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Estado</h4>
                <p className="capitalize rounded-full bg-green-100 text-green-800 px-3 py-1 inline-block text-xs font-medium">
                  {isFile(item) ? item.processing_status : 'N/A'}
                </p>
              </div>
              {markdownSnippet && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Vista Previa del Texto Extraído</h4>
                  <pre className="mt-1 bg-gray-50 border border-gray-200 p-3 rounded-md overflow-x-auto text-xs h-60 font-mono whitespace-pre-wrap">
                    {markdownSnippet}
                    {rawMetadata && rawMetadata.markdown.split('\n').length > 15 && "\n..."}
                  </pre>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Conteo de Líneas</h4>
                <p className="text-gray-600">{isFile(item) ? (item.pulse_line_count || 'N/A') : 'N/A'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm mt-4 border-t border-gray-200 pt-4">
            <p className="text-gray-500">Selecciona &quot;Abrir Carpeta&quot; para ver su contenido.</p>
          </div>
        )}

        {/* Botón de Eliminar (disponible para ambos) */}
        <div className="mt-6 border-t border-red-200 pt-4">
          <button
            onClick={() => onDelete({ id: item.id, type: item.type })}
            className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium border border-red-200"
          >
            <TrashIcon className="w-5 h-5" />
            Eliminar {item.type === 'folder' ? 'Carpeta' : 'Archivo'}
          </button>
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