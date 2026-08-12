import * as direccionService from '../services/direccionService.js';

export async function list(req, res, next) {
  try {
    const direcciones = await direccionService.list(req.user.id);
    res.json({ direcciones });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const direccion = await direccionService.create(req.user.id, req.body);
    res.status(201).json({ direccion });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const resultado = await direccionService.remove(req.user.id, req.params.id);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
