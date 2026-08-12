import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const usuario = await authService.register(req.body);
    res.status(201).json({ usuario });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const resultado = await authService.login(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const usuario = await authService.getSession(req.user.id);
    res.json({ usuario });
  } catch (err) {
    next(err);
  }
}
