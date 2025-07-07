// src/services/folder-service.ts
import pool from '@/lib/db';
import { Folder } from '@/types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { promises as fs } from 'fs';
import path from 'path';

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
    const insertId = (result as ResultSetHeader).insertId;
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


  async delete(folderId: number): Promise<void> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Encontrar todos los IDs de las carpetas descendientes (incluyendo la actual)
      const allFolderIds: number[] = [folderId];
      let currentIds = [folderId];
      
      while (currentIds.length > 0) {
        const [rows] = await connection.query<RowDataPacket[]>('SELECT id FROM folders WHERE parent_id IN (?)', [currentIds]);
        const childrenIds = rows.map(r => r.id);
        if (childrenIds.length > 0) {
          allFolderIds.push(...childrenIds);
          currentIds = childrenIds;
        } else {
          currentIds = [];
        }
      }
      
      // 2. Obtener todos los archivos a eliminar de todas esas carpetas
      const [filesToDelete] = await connection.query<RowDataPacket[]>('SELECT id, storage_key FROM files WHERE folder_id IN (?)', [allFolderIds]);
      
      if (filesToDelete.length > 0) {
        // 3. Borrar los archivos físicos del disco
        const deletePromises = filesToDelete.map(file => {
          const filePath = path.join(process.cwd(), 'uploads', file.storage_key);
          return fs.unlink(filePath).catch(err => console.error(`No se pudo borrar del disco: ${filePath}`, err));
        });
        await Promise.all(deletePromises);

        // 4. Borrar los registros de los archivos de la base de datos
        const fileIdsToDelete = filesToDelete.map(f => f.id);
        await connection.query('DELETE FROM files WHERE id IN (?)', [fileIdsToDelete]);
      }

      // 5. Borrar la carpeta principal (ON DELETE CASCADE borrará las subcarpetas)
      await connection.query('DELETE FROM folders WHERE id = ?', [folderId]);

      // 6. Si todo salió bien, confirmar la transacción
      await connection.commit();

    } catch (error) {
      // 7. Si algo falla, revertir todos los cambios
      await connection.rollback();
      console.error('Error al eliminar la carpeta y sus contenidos:', error);
      throw error; // Re-lanzar el error para que el handler de la API lo capture
    } finally {
      // 8. Siempre liberar la conexión al final
      connection.release();
    }
  },
};