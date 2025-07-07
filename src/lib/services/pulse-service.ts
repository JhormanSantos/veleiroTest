
import { promises as fs } from 'fs';
import { PulseApiResponse } from '@/types';

const PULSE_API_URL = 'https://pro.api.runpulse.com/extract_beta';

export const pulseService = {
  /**
   * Envía un archivo a la API de Pulse para su procesamiento.
   */
  async processFile(filePath: string, originalFilename: string, mimeType: string): Promise<PulseApiResponse> {
    const PULSE_API_KEY = process.env.PULSE_API_KEY;
    if (!PULSE_API_KEY) {
      throw new Error('La API Key de Pulse no está configurada.');
    }

    try {
      const fileBuffer = await fs.readFile(filePath);
      
      const fileBlob = new Blob([fileBuffer], { type: mimeType });
      
      const formData = new FormData();
      formData.append('file', fileBlob, originalFilename);

      const response = await fetch(PULSE_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': PULSE_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error de la API de Pulse:', errorBody);
        throw new Error(`Error de Pulse API: ${response.status} ${response.statusText}`);
      }

      const pulseDataResponse = await response.json();
      console.log('RESPUESTA COMPLETA DE PULSE:', JSON.stringify(pulseDataResponse, null, 2));
      return pulseDataResponse;

      return await response.json();
    } catch (error) {
      console.error('Falló la comunicación con Pulse API:', error);
      throw error;
    }
  },
};