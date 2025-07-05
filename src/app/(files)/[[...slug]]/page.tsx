'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { Folder, File as FileType } from '@/types';
import { fetcher } from '@/lib/fetcher';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FileDropzone from '@/components/ui/FileDropzone';
import Modal from '@/components/ui/Modal';
import { FolderIcon, DocumentIcon } from '@heroicons/react/24/outline';
import FileDetailPanel from '@/components/ui/FileDetailPanel';
import EditorModal from '@/components/ui/EditorModal';
import { FolderTreeNode } from '@/lib/services/folder-service'; // Importar el tipo
import FolderTree from '@/components/layout/FolderTree';

export default function FileManagerPage() {
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null);
  const [editingFile, setEditingFile] = useState<FileType | null>(null);

  const slug = params.slug as string[] | undefined;
  const parentId = slug ? Number(slug[slug.length - 1]) : null;

const foldersApiKey = `/api/folders?parentId=${parentId || ''}`;
  const { data: folders, mutate: mutateFolders } = useSWR<Folder[]>(foldersApiKey, fetcher);

  const filesApiKey = `/api/files?parentId=${parentId || ''}`;
  const { data: files, error: filesError, isLoading: filesLoading, mutate: mutateFiles } = useSWR<FileType[]>(filesApiKey, fetcher);

    const { data: folderTree } = useSWR<FolderTreeNode[]>('/api/folders/tree', fetcher);


  const items = useMemo(() => {
    const folderItems = folders?.map(f => ({ ...f, type: 'folder' as const })) || [];
    const fileItems = files?.map(f => ({ ...f, type: 'file' as const })) || [];
    return [...folderItems, ...fileItems];
  }, [folders, files]);

  const handleCreateFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolderData = { name: newFolderName, parent_id: parentId };

    mutateFolders(
      (currentData = []) => [...currentData, { ...newFolderData, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
      false
    );

    try {
      const newFolder = await fetcher('/api/folders', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(newFolderData),
      });

      mutateFolders(
         (currentData = []) => currentData?.map(f => f.id === newFolder.id ? newFolder : f),
         false
      );

    } catch (error) {
      console.error(error);
      alert('Error al crear la carpeta');
      mutateFolders(
        (currentData = []) => currentData?.filter(f => f.name !== newFolderName),
        false
      );
    } finally {
       setIsModalOpen(false);
       setNewFolderName('');
    }
  };

  const handleUploadFiles = async () => {
    if (filesToUpload.length === 0) return;

    const parentId = slug ? Number(slug[slug.length - 1]) : null;

    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append('file', file);
      if (parentId) {
        formData.append('folderId', String(parentId));
      }

      try {
        const response = await fetch('/api/files', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Error al subir ${file.name}`);
        }
        
        const newFileRecord = await response.json();
        mutateFiles((currentFiles = []) => [...currentFiles, newFileRecord], false);

        console.log('Archivo subido con éxito:', newFileRecord);
        // Aquí es donde en el futuro actualizaremos la UI con el nuevo archivo
        
      } catch (error) {
        console.error(error);
        alert(`Falló la subida de ${file.name}`);
      }
    }

    // Limpiar y cerrar el modal
    setFilesToUpload([]);
    setIsUploadModalOpen(false);
  };

  if (filesError) return <div>Error al cargar los datos. Por favor, intenta de nuevo.</div>;

  const isLoading = filesLoading

  return (
    <div className="relative flex h-screen bg-background text-primary">
      <aside className="hidden md:block w-64 bg-surface border-r border-border p-4">        
        <h1 className="text-lg font-bold">Mis Archivos</h1>
        {folderTree && <FolderTree nodes={folderTree} />}
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <Breadcrumbs slug={slug} />
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsUploadModalOpen(true)} // <-- Botón para modal de subida
              className="flex-1 bg-white border border-border text-primary font-bold py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Subir Archivo
            </button>
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90"
            >
              Nueva Carpeta
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {isLoading && <p>Cargando...</p>}
          
          {items.map((item) => {
            if (item.type === 'folder') {
              const currentPath = slug || [];
              const newPath = [...currentPath, item.name, item.id].join('/');
              return (
                <Link href={`/${newPath}`} key={`folder-${item.id}`}>
                  <div className="flex flex-col ...">
                    <FolderIcon className="w-16 h-16 text-secondary" />
                    <span className="mt-2 ...">{item.name}</span>
                  </div>
                </Link>
              );
            } else { // item.type === 'file'
              const isEditable = item.mime_type.startsWith('text/');
              return (
                <div 
                  key={`file-${item.id}`} 
                  onClick={() => setSelectedFile(item)}// <-- Hacerlo clicable
                  className="flex flex-col items-center p-4 bg-surface rounded-lg border border-border cursor-pointer hover:shadow-md hover:border-secondary transition-all"
                >
                  <DocumentIcon className="w-16 h-16 text-gray-500" />
                  <span className="mt-2 text-sm font-medium text-center truncate w-full">{item.name}</span>
                  {item.processing_status === 'pending' && <span className="text-xs text-yellow-600">Procesando...</span>}
                </div>
              );
            }
          })}
        </div>
      </main>

      {/* ... (Modal de Nueva Carpeta) ... */}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nueva Carpeta">
        <form onSubmit={handleCreateFolder}>
          <div className="mt-2">
            <label htmlFor="folderName" className="sr-only">Nombre de la Carpeta</label>
            <input
              type="text"
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full border-border border rounded-lg px-3 py-2 focus:ring-2 focus:ring-secondary focus:outline-none"
              placeholder="Nombre de la carpeta"
              autoFocus
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
              disabled={!newFolderName.trim()}
            >
              Crear
            </button>
          </div>
        </form>
      </Modal>

      {/* ... (Modal de Subir Archivos) ... */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        title="Subir Archivos"
      >
        <div className="flex flex-col gap-4">
          <FileDropzone onFilesAccepted={setFilesToUpload} />
          {filesToUpload.length > 0 && (
            <div>
              <h4 className="font-semibold">Archivos seleccionados:</h4>
              <ul className="text-sm list-disc list-inside">
                {filesToUpload.map(file => <li key={file.name}>{file.name}</li>)}
              </ul>
            </div>
          )}
          <button
            onClick={handleUploadFiles}
            disabled={filesToUpload.length === 0}
            className="w-full bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            Subir {filesToUpload.length} archivo(s)
          </button>
        </div>
      </Modal>
      <FileDetailPanel 
        file={selectedFile} 
        onClose={() => setSelectedFile(null)} 
        onEdit={(fileToEdit) => {
        setSelectedFile(null); // Cerramos el panel de detalles
        setEditingFile(fileToEdit); // Abrimos el modal de edición
  }}/>
      <EditorModal file={editingFile} onClose={() => setEditingFile(null)} />
    </div>
  );
}