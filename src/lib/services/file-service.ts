import pool from '@/lib/db';
import { File } from '@/types';
import { RowDataPacket } from 'mysql2';
import path from 'path';
import { promises as fs } from 'fs';
interface CreateFilePayload {
  name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  folder_id: number | null;
}

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export const fileService = {
  async create(payload: CreateFilePayload): Promise<File> {
    const { name, storage_key, mime_type, size_bytes, folder_id } = payload;
    const sql = `
      INSERT INTO files (name, storage_key, mime_type, size_bytes, folder_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [name, storage_key, mime_type, size_bytes, folder_id]);
    const insertId = (result as any).insertId;

    const [newFile] = await pool.query<RowDataPacket[]>('SELECT * FROM files WHERE id = ?', [insertId]);
    return newFile[0] as File;
  },

  async getByFolderId(folderId: number | null): Promise<File[]> {
    let query: string;
    const params: (number | null)[] = [folderId];

    if (folderId === null) {
      query = 'SELECT * FROM files WHERE folder_id IS NULL ORDER BY created_at DESC';
    } else {
      query = 'SELECT * FROM files WHERE folder_id = ? ORDER BY created_at DESC';
    }
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as File[];
  },

async updateWithPulseData(fileId: number, pulseData: any): Promise<void> {
    // La API no devuelve 'language' ni 'named_entities' para este endpoint.
    // Pero SÍ podemos calcular el conteo de líneas desde el campo 'markdown'.
    const line_count = pulseData?.markdown ? pulseData.markdown.split('\n').length : 0;
    
    // Los otros campos los dejaremos como nulos ya que no vienen en la respuesta.
    const language = null;
    const named_entities = null;

    const sql = `
      UPDATE files
      SET
        processing_status = 'completed',
        pulse_language = ?,
        pulse_line_count = ?,
        pulse_named_entities = ?,
        pulse_raw_metadata = ?
      WHERE id = ?
    `;

    const params = [
      language,
      line_count,
      named_entities,
      pulseData ? JSON.stringify(pulseData) : null, // Guardamos la respuesta completa
      fileId
    ];

    await pool.query(sql, params);
  },

  /**
   * Lee el contenido de un archivo desde el disco.
   * @param storageKey - El nombre único del archivo en la carpeta 'uploads'.
   * @returns El contenido del archivo como un string.
   */
  async getContent(storageKey: string): Promise<string> {
    const filePath = path.join(UPLOADS_DIR, storageKey);
    return fs.readFile(filePath, 'utf-8');
  },

  /**
   * Sobrescribe el contenido de un archivo en el disco.
   * @param storageKey - El nombre único del archivo.
   * @param newContent - El nuevo contenido para guardar.
   */
  async updateContent(storageKey: string, newContent: string): Promise<void> {
    const filePath = path.join(UPLOADS_DIR, storageKey);
    await fs.writeFile(filePath, newContent, 'utf-8');
  },
};