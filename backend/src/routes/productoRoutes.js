import { Router } from 'express';
import { list, listDestacados, getById, create, update, setEstado, listCategoriasAdmin } from '../controllers/productoController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validar, reglas } from '../middleware/validate.js';

const router = Router();

router.get('/destacados', listDestacados);
router.get('/', list);
router.get('/:id', getById);

const crearOActualizar = validar({
  nombre: [reglas.requerido('nombre')],
  precio: [reglas.requerido('precio'), reglas.mayorA('precio', 0)],
  existencia: [reglas.requerido('existencia'), reglas.minimo('existencia', 0)],
  idCategoria: [reglas.requerido('idCategoria')],
});

router.post('/', requireAuth, requireRole('vendedor', 'administrador'), crearOActualizar, create);
router.put('/:id', requireAuth, requireRole('vendedor', 'administrador'), crearOActualizar, update);
router.patch(
  '/:id/estado',
  requireAuth,
  requireRole('vendedor', 'administrador'),
  validar({ estado: [reglas.requerido('estado'), reglas.en('estado', ['activo', 'inactivo'])] }),
  setEstado,
);
router.get('/admin/categorias', requireAuth, requireRole('administrador'), listCategoriasAdmin);

export default router;
