// src/lib/fetcher.ts

/**
 * Función genérica para interactuar con la API Fetch.
 * Puede manejar peticiones GET (por defecto) o cualquier otro método si se proveen opciones.
 * @param url - La URL del endpoint.
 * @param options - (Opcional) Un objeto de configuración para fetch (method, headers, body, etc.).
 * @returns Los datos en formato JSON.
 */

class ApiError extends Error {
  info: unknown;
  status: number;

  constructor(message: string, info: unknown, status: number) {
    super(message);
    this.info = info;
    this.status = status;
  }
}


export const fetcher = async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorInfo: unknown;
    try {
      errorInfo = await res.json();
    } catch (_e) {
      errorInfo = { message: `La respuesta del servidor no es un JSON válido  ${_e}. `};
    }
    // Lanzamos nuestra clase de error personalizada
    throw new ApiError('Ocurrió un error en la petición a la API.', errorInfo, res.status);
  }

  if (res.status === 204) {
    // Devolvemos null pero lo casteamos a T para satisfacer a TypeScript
    return null as T;
  }

  return res.json();
};