// src/lib/fetcher.ts

/**
 * Función genérica para interactuar con la API Fetch.
 * Puede manejar peticiones GET (por defecto) o cualquier otro método si se proveen opciones.
 * @param url - La URL del endpoint.
 * @param options - (Opcional) Un objeto de configuración para fetch (method, headers, body, etc.).
 * @returns Los datos en formato JSON.
 */
export const fetcher = async (url: string, options?: RequestInit) => {
  const res = await fetch(url, options); // Se pasan las opciones a fetch

  if (!res.ok) {
    const error = new Error('Ocurrió un error en la petición a la API.');
    try {
      (error as any).info = await res.json();
    } catch (e) {
      // Si la respuesta de error no es JSON
      (error as any).info = { message: 'La respuesta del servidor no es un JSON válido.' };
    }
    (error as any).status = res.status;
    throw error;
  }

  // Si la petición es un DELETE o alguna otra que no devuelve contenido
  if (res.status === 204) {
    return null;
  }

  return res.json();
};