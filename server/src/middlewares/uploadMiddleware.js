const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta de almacenamiento para archivos de estudios médicos
const uploadsDir = path.join(__dirname, '../../uploads/studies');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Si la carpeta no existe, asegurar creación
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const studyId = req.params.id || 'new';
    const timestamp = Date.now();
    // Limpiar nombre original de caracteres conflictivos
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(sanitizedOriginal).toLowerCase();
    const baseName = path.basename(sanitizedOriginal, ext).substring(0, 30);
    cb(null, `study_${studyId}_${timestamp}_${baseName}${ext}`);
  }
});

// Filtro estricto de tipos de archivo médicos (PDF, Imágenes comunes)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.dcm'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido (${ext}). Solo se admiten PDF e imágenes (JPG, PNG, WEBP).`), false);
  }
};

// Límite de 25 MB por archivo
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB
  }
});

module.exports = upload;
