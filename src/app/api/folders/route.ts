// src/app/api/folders/route.ts
import { folderService } from '@/services/folder-service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/folders - Obtiene carpetas.
 * Acepta un query param `parentId` para filtrar por carpeta padre.
 * Ejemplo: /api/folders?parentId=1
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parentId = searchParams.get('parentId');
  
  try {
    const folders = await folderService.getFolders(parentId ? Number(parentId) : null);
    return NextResponse.json(folders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al obtener las carpetas' }, { status: 500 });
  }
}

/**
 * POST /api/folders - Crea una nueva carpeta.
 * El body debe ser un JSON con `{ "name": "...", "parentId": ... }`
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parentId = null } = body;

    if (!name) {
      return NextResponse.json({ message: 'El nombre es requerido' }, { status: 400 });
    }

    const newFolder = await folderService.createFolder(name, parentId);
    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error al crear la carpeta' }, { status: 500 });
  }
}