import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ApiError } from '../middleware/errorHandler.js';

const TOKEN_FILE = new URL('../../drive-token.json', import.meta.url);
const API_BASE = 'https://www.googleapis.com';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';

function config() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new ApiError(503, 'Google Drive no está configurado (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');
  }
  return { clientId, clientSecret };
}

function leerToken() {
  if (!existsSync(TOKEN_FILE)) return null;
  try {
    return JSON.parse(readFileSync(TOKEN_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function guardarToken(token) {
  writeFileSync(TOKEN_FILE, JSON.stringify(token, null, 2));
}

function estaVigente(token) {
  return Boolean(token?.access_token) && token.expires_at > Date.now() + 60000;
}

async function solicitarToken(body) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new ApiError(502, data.error_description || data.error || 'No se pudo obtener el token de Google');
  }
  return data;
}

export async function obtenerAccessToken() {
  const { clientId, clientSecret } = config();
  const token = leerToken();
  if (!token?.refresh_token) {
    throw new ApiError(
      503,
      'Google Drive sin autorizar. Ejecuta: node backend/scripts/googleDriveAuth.js y completa el flujo en el navegador',
    );
  }
  if (!estaVigente(token)) {
    const data = await solicitarToken({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    });
    guardarToken({
      ...token,
      access_token: data.access_token,
      expires_at: Date.now() + data.expires_in * 1000,
    });
    return data.access_token;
  }
  return token.access_token;
}

export async function obtenerOCrearCarpeta() {
  const accessToken = await obtenerAccessToken();
  const token = leerToken();
  if (token?.carpeta_id) return token.carpeta_id;

  const nombre = process.env.GOOGLE_DRIVE_FOLDER_NOMBRE || 'Tiendita las joyas - imagenes';
  const res = await fetch(`${API_BASE}/drive/v3/files?fields=id,name`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: nombre,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(502, data.error?.message || 'No se pudo crear la carpeta en Google Drive');
  }
  guardarToken({ ...token, carpeta_id: data.id });
  return data.id;
}

export async function uploadArchivo(buffer, nombreArchivo, mimeType) {
  const accessToken = await obtenerAccessToken();
  const carpetaId = await obtenerOCrearCarpeta();

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify({ name: nombreArchivo, parents: [carpetaId] })], {
      type: 'application/json',
    }),
  );
  form.append('file', new Blob([buffer], { type: mimeType }), nombreArchivo);

  const res = await fetch(`${API_BASE}/upload/drive/v3/files?uploadType=multipart&fields=id,name`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(502, data.error?.message || 'No se pudo subir la imagen a Google Drive');
  }

  const perm = await fetch(`${API_BASE}/drive/v3/files/${data.id}/permissions?fields=id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });
  const permData = await perm.json().catch(() => ({}));
  if (!perm.ok) {
    throw new ApiError(502, permData.error?.message || 'No se pudo hacer pública la imagen');
  }

  return {
    google_drive_id: data.id,
    url: `https://drive.google.com/uc?export=view&id=${data.id}`,
    nombre_archivo: data.name,
  };
}

export { SCOPE };
