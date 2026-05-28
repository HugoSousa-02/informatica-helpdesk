const multer = require('multer');
const path = require('path');

// Configuração do armazenamento de ficheiros (anexos dos tickets)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Pasta onde os ficheiros são guardados
  },
  filename: (req, file, cb) => {
    // Gera um nome único: timestamp + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de tipos de ficheiro permitidos
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Tipo de ficheiro não permitido. Use: imagens, PDF, Word, Excel ou TXT'));
};

// Exporta o middleware configurado (limite: 10 MB)
module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter
});