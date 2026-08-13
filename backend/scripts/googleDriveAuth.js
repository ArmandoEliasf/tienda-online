import 'dotenv/config';
import http from 'node:http';
import { writeFileSync } from 'node:fs';

const PORT = Number(process.env.GOOGLE_DRIVE_REDIRECT_PORT || 5876);
const REDIRECT_URI = `http://127.0.0.1:${PORT}`;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const TOKEN_FILE = new URL('../drive-token.json', import.meta.url);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en backend/.env');
  process.exit(1);
}

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  response_type: 'code',
  scope: SCOPE,
  access_type: 'offline',
  prompt: 'consent',
})}`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);

  const error = url.searchParams.get('error');
  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<h3>Error: ${error}</h3><p>${url.searchParams.get('error_description') || ''}</p>`);
    console.error('Autorización rechazada en el navegador.');
    server.close(() => process.exit(1));
    return;
  }

  const code = url.searchParams.get('code');
  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<p>Procesando autorización... vuelve a la terminal.</p>');
    return;
  }

  try {
    const resp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.refresh_token) {
      throw new Error(data.error_description || data.error || 'No se obtuvo refresh_token');
    }
    writeFileSync(
      TOKEN_FILE,
      JSON.stringify(
        {
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: Date.now() + data.expires_in * 1000,
        },
        null,
        2,
      ),
    );
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h3>Autorización completada</h3><p>Ya puedes cerrar esta pestaña.</p>');
    console.log('Token guardado en backend/drive-token.json');
    server.close(() => process.exit(0));
  } catch (err) {
    console.error('Error al intercambiar el código:', err.message);
    server.close(() => process.exit(1));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`1) Abre esta URL en el navegador y autoriza Google Drive:\n\n${authUrl}\n`);
  console.log('2) Este script captura la respuesta automáticamente al autorizar.\n');
  console.log(
    `Si la URL devuelve "redirect_uri_mismatch": el cliente OAuth es tipo "Web application" ` +
      `y debes registrar "${REDIRECT_URI}" como URI de redireccionamiento autorizada en la consola de Google Cloud.`,
  );
});
