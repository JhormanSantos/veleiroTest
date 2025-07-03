'use client';

import { useState, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { Folder } from '@/types';
import { fetcher } from '@/lib/fetcher';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Modal from '@/components/ui/Modal';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function FileManagerPage() {
  const params = useParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const slug = params.slug as string[] | undefined;
  const parentId = slug ? Number(slug[slug.length - 1]) : null;

  const apiKey = parentId ? `/api/folders?parentId=${parentId}` : '/api/folders';
  const { 
    data: folders, 
    error, 
    isLoading,
    mutate
  } = useSWR<Folder[]>(apiKey, fetcher);

  const handleCreateFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolderData = { name: newFolderName, parent_id: parentId };

    mutate(
      (currentData = []) => [...currentData, { ...newFolderData, id: Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }],
      false
    );

    try {
      const newFolder = await fetcher('/api/folders', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(newFolderData),
      });

      mutate(
         (currentData = []) => currentData?.map(f => f.id === newFolder.id ? newFolder : f),
         false
      );

    } catch (error) {
      console.error(error);
      alert('Error al crear la carpeta');
      mutate(
        (currentData = []) => currentData?.filter(f => f.name !== newFolderName),
        false
      );
    } finally {
       setIsModalOpen(false);
       setNewFolderName('');
    }
  };

  if (error) return <div>Error al cargar los datos. Por favor, intenta de nuevo.</div>;

  return (
    <div className="flex h-screen">
      <aside className="hidden md:block w-64 bg-surface border-r border-border p-4">        
        <h1 className="text-lg font-bold">Mis Archivos</h1>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <Breadcrumbs slug={slug} />
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Nueva Carpeta
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {isLoading && <p>Cargando...</p>}
          
          {folders?.map((folder) => {
            const currentPath = slug || [];
            const newPath = [...currentPath, folder.name, folder.id].join('/');
            
            return (
              <Link href={`/${newPath}`} key={folder.id}>
                <div className="flex flex-col items-center p-4 bg-surface rounded-lg border border-border hover:shadow-md hover:border-secondary cursor-pointer transition-all duration-200">
                  <FolderIcon className="w-16 h-16 text-secondary" />
                  <span className="mt-2 text-sm font-medium text-center truncate w-full">{folder.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

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
    </div>
  );
}