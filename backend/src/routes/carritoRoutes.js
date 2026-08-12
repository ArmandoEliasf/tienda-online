import { Router } from 'express';
import { get, add, update, remove, clear } from '../controllers/carritoController.js';
import { requireAuth } from '../middleware/auth.js';
import { validar, reglas } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', get);

router.post(
  '/productos',
  validar({
    idProducto: [reglas.requerido('idProducto')],
    cantidad: [reglas.requerido('cantidad'), reglas.mayorA('cantidad', 0)],
  }),
  add,
);

router.patch(
  '/lineas/:idLinea',
  validar({ cantidad: [reglas.requerido('cantidad'), reglas.mayorA('cantidad', 0)] }),
  update,
);

router.delete('/lineas/:idLinea', remove);
router.delete('/', clear);

export default router;
