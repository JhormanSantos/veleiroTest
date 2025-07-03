// src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import { fileService } from '@/lib/services/file-service';
import { pulseService } from '@/lib/services/pulse-service';

// Deshabilitamos el bodyParser por defecto de Next.js
// para que formidable pueda procesar el stream del archivo.
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get('parentId');

  try {
    const files = await fileService.getByFolderId(folderId ? parseInt(folderId) : null);
    return NextResponse.json(files);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return NextResponse.json({ message: 'Error al obtener archivos.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folderId = formData.get('folderId') as string | null;

  if (!file) {
    return NextResponse.json({ message: 'No se ha subido ningún archivo.' }, { status: 400 });
  }

  // 1. Guardar el archivo en el servidor
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const filePath = path.join(uploadsDir, uniqueFilename);

  try {
    await fs.mkdir(uploadsDir, { recursive: true }); // Asegurarse de que el directorio exista
    await fs.writeFile(filePath, buffer);

    // 2. Crear el registro en la base de datos
    const newFileRecord = await fileService.create({
      name: file.name,
      storage_key: uniqueFilename, // Guardamos solo el nombre único del archivo
      mime_type: file.type,
      size_bytes: file.size,
      folder_id: folderId ? parseInt(folderId) : null,
    });

    const pulseData = await pulseService.processFile(filePath);

    // 4. Actualizar la BD con los metadatos de Pulse
    await fileService.updateWithPulseData(newFileRecord.id, pulseData);
    
    // Opcional: Obtener el registro actualizado para devolverlo al frontend
    const finalFileRecord = { ...newFileRecord, ...pulseData.analysis, processing_status: 'completed' };

    // 5. Responder al frontend con el registro completo y actualizado
    return NextResponse.json(finalFileRecord, { status: 201 });

  } catch (error) {
    console.error('Error en la subida de archivo:', error);
    return NextResponse.json({ message: 'Error al guardar el archivo.' }, { status: 500 });
  }
}