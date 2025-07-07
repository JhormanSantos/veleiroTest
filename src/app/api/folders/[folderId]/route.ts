// src/app/api/folders/[folderId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { folderService } from '@/lib/services/folder-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const { folderId } = await params;
    await folderService.delete(Number(folderId));
    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error) {
    console.error('Error al eliminar la carpeta:', error);
    return NextResponse.json({ message: 'Error al eliminar la carpeta' }, { status: 500 });
  }
}