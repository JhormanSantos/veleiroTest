// src/app/api/files/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fileService } from '@/lib/services/file-service';
import { pulseService } from '@/lib/services/pulse-service';





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

    // 2. Crear el registro inicial en la base de datos
    const newFileRecord = await fileService.create({
      name: file.name,
      storage_key: uniqueFilename,
      mime_type: file.type,
      size_bytes: file.size,
      folder_id: folderId ? parseInt(folderId) : null,
    });

    // 3. Llamamos a Pulse con los argumentos requeridos: filePath, nombre y tipo del archivo.
    const pulseData = await pulseService.processFile(
      filePath,
      file.name,
      file.type
    );

    // 4. Actualizar la BD con los metadatos de Pulse
    await fileService.updateWithPulseData(newFileRecord.id, pulseData);
    
    // 5. Construir el registro final para devolverlo al frontend
    // Esto asegura que el cliente reciba el estado 'completed' y los metadatos.

    const line_count = pulseData?.markdown ? pulseData.markdown.split('\n').length : 0;


    const finalFileRecord = { 
      ...newFileRecord, 
      processing_status: 'completed',
      pulse_language: null,
      pulse_line_count: line_count,
      pulse_named_entities: null,
      pulse_raw_metadata: pulseData,
    };

    // 6. Responder al frontend con el registro completo y actualizado
    return NextResponse.json(finalFileRecord, { status: 201 });

  } catch (error) {
    console.error('Error en la subida y procesamiento de archivo:', error);
    // Opcional: Aquí podrías querer actualizar el estado del archivo a 'failed' en la BD.
    return NextResponse.json({ message: 'Error al procesar el archivo.' }, { status: 500 });
  }
}