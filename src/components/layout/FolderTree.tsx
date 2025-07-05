// src/components/layout/FolderTree.tsx
'use client';

import Link from 'next/link';
import { FolderTreeNode } from '@/lib/services/folder-service'; // Importamos el tipo
import { FolderIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface FolderTreeProps {
  nodes: FolderTreeNode[];
  level?: number; // Para la indentación
}

export default function FolderTree({ nodes, level = 0 }: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<number, boolean>>({});

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };
  
  return (
    <ul className="space-y-1">
      {nodes.map(node => (
        <li key={node.id}>
          <div 
            className="flex items-center p-1 rounded-md hover:bg-gray-100"
            style={{ paddingLeft: `${level * 16 + 4}px` }} // Indentación dinámica
          >
            {node.children.length > 0 && (
              <ChevronRightIcon
                onClick={() => toggleFolder(node.id)}
                className={`w-4 h-4 mr-1 cursor-pointer transition-transform ${expandedFolders[node.id] ? 'rotate-90' : ''}`}
              />
            )}
            <FolderIcon className="w-5 h-5 mr-2 text-secondary flex-shrink-0" />
            <Link href={`/${node.name}/${node.id}`} className="text-sm truncate">
              {node.name}
            </Link>
          </div>
          {node.children.length > 0 && expandedFolders[node.id] && (
            // 👇 ¡La Recursión! El componente se llama a sí mismo.
            <FolderTree nodes={node.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}