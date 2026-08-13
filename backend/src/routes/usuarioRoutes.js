import { Router } from 'express';
import { list, setEstado } from '../controllers/usuarioController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('administrador'), list);
router.patch('/:id/estado', requireAuth, requireRole('administrador'), setEstado);

export default router;
