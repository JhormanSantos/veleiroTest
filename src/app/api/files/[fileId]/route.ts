import { NextRequest, NextResponse } from 'next/server';
import { fileService } from '@/lib/services/file-service';

function getFileIdFromUrl(url: string): string | null {
  const urlParts = url.split('/');
  // La URL será como /api/files/123
  // El ID es el último segmento
  return urlParts[urlParts.length - 1] || null;
}


export async function DELETE(
  request: NextRequest
) {
  try {
    const fileId = getFileIdFromUrl(request.url);
    if (!fileId) {
      return NextResponse.json({ message: 'ID de archivo no válido' }, { status: 400 });
    }

    await fileService.delete(Number(fileId));
    return new NextResponse(null, { status: 204 }); // 204 No Content

  } catch (error) {
    console.error("Error en DELETE /api/files/[fileId]:", error);
    return NextResponse.json({ message: 'Error al eliminar el archivo' }, { status: 500 });
  }
}