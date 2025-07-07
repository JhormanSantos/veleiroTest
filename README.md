# Sistema de Gestión y Procesamiento de Archivos

Este es un proyecto full-stack desarrollado como parte de una evaluación técnica. [cite_start]La aplicación permite a los usuarios gestionar un sistema de archivos virtual, incluyendo la creación de carpetas, subida de archivos, edición de texto en línea y procesamiento de documentos a través de la API de Pulse

**Video de Demostración:** `https://www.youtube.com/watch?v=IsAMqEouzhY`

## ✨ Características Principales

* [cite_start]**Gestión de Archivos y Carpetas:** Crea, elimina y navega por una estructura de carpetas anidada. 
* [cite_start]**Subida de Archivos:** Sube múltiples tipos de archivos (PDF, DOCX, XLSX, imágenes, etc.) a través de un área de "arrastrar y soltar". 
* **Procesamiento de Documentos:** Se integra con la API de Pulse para extraer metadatos de los archivos subidos. [cite_start]Los usuarios pueden volver a procesar cualquier archivo a demanda. 
* [cite_start]**Panel de Detalles:** Visualiza los metadatos extraídos, como el texto completo (OCR) y el conteo de líneas, en un panel lateral intuitivo. 
* [cite_start]**Editor en Línea:** Edita archivos de texto y código directamente en el navegador con resaltado de sintaxis. 
* **Diseño Responsivo:** La interfaz se adapta a dispositivos móviles y de escritorio.

## 🏛️ Arquitectura

El proyecto sigue una arquitectura de aplicación web moderna, separando claramente las responsabilidades entre el frontend, el backend y los servicios externos.

```mermaid
graph TD
    A[Usuario] --> B{Frontend (Next.js/React)};
    B <--> C{Backend (Next.js API Routes)};
    C <--> D[(MySQL en Docker)];
    C --> E[API Externa: Pulse];

    subgraph "Tu Aplicación"
        B
        C
        D
    end

    style D fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
```

* **Frontend**: Construido con **Next.js** y **React**, utilizando **Tailwind CSS** para un diseño rápido y consistente. El estado de datos del servidor se maneja con **SWR** para una experiencia de usuario reactiva y eficiente.
* **Backend**: Implementado con **API Routes de Next.js**, siguiendo un patrón de capas (`Ruta -> Servicio -> Acceso a Datos`) para una lógica limpia y mantenible.
* **Base de Datos**: Se utiliza **MySQL**, orquestado a través de **Docker**, para garantizar un entorno de desarrollo consistente y una base de datos relacional robusta.
* **Servicios Externos**: Se integra con la **API de Pulse** para el procesamiento de documentos.

## 🛠️ Stack Tecnológico y Justificación

* **Next.js (con App Router)**: Elegido por su capacidad para manejar tanto el frontend como el backend en un único framework, lo que simplifica el desarrollo y el despliegue. [cite_start]El App Router permite un enrutamiento moderno y layouts anidados. 
* **TypeScript**: Utilizado para garantizar la seguridad de tipos en todo el proyecto, reduciendo errores en tiempo de ejecución y mejorando la mantenibilidad del código.
* [cite_start]**MySQL**: Seleccionado por ser una base de datos relacional robusta y ampliamente utilizada, ideal para manejar las relaciones entre carpetas y archivos. 
* **Docker & Docker Compose**: Imprescindible para cumplir con el requisito de DevOps de un inicio con un solo comando. [cite_start]Garantiza que cualquier desarrollador pueda levantar el stack completo (app + base de datos) de forma idéntica y sin conflictos de entorno. 
* **SWR**: Elegido para el fetching de datos en el frontend por su simplicidad, manejo automático de caché, revalidación y actualizaciones en tiempo real, lo que crea una UI muy fluida.
* [cite_start]**Tailwind CSS**: Utilizado para estilizar la interfaz de forma rápida y consistente, siguiendo un enfoque de "utility-first" que se alinea bien con componentes de React. 
* [cite_start]**Jest & React Testing Library**: El estándar de la industria para escribir tests unitarios y de integración en aplicaciones React, asegurando la fiabilidad del código. 

## 🚀 Setup y Ejecución Local

Para levantar el proyecto completo, solo necesitas tener **Docker** y **Docker Compose** instalados.

1.  **Clonar el Repositorio**
    ```bash
    git clone [TU_URL_DEL_REPOSITORIO]
    cd [NOMBRE_DEL_DIRECTORIO]
    ```

2.  **Crear el Archivo de Entorno**
    Crea un archivo `.env` en la raíz del proyecto.

    ```env
    # .env

    # Base de Datos MySQL
    MYSQL_DATABASE=file_intake_system
    MYSQL_USER=user
    MYSQL_PASSWORD=password
    MYSQL_ROOT_PASSWORD=rootpassword

    # Pulse API Key
    PULSE_API_KEY="TU_API_KEY_DE_PULSE"
    ```

3.  **Levantar el Stack con Docker Compose**
    Ejecuta el siguiente comando. Esto construirá la imagen de la aplicación y levantará los contenedores de la app y la base de datos.
    ```bash
    docker-compose up --build
    ```

4.  **Acceder a la Aplicación**
    Una vez que los contenedores estén corriendo, abre tu navegador y ve a `http://localhost:3000`.

## 🧪 Cómo Correr los Tests

Los tests están configurados con Jest. Para ejecutarlos, puedes hacerlo dentro del contenedor de la aplicación o localmente si tienes Node.js instalado.

Para correr los tests dentro del contenedor (recomendado):
```bash
# Asegúrate que los contenedores estén corriendo con 'docker-compose up'
docker-compose exec app npm test
```

## 📄 Contrato de la API

La aplicación expone los siguientes endpoints principales:

| Método | Ruta                      | Descripción                                        |
| :----- | :------------------------ | :------------------------------------------------- |
| `GET`  | `/api/folders`            | Obtiene las carpetas hijas de un `parentId` dado.  |
| `POST` | `/api/folders`            | Crea una nueva carpeta.                            |
| `GET`  | `/api/folders/tree`       | Obtiene toda la estructura de carpetas anidada.    |
| `DELETE`| `/api/folders/[folderId]`| Elimina una carpeta y sus contenidos.              |
| `GET`  | `/api/files`              | Obtiene los archivos de un `parentId` dado.        |
| `POST` | `/api/files`              | Sube un archivo, lo guarda y lo procesa con Pulse. |
| `DELETE`| `/api/files/[fileId]`    | Elimina un archivo.                                |
| `GET`  | `/api/files/[fileId]/content`| Obtiene el contenido de texto de un archivo.    |
| `PUT`  | `/api/files/[fileId]/content`| Actualiza el contenido de texto de un archivo.     |
| `POST` | `/api/files/[fileId]/reprocess`| Vuelve a procesar un archivo con Pulse.        |


## 🤖 Desarrollo Asistido por IA

Este proyecto se desarrolló con la asistencia de un modelo de lenguaje grande (Gemini de Google). La IA se utilizó para:
* Generar código boilerplate (ej. configuraciones de Docker y Jest).
* Sugerir soluciones a errores de código y de tipado.
* Explicar conceptos complejos (ej. transacciones de BD, "race conditions").
* Refactorizar código para seguir mejores prácticas.

**Log de Conversación:** `https://g.co/gemini/share/61751e420f04`
**Video de Reflexión:** `https://www.youtube.com/watch?v=irDLUw7uWwU`