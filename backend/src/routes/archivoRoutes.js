import { Router } from 'express';
import { upload, descargar } from '../controllers/archivoController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { subirImagen } from '../middleware/upload.js';

const router = Router();

router.post('/', requireAuth, requireRole('vendedor', 'administrador'), subirImagen, upload);
router.get('/imagen/:id', descargar);

export default router;
