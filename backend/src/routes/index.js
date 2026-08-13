import { Router } from 'express';
import { query } from '../config/db.js';
import authRoutes from './authRoutes.js';
import productoRoutes from './productoRoutes.js';
import categoriaRoutes from './categoriaRoutes.js';
import carritoRoutes from './carritoRoutes.js';
import direccionRoutes from './direccionRoutes.js';
import pedidoRoutes from './pedidoRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import archivoRoutes from './archivoRoutes.js';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT NOW() AS now');
    res.json({ status: 'ok', database: 'connected', time: rows[0].now });
  } catch (err) {
    next(err);
  }
});

router.use('/auth', authRoutes);
router.use('/productos', productoRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/carrito', carritoRoutes);
router.use('/direcciones', direccionRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/archivos', archivoRoutes);

export default router;
