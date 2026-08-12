import { ApiError } from './errorHandler.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_RE = /^[0-9]{10}$/;
const CP_RE = /^[0-9]{5}$/;

export const reglas = {
  requerido: (campo) => (valor) =>
    valor === undefined || valor === null || String(valor).trim() === ''
      ? `${campo} es obligatorio`
      : null,
  email: () => (valor) =>
    valor !== undefined && !EMAIL_RE.test(String(valor).trim())
      ? 'Formato de correo inválido'
      : null,
  telefonoMx: () => (valor) =>
    valor !== undefined && !TELEFONO_RE.test(String(valor).trim())
      ? 'Teléfono mexicano: 10 dígitos'
      : null,
  codigoPostal: () => (valor) =>
    valor !== undefined && !CP_RE.test(String(valor).trim())
      ? 'Código postal: 5 dígitos'
      : null,
  minimo: (campo, n) => (valor) =>
    valor !== undefined && String(valor).trim() !== '' && Number(valor) < n
      ? `${campo} debe ser mayor o igual a ${n}`
      : null,
  minLongitud: (campo, n) => (valor) =>
    valor !== undefined && String(valor).length < n
      ? `${campo} debe tener al menos ${n} caracteres`
      : null,
  mayorA: (campo, n) => (valor) =>
    valor !== undefined && Number(valor) <= n ? `${campo} debe ser mayor a ${n}` : null,
  en: (campo, valores) => (valor) =>
    valor !== undefined && !valores.includes(valor) ? `${campo} no es válido` : null,
};

export function validar(checks) {
  return (req, res, next) => {
    const errores = {};
    for (const [campo, lista] of Object.entries(checks)) {
      const valor = req.body[campo];
      for (const check of lista) {
        const error = check(valor);
        if (error) {
          errores[campo] = error;
          break;
        }
      }
    }
    if (Object.keys(errores).length > 0) {
      return next(new ApiError(400, 'Datos inválidos', errores));
    }
    return next();
  };
}
