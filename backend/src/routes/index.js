import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT NOW() AS now');
    res.json({ status: 'ok', database: 'connected', time: rows[0].now });
  } catch (err) {
    next(err);
  }
});

router.use('/auth', (req, res) => res.json({ message: 'Módulo de autenticación (Fase 5)' }));
router.use('/productos', (req, res) => res.json({ message: 'Módulo de productos (Fase 5)' }));
router.use('/categorias', (req, res) => res.json({ message: 'Módulo de categorías (Fase 5)' }));
router.use('/carrito', (req, res) => res.json({ message: 'Módulo de carrito (Fase 5)' }));
router.use('/pedidos', (req, res) => res.json({ message: 'Módulo de pedidos (Fase 5)' }));

export default router;
