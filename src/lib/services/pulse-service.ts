import { createReadStream } from 'fs';

const PULSE_API_URL = 'https://pro.api.runpulse.com/extract_beta';
const PULSE_API_KEY = process.env.PULSE_API_KEY;

export const pulseService = {
  /**
   * Envía un archivo a la API de Pulse para su procesamiento.
   * @param filePath - La ruta completa al archivo en nuestro servidor (ej. /path/to/uploads/file.pdf)
   * @returns Los metadatos extraídos por la API.
   */
  async processFile(filePath: string): Promise<any> {
    if (!PULSE_API_KEY) {
      throw new Error('La API Key de Pulse no está configurada.');
    }

    try {
      const fileStream = createReadStream(filePath);

      const response = await fetch(PULSE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PULSE_API_KEY}`,
        },
        body: fileStream as any,
        duplex: 'half',
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error de la API de Pulse:', errorBody);
        throw new Error(`Error de Pulse API: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Falló la comunicación con Pulse API:', error);
      throw error;
    }
  },
};