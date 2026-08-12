import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as repo from '../repositories/usuarioRepository.js';
import { ApiError } from '../middleware/errorHandler.js';

export function publicUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    telefono: user.telefono || null,
    rol: user.rol,
    estado: user.estado,
    fecha_registro: user.fecha_registro,
  };
}

export async function register({ nombre, email, telefono, password }) {
  const existe = await repo.findByEmail(email);
  if (existe) throw new ApiError(409, 'El correo ya está registrado');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await repo.create({ nombre, email, telefono, passwordHash, rol: 'comprador' });
  return publicUser(user);
}

export async function login({ email, password }) {
  const user = await repo.findByEmail(email);
  if (!user) throw new ApiError(401, 'Correo o contraseña incorrectos');
  const coincide = await bcrypt.compare(password, user.password_hash);
  if (!coincide) throw new ApiError(401, 'Correo o contraseña incorrectos');
  if (user.estado === 'inactivo') throw new ApiError(403, 'Tu cuenta está inactiva');
  const token = jwt.sign({ id: user.id, rol: user.rol, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });
  return { token, usuario: publicUser(user) };
}

export async function getSession(idUsuario) {
  const user = await repo.findById(idUsuario);
  if (!user) throw new ApiError(404, 'Usuario no encontrado');
  if (user.estado === 'inactivo') throw new ApiError(403, 'Tu cuenta está inactiva');
  return publicUser(user);
}
