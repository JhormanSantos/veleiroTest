// src/app/api/folders/__test__/route.test.ts
import { POST } from '../route';
import { folderService } from '@/lib/services/folder-service';
import { NextRequest } from 'next/server';

// Mock del servicio de carpetas
jest.mock('@/lib/services/folder-service');
const mockedFolderService = folderService as jest.Mocked<typeof folderService>;

describe('/api/folders - POST', () => {

  // Limpiamos los mocks después de cada prueba para evitar interferencias
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería crear una nueva carpeta y devolver un status 201', async () => {
    // 1. Arrange (Preparación)
    const now = new Date().toISOString();
    const newFolderName = 'Carpeta de Integración';
    const mockRequestBody = { name: newFolderName, parent_id: null }; // <-- CORRECCIÓN 1: Usar parent_id
    const mockCreatedFolder = { id: 1, ...mockRequestBody, created_at: now, updated_at: now };

    mockedFolderService.createFolder.mockResolvedValue(mockCreatedFolder);

    const request = {
      json: jest.fn().mockResolvedValue(mockRequestBody),
    } as unknown as NextRequest;
    // ---------------------------------------------------------

    // 2. Act (Actuación)
    const response = await POST(request);
    const body = await response.json();

    // 3. Assert (Aserción)
    expect(response.status).toBe(201);
    expect(body).toEqual(mockCreatedFolder);
    expect(mockedFolderService.createFolder).toHaveBeenCalledWith(newFolderName, null);
    expect(mockedFolderService.createFolder).toHaveBeenCalledTimes(1);
  });

  it('debería devolver un status 400 si no se provee un nombre', async () => {
    // 1. Arrange
    const mockRequestBody = { name: '', parent_id: null }; // <-- CORRECCIÓN 1

    const request = {
      json: jest.fn().mockResolvedValue(mockRequestBody),
    } as unknown as NextRequest;
    // ------------------------------------------------

    // 2. Act
    const response = await POST(request);
    const body = await response.json();

    // 3. Assert
    expect(response.status).toBe(400);
    expect(body.message).toBe('El nombre es requerido');
  });
});