import pool from '@/lib/db';
import { File } from '@/types';
import { RowDataPacket } from 'mysql2';

interface CreateFilePayload {
  name: string;
  storage_key: string;
  mime_type: string;
  size_bytes: number;
  folder_id: number | null;
}

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
    const { language, line_count, named_entities } = pulseData.analysis;

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

    // Guardamos las entidades y los metadatos crudos como strings JSON
    const params = [
      language,
      line_count,
      JSON.stringify(named_entities),
      JSON.stringify(pulseData),
      fileId
    ];

    await pool.query(sql, params);
  },
};