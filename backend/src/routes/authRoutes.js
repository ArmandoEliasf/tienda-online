import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validar, reglas } from '../middleware/validate.js';

const router = Router();

router.post(
  '/registro',
  validar({
    nombre: [reglas.requerido('nombre')],
    email: [reglas.requerido('email'), reglas.email()],
    telefono: [reglas.telefonoMx()],
    password: [reglas.requerido('password'), reglas.minLongitud('password', 6)],
  }),
  register,
);

router.post(
  '/login',
  validar({
    email: [reglas.requerido('email'), reglas.email()],
    password: [reglas.requerido('password')],
  }),
  login,
);

router.get('/me', requireAuth, me);

export default router;
