// src/app/api/files/[fileId]/reprocess/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import pool from '@/lib/db';
import { fileService } from '@/lib/services/file-service';
import { pulseService } from '@/lib/services/pulse-service';
import { RowDataPacket } from 'mysql2';

// Función auxiliar para obtener todos los detalles necesarios del archivo
async function getFileDetails(fileId: string): Promise<{ storage_key: string; name: string; mime_type: string } | null> {
    // 👇 Pedimos todos los campos que necesitamos
    const [rows] = await pool.query<RowDataPacket[]>('SELECT storage_key, name, mime_type FROM files WHERE id = ?', [fileId]);
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as { storage_key: string; name: string; mime_type: string };
}

// Helper para obtener el ID desde la URL
function getFileIdFromUrl(url: string): string | null {
  const urlParts = url.split('/');
  const reprocessIndex = urlParts.indexOf('reprocess');
  if (reprocessIndex > 1) {
    return urlParts[reprocessIndex - 1];
  }
  return null;
}

export async function POST(
  request: NextRequest,
) {
  // 👇 Solución para el error de `params`
  const fileId = getFileIdFromUrl(request.url);

  if (!fileId) {
      return NextResponse.json({ message: 'URL mal formada' }, { status: 400 });
  }

  try {
    // 1. Obtener TODOS los detalles del archivo
    const fileDetails = await getFileDetails(fileId);
    if (!fileDetails) {
      return NextResponse.json({ message: 'Archivo no encontrado' }, { status: 404 });
    }
    
    const { storage_key, name, mime_type } = fileDetails;
    const filePath = path.join(process.cwd(), 'uploads', storage_key);

    // 2. Volver a procesar con Pulse, AHORA con todos los argumentos
    const pulseData = await pulseService.processFile(
      filePath,
      name,      // Pasamos el nombre original
      mime_type  // Pasamos el tipo MIME
    );

    // 3. Actualizar la BD con los nuevos metadatos
    await fileService.updateWithPulseData(Number(fileId), pulseData);
    
    // 4. Devolver una respuesta exitosa
    return NextResponse.json({ message: `Archivo ${fileId} reprocesado con éxito.` });

  } catch (error) {
    console.error(`Error al reprocesar el archivo ${fileId}:`, error);
    return NextResponse.json({ message: 'Error al reprocesar el archivo.' }, { status: 500 });
  }
}