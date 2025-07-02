import mysql from 'mysql2/promise';

// Lee la URL de conexión desde las variables de entorno
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno");
}

// Crea un "pool" de conexiones. Es más eficiente que crear una nueva conexión
// para cada consulta, ya que reutiliza las conexiones existentes.
const pool = mysql.createPool(connectionString);

// Exportamos el pool para usarlo en nuestros servicios del backend.
export default pool;