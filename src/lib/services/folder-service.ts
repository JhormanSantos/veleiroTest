// src/services/folder-service.ts
import pool from '@/lib/db';
import { Folder } from '@/types';
import { RowDataPacket } from 'mysql2';

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
}


// Un objeto que agrupa todas las funciones del servicio de carpetas
export const folderService = {
  /**
   * Obtiene las carpetas. Si no se provee parentId, obtiene las carpetas raíz.
   * @param parentId - El ID de la carpeta padre para obtener sus subcarpetas.
   */
  async getFolders(parentId: number | null): Promise<Folder[]> {
    let query = 'SELECT * FROM folders WHERE parent_id IS NULL';
    const params = [];

    if (parentId) {
      query = 'SELECT * FROM folders WHERE parent_id = ?';
      params.push(parentId);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as Folder[];
  },

  /**
   * Crea una nueva carpeta.
   * @param name - El nombre de la nueva carpeta.
   * @param parentId - El ID de la carpeta padre (opcional).
   */
  async createFolder(name: string, parentId: number | null): Promise<Folder> {
    const [result] = await pool.query(
      'INSERT INTO folders (name, parent_id) VALUES (?, ?)',
      [name, parentId]
    );
    
    // Suponiendo que 'result' tiene una propiedad insertId
    const insertId = (result as any).insertId;
    const [newFolder] = await pool.query<RowDataPacket[]>('SELECT * FROM folders WHERE id = ?', [insertId]);
    
    return newFolder[0] as Folder;
  },

  async getTree(): Promise<FolderTreeNode[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM folders ORDER BY name ASC');
    const folders = rows as Folder[];
    
    const folderMap = new Map<number, FolderTreeNode>();
    const tree: FolderTreeNode[] = [];

    // Primer paso: Inicializar cada carpeta en el mapa
    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Segundo paso: Construir el árbol
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        parent?.children.push(node);
      } else {
        tree.push(node);
      }
    });

    return tree;
  },
};