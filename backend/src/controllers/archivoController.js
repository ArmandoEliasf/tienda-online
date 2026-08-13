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
