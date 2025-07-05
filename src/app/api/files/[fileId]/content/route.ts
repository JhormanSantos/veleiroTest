// src/app/api/files/[fileId]/content/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { fileService } from '@/lib/services/file-service';
import { RowDataPacket } from 'mysql2';

function getFileIdFromUrl(url: string): string | null {
  const urlParts = url.split('/');
  // La URL será como /api/files/123/content
  // El ID estará en la antepenúltima posición
  const contentIndex = urlParts.indexOf('content');
  if (contentIndex > 1) {
    return urlParts[contentIndex - 1];
  }
  return null;
}

// GET /api/files/[fileId]/content
export async function GET(request: NextRequest) {
  try {
    const fileId = getFileIdFromUrl(request.url); // <-- NUEVO MÉTODO
    if (!fileId) {
      return NextResponse.json({ message: 'URL mal formada' }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT storage_key FROM files WHERE id = ?', [fileId]);
    
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Archivo no encontrado' }, { status: 404 });
    }
    
    const storageKey = rows[0].storage_key;
    const content = await fileService.getContent(storageKey);
    return NextResponse.json({ content });

  } catch (error) {
    console.error('Error en GET /content:', error);
    return NextResponse.json({ message: 'Error al leer el archivo' }, { status: 500 });
  }
}

// PUT /api/files/[fileId]/content
export async function PUT(request: NextRequest) {
  try {
    const fileId = getFileIdFromUrl(request.url); // <-- NUEVO MÉTODO
    if (!fileId) {
      return NextResponse.json({ message: 'URL mal formada' }, { status: 400 });
    }

    const { content } = await request.json();
    if (typeof content !== 'string') {
        return NextResponse.json({ message: 'El contenido debe ser un string' }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>('SELECT storage_key FROM files WHERE id = ?', [fileId]);
    if (rows.length === 0) {
      return NextResponse.json({ message: 'Archivo no encontrado' }, { status: 404 });
    }

    const storageKey = rows[0].storage_key;
    await fileService.updateContent(storageKey, content);
    return NextResponse.json({ message: 'Archivo guardado con éxito' });

  } catch (error) {
    console.error('Error en PUT /content:', error);
    return NextResponse.json({ message: 'Error al guardar el archivo' }, { status: 500 });
  }
}