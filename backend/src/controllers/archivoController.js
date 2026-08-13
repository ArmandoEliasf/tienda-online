import * as googleDriveService from '../services/googleDriveService.js';

export async function upload(req, res, next) {
  try {
    const archivo = await googleDriveService.uploadArchivo(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );
    res.status(201).json({ archivo });
  } catch (err) {
    next(err);
  }
}

export async function descargar(req, res, next) {
  try {
    const { buffer, contentType } = await googleDriveService.descargarArchivo(req.params.id);
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}
