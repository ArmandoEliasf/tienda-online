import { Router } from 'express';
import { list } from '../controllers/usuarioController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('administrador'), list);

export default router;
