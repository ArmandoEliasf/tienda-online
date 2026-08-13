# 06 — Imágenes en Google Drive

> Fase 6. Subida real de imágenes de productos a Google Drive; en PostgreSQL solo se guarda la referencia.
> Código: `backend/scripts/googleDriveAuth.js`, `backend/src/services/googleDriveService.js`,
> `backend/src/routes/archivoRoutes.js`, `frontend/src/components/admin/ProductosAdmin.jsx`.

## 1. Qué se construyó

Hasta la Fase 5, la imagen del producto se capturaba a mano (URL + ID de Drive pegados en el formulario).
Ahora el administrador/vendedor **elige un archivo** desde su equipo y el sistema:

1. Sube el archivo a Google Drive (carpeta de quien autorizó el acceso).
2. Lo hace visible para cualquiera con el enlace (solo lectura).
3. Guarda en la tabla `imagenes` la referencia (`google_drive_id`, `url`, `nombre_archivo`) sin almacenar el binario en PostgreSQL.

La tabla `imagenes` ya existía del diseño de BD (`docs/02`); no se modificó el esquema.

## 2. OAuth 2.0 (cómo se obtiene permiso para subir)

Google no permite subir archivos sin autenticación. Se usa **OAuth 2.0 con flujo de autorización**:

- **Credenciales de cliente** (id + secreto) en `backend/.env` → `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (nunca se commitean).
- **Alcance mínimo**: `https://www.googleapis.com/auth/drive.file` → la app solo ve/administra los archivos **que ella misma crea**, no todo el Drive.
- **Flujo de un solo uso** (`backend/scripts/googleDriveAuth.js`): imprime una URL de consentimiento, el dueño del Drive la abre y autoriza; el script captura el código en un servidor local (`http://127.0.0.1:5876`), lo intercambia por un `refresh_token` y lo guarda en `backend/drive-token.json` (gitignoreado).
- **Vida útil**: el `access_token` dura 1 h. Cuando expira, el servicio usa el `refresh_token` para obtener uno nuevo automáticamente (los refresh tokens no caducan mientras no se revoquen).

```
Administrador ──abre URL de consentimiento──► Google
Google ──redirige a 127.0.0.1:5876?code=...──► script
script ──intercambia code por refresh_token──► guarda drive-token.json
App ──sube archivo con access_token──► Drive API
```

### Nota de configuración (Google Cloud Console)

- Habilitar la **Google Drive API** en el proyecto.
- Configurar la **pantalla de consentimiento**.
- En las credenciales OAuth, el `redirect_uri` debe ser `http://127.0.0.1:5876` (exacto, sin ruta). En clientes tipo "Web application" es obligatorio registrarlo; los de tipo "Desktop app" aceptan loopback automáticamente. Los cambios de configuración pueden tardar de minutos a horas en propagarse.

## 3. Servicio de Google Drive (`googleDriveService.js`)

- `obtenerAccessToken()`: lee `drive-token.json`, refresca si está vencido (margen de 60 s) y devuelve un token vigente. Si no hay `refresh_token`, responde con la instrucción de ejecutar el script.
- `uploadArchivo(buffer, nombreArchivo, mimeType)`:
  1. Subida **multipart** a `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart` (parte `metadata` con el nombre + parte `file` con los bytes).
  2. `permissions.create` con `{ role: 'reader', type: 'anyone' }` → la imagen se muestra en el sitio sin pedir cuenta de Google.
  3. Devuelve `{ google_drive_id, url: https://drive.google.com/uc?export=view?id=..., nombre_archivo }`.

El servicio usa el `fetch` global de Node 20 y convierte los errores de la API de Google en `ApiError` (502) con el mensaje que devuelve Google.

### Carpeta de imágenes

Con el alcance `drive.file`, la app solo accede a lo que ella misma crea, por lo que la **carpeta la crea la aplicación** (una vez) y reutiliza su ID:

- Nombre configurable en `GOOGLE_DRIVE_FOLDER_NOMBRE` (`.env`), por defecto `Tiendita las joyas - imagenes`.
- `obtenerOCrearCarpeta()`: si no hay carpeta guardada, la crea en la raíz del Drive y persiste su `carpeta_id` junto al token (`backend/drive-token.json`).
- Las subidas incluyen `parents: [carpeta_id]` en los metadatos → la imagen queda dentro de la carpeta.
- Script de verificación: `node backend/scripts/googleDriveFolder.js` (imprime ID y enlace a la carpeta).

## 4. Endpoint de subida `POST /api/archivos`

| Parte | Detalle |
|---|---|
| Acceso | `requireAuth` + `requireRole('vendedor', 'administrador')` |
| Middleware | `upload.single('archivo')` con `multer` (memoria, máx. 5 MB, solo JPG/PNG/WEBP/GIF) |
| Respuesta | `201 { archivo: { google_drive_id, url, nombre_archivo } }` |
| Errores | 400 si falta el archivo, no es imagen o supera 5 MB; 503 si Drive no está autorizado/configurado |

Los errores de `multer` (p. ej. `LIMIT_FILE_SIZE`) se traducen a `ApiError` 400 con mensaje en español (`backend/src/middleware/upload.js`).

## 5. Frontend

En `ProductosAdmin.jsx` (formulario de producto):

- Campo **Subir imagen a Google Drive** (`<input type="file">`): al elegir un archivo se llama a `subirImagen()` (`services/admin.js`), que envía `FormData` a `/api/archivos` con el token JWT.
- Al recibir la respuesta, se autocompletan `imagen_url`, `imagen_google_drive_id` e `imagen_nombre_archivo` y se muestra una **vista previa**.
- Los campos manuales (URL / ID) siguen disponibles como respaldo.
- Al guardar, `datos.imagen` llega al backend como antes (`productoService.create` → `setImagenPrincipal`), de modo que la Fase 5 no se tocó.

## 6. Seguridad

- Credenciales de OAuth: solo en `backend/.env` (gitignoreado).
- `refresh_token`: solo en `backend/drive-token.json` (gitignoreado). Es la llave maestra de la cuenta de Drive: **nunca se comparte ni se commitea**.
- La app usa el alcance mínimo (`drive.file`): no puede borrar o listar archivos que no haya creado.
- El permiso público es de solo lectura (`reader`); nadie externo puede modificar la imagen.
- La subida exige sesión de vendedor/administrador; los compradores no pueden subir archivos.

## 7. Verificación

1. `node backend/scripts/googleDriveAuth.js` → autorizar en el navegador → se genera `backend/drive-token.json`.
2. `POST /api/archivos` con un JPG (multipart, campo `archivo`) → `201` con `google_drive_id` y `url`.
3. Abrir la `url` devuelta en el navegador → se muestra la imagen (sin iniciar sesión).
4. Crear un producto desde el panel admin subiendo la imagen → el catálogo la muestra.
5. Casos negativos: subir un `.txt` → 400; archivo > 5 MB → 400; sin token JWT → 401; sin `drive-token.json` → 503 con instrucciones.

## 8. Cómo ejecutar

```bash
# 1) Autorizar una vez (solo la primera vez, tras configurar Google Cloud)
cd backend
node scripts/googleDriveAuth.js   # abre la URL, autoriza, se guarda drive-token.json

# 2) (Opcional) Crear/verificar la carpeta de imágenes
node scripts/googleDriveFolder.js

# 3) Levantar la app como siempre
cd backend && npm run dev   # :4000
cd frontend && npm run dev  # :5173

# 4) Panel admin → Productos → Nuevo producto → Subir imagen
```
