// src/services/folder-service.ts
import pool from '@/lib/db';
import { Folder } from '@/types';
import { RowDataPacket } from 'mysql2';

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
};