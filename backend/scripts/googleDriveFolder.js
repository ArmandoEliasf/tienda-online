import 'dotenv/config';
import { obtenerOCrearCarpeta } from '../src/services/googleDriveService.js';

try {
  const carpetaId = await obtenerOCrearCarpeta();
  console.log('Carpeta lista en Google Drive:');
  console.log(`  ID:     ${carpetaId}`);
  console.log(`  Enlace: https://drive.google.com/drive/folders/${carpetaId}`);
  console.log('Las imágenes de productos se subirán dentro de esta carpeta.');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
