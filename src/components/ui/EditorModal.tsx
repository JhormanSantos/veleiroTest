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
  const apiKey = file ? `/api/files/${file.id}/content` : null;
  const { data, error, isLoading } = useSWR(apiKey, fetcher);

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
      alert('Guardado!');
      onClose();
    } catch (err) {
      alert('Error al guardar.');
    }
  };
  
  const language = file ? (mimeTypeToLanguage[file.mime_type] || 'clike') : 'clike';

  return (
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
  );
}