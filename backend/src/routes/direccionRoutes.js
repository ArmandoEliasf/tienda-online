import { Router } from 'express';
import { list, create, remove } from '../controllers/direccionController.js';
import { requireAuth } from '../middleware/auth.js';
import { validar, reglas } from '../middleware/validate.js';

const router = Router();

router.use(requireAuth);

router.get('/', list);

router.post(
  '/',
  validar({
    nombre: [reglas.requerido('nombre')],
    calle: [reglas.requerido('calle')],
    colonia: [reglas.requerido('colonia')],
    codigo_postal: [reglas.requerido('codigo_postal'), reglas.codigoPostal()],
    municipio: [reglas.requerido('municipio')],
    estado: [reglas.requerido('estado')],
  }),
  create,
);

router.delete('/:id', remove);

export default router;
