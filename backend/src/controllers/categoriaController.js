import * as categoriaService from '../services/categoriaService.js';

export async function list(req, res, next) {
  try {
    const categorias = await categoriaService.list();
    res.json({ categorias });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const categoria = await categoriaService.create(req.body);
    res.status(201).json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const categoria = await categoriaService.update(req.params.id, req.body);
    res.json({ categoria });
  } catch (err) {
    next(err);
  }
}

export async function setEstado(req, res, next) {
  try {
    const categoria = await categoriaService.setEstado(req.params.id, req.body.estado);
    res.json({ categoria });
  } catch (err) {
    next(err);
  }
}
