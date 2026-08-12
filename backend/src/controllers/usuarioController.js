import * as usuarioService from '../services/usuarioService.js';

export async function list(req, res, next) {
  try {
    const usuarios = await usuarioService.list();
    res.json({ usuarios });
  } catch (err) {
    next(err);
  }
}
