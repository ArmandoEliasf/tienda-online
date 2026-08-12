import { Router } from 'express';
import { create, listMios, getMio, listAdmin, getAdmin, updateEstado } from '../controllers/pedidoController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validar, reglas } from '../middleware/validate.js';

const router = Router();

const ESTADOS_PEDIDO = ['pendiente', 'confirmado', 'preparando', 'enviado', 'entregado', 'cancelado'];

router.use(requireAuth);

router.post(
  '/',
  validar({ idDireccion: [reglas.requerido('idDireccion')] }),
  create,
);
router.get('/mios', listMios);

router.get('/admin', requireRole('administrador'), listAdmin);
router.get('/admin/:id', requireRole('administrador'), getAdmin);
router.patch(
  '/admin/:id/estado',
  requireRole('administrador'),
  validar({ estado: [reglas.requerido('estado'), reglas.en('estado', ESTADOS_PEDIDO)] }),
  updateEstado,
);

router.get('/:id', getMio);

export default router;
