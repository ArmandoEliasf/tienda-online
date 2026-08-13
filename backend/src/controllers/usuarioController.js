import * as usuarioService from '../services/usuarioService.js';

export async function list(req, res, next) {
  try {
    const usuarios = await usuarioService.list();
    res.json({ usuarios });
  } catch (err) {
    next(err);
  }
}

export async function setEstado(req, res, next) {
  try {
    const usuario = await usuarioService.setEstado(req.params.id, req.body.estado, req.user.id);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}
