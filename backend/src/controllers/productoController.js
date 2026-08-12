import * as productoService from '../services/productoService.js';
import * as categoriaService from '../services/categoriaService.js';

export async function list(req, res, next) {
  try {
    const productos = await productoService.list(req.query);
    res.json({ productos });
  } catch (err) {
    next(err);
  }
}

export async function listDestacados(req, res, next) {
  try {
    const productos = await productoService.listDestacados(Number(req.query.limit) || 8);
    res.json({ productos });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const producto = await productoService.getById(req.params.id);
    res.json({ producto });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const producto = await productoService.create(req.user.id, req.body, req.body.imagen);
    res.status(201).json({ producto });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const producto = await productoService.update(req.params.id, req.body);
    res.json({ producto });
  } catch (err) {
    next(err);
  }
}

export async function setEstado(req, res, next) {
  try {
    const producto = await productoService.setEstado(req.params.id, req.body.estado);
    res.json({ producto });
  } catch (err) {
    next(err);
  }
}

export async function listCategoriasAdmin(req, res, next) {
  try {
    const categorias = await categoriaService.listAdmin();
    res.json({ categorias });
  } catch (err) {
    next(err);
  }
}
