import { Router } from 'express';
import { list, create, update, setEstado } from '../controllers/categoriaController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validar, reglas } from '../middleware/validate.js';

const router = Router();

router.get('/', list);

router.post(
  '/',
  requireAuth,
  requireRole('administrador'),
  validar({ nombre: [reglas.requerido('nombre')] }),
  create,
);

router.put(
  '/:id',
  requireAuth,
  requireRole('administrador'),
  validar({ nombre: [reglas.requerido('nombre')] }),
  update,
);

router.patch(
  '/:id/estado',
  requireAuth,
  requireRole('administrador'),
  validar({ estado: [reglas.requerido('estado'), reglas.en('estado', ['activo', 'inactivo'])] }),
  setEstado,
);

export default router;
