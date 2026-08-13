import multer from 'multer';
import { ApiError } from './errorHandler.js';

const MIMES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANO_MAXIMO = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO },
  fileFilter: (req, file, cb) => {
    if (!MIMES_PERMITIDOS.includes(file.mimetype)) {
      cb(new ApiError(400, 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF)'));
      return;
    }
    cb(null, true);
  },
});

export function subirImagen(req, res, next) {
  upload.single('archivo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera el tamaño máximo de 5 MB' : err.message;
      return next(new ApiError(400, message));
    }
    if (err) return next(err);
    if (!req.file) return next(new ApiError(400, 'Se requiere el campo "archivo"'));
    next();
  });
}
