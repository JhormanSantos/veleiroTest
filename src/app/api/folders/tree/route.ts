// src/app/api/folders/tree/route.ts
import { NextResponse } from 'next/server';
import { folderService } from '@/lib/services/folder-service'

export async function GET() {
  try {
    const folderTree = await folderService.getTree();
    return NextResponse.json(folderTree);
  } catch (error) {
    console.error('Error al construir el árbol de carpetas:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}