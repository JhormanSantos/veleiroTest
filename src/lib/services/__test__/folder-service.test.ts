// src/services/folder-service.test.ts

import { folderService } from '../folder-service';
import pool from '@/lib/db';

// Mock del módulo de la base de datos
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}));

// Casteamos el pool mockeado para tener autocompletado de Jest
const mockedPool = pool as jest.Mocked<typeof pool>;

describe('folderService', () => {

  // Limpiamos los mocks después de cada test
  afterEach(() => {
    (mockedPool.query as jest.Mock).mockClear();
  });

  it('debería crear una nueva carpeta y devolverla', async () => {
    // 1. Arrange (Preparación)
    const newFolderName = 'Carpeta de Prueba';
    const parentId = null;

    // Simulamos la respuesta de la BD para el INSERT
    (mockedPool.query as jest.Mock).mockResolvedValueOnce([{ insertId: 123 }]);

    // Simulamos la respuesta de la BD para el SELECT de la nueva carpeta
    const mockNewFolder = { id: 123, name: newFolderName, parent_id: parentId };
    (mockedPool.query as jest.Mock).mockResolvedValueOnce([[mockNewFolder]]);

    // 2. Act (Actuación)
    const result = await folderService.createFolder(newFolderName, parentId);

    // 3. Assert (Aserción)
    expect(result).toEqual(mockNewFolder);
    expect(mockedPool.query).toHaveBeenCalledTimes(2); // Se llamó a la BD dos veces
    expect(mockedPool.query).toHaveBeenCalledWith(
      'INSERT INTO folders (name, parent_id) VALUES (?, ?)',
      [newFolderName, parentId]
    );
  });

});