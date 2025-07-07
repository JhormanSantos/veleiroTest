// src/components/ui/EditorModal.tsx
'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-okaidia.css'; // Tema de estilos
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { fetcher } from '@/lib/fetcher';
import Modal from './Modal';
import { File as FileType } from '@/types';

interface EditorModalProps {
  file: FileType | null;
  onClose: () => void;
}

const mimeTypeToLanguage: { [key: string]: string } = {
  'text/javascript': 'javascript',
  'application/json': 'json',
  'text/css': 'css',
  'text/html': 'markup',
};

export default function EditorModal({ file, onClose }: EditorModalProps) {
  const [code, setCode] = useState('');
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const apiKey = file ? `/api/files/${file.id}/content` : null;
   const { data, error, isLoading } = useSWR<{ content: string }>(apiKey, fetcher);

  useEffect(() => {
    if (data?.content) {
      setCode(data.content);
    } else if (file && !data) {
      setCode(`// Cargando contenido de ${file.name}...`);
    }
  }, [data, file]);

  const handleSave = async () => {
    if (!file) return;
    try {
      await fetcher(`/api/files/${file.id}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: code }),
      });
      setShowSaveSuccessModal(true);
      onClose();
    } catch (error) {
      setShowSaveErrorModal(true);
      console.log(error)
    }
  };
  const handleCloseSuccessModal = () => {
    setShowSaveSuccessModal(false);
    onClose();
  };

  
  const language = file ? (mimeTypeToLanguage[file.mime_type] || 'clike') : 'clike';

  return (
    <>
      <Modal isOpen={!!file} onClose={onClose} title={`Editando: ${file?.name}`} size="4xl">
        <div className="h-[70vh] flex flex-col">
          {error && <p className="text-red-500">Error al cargar el contenido.</p>}
          
          {/* Contenedor principal del editor */}
          <div className="relative flex-grow h-full w-full overflow-auto rounded-md bg-[#272822]">
            <Editor
              value={isLoading ? `// Cargando contenido de ${file?.name}...` : code}
              onValueChange={setCode}
              highlight={(code) => highlight(code, languages[language] || languages.clike, language)}
              padding={16}
              disabled={isLoading || !!error}
              className="language-css" // Se necesita para aplicar estilos de Prism
              style={{
                fontFamily: '"Fira Code", "Fira Mono", monospace',
                color: 'white',
                fontSize: 16,
                outline: 0,
              }}
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <button onClick={handleSave} className="bg-secondary text-white font-bold py-2 px-4 rounded-lg">
              Guardar Cambios
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL DE ÉXITO AL GUARDAR */}
      <Modal
        isOpen={showSaveSuccessModal}
        onClose={handleCloseSuccessModal}
        title="Éxito"
      >
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-2">
            El archivo ha sido guardado correctamente.
          </p>
          <button
            onClick={handleCloseSuccessModal}
            className="mt-4 bg-secondary text-white font-bold py-2 px-4 rounded-lg"
          >
            Aceptar
          </button>
        </div>
      </Modal>

      {/* MODAL DE ERROR AL GUARDAR */}
      <Modal
        isOpen={showSaveErrorModal}
        onClose={() => setShowSaveErrorModal(false)}
        title="Error"
      >
        <div className="text-center">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2">
            Ocurrió un error al guardar los cambios.
          </p>
          <button
            onClick={() => setShowSaveErrorModal(false)}
            className="mt-4 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    
    
    </>

  );
}