import * as pedidoService from '../services/pedidoService.js';

export async function create(req, res, next) {
  try {
    const pedido = await pedidoService.create(req.user.id, req.body);
    res.status(201).json({ pedido });
  } catch (err) {
    next(err);
  }
}

export async function listMios(req, res, next) {
  try {
    const pedidos = await pedidoService.listMios(req.user.id);
    res.json({ pedidos });
  } catch (err) {
    next(err);
  }
}

export async function getMio(req, res, next) {
  try {
    const pedido = await pedidoService.getMio(req.user.id, req.params.id);
    res.json({ pedido });
  } catch (err) {
    next(err);
  }
}

export async function listAdmin(req, res, next) {
  try {
    const pedidos = await pedidoService.listAdmin(req.query);
    res.json({ pedidos });
  } catch (err) {
    next(err);
  }
}

export async function getAdmin(req, res, next) {
  try {
    const pedido = await pedidoService.getAdmin(req.params.id);
    res.json({ pedido });
  } catch (err) {
    next(err);
  }
}

export async function updateEstado(req, res, next) {
  try {
    const pedido = await pedidoService.updateEstado(
      req.params.id,
      req.body.estado,
      req.user.id,
      req.body.observacion,
    );
    res.json({ pedido });
  } catch (err) {
    next(err);
  }
}
