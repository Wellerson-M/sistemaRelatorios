const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cria pasta 'uploads' se não existir
const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const nomeArquivo = `${file.fieldname}-${timestamp}${ext}`;
        cb(null, nomeArquivo);
    }
});

const upload = multer({ storage });

module.exports = upload;
