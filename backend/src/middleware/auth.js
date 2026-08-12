import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Se requiere token de acceso'));
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new ApiError(401, 'Token inválido o expirado'));
  }
}

export async function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Se requiere token de acceso'));
    }
    if (!roles.includes(req.user.rol)) {
      return next(new ApiError(403, 'No tienes permisos para esta operación'));
    }
    return next();
  };
}
