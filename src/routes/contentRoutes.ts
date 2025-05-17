import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAllContentHandler,
  getContentByIdHandler,
  updateContentHandler,
  createContentHandler,
  deleteContentHandler,
  getContentByTypeHandler,
  getContentBySectorHandler,
  incrementViewsHandler,
  addContentAdditionHandler
} from '../controllers/contentController';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

// Definir caminho para uploads - CORRIGIDO para consistência com index.ts
const uploadDir = path.join(__dirname, '../../uploads');
console.log('Salvando uploads em:', uploadDir);

// Garantir que o diretório existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Diretório de uploads criado:', uploadDir);
}

// Configuração do multer para salvar em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Garantir que o nome do arquivo não tenha caracteres problemáticos
    const sanitizedName = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, uniqueSuffix + '_' + sanitizedName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 80 * 1024 * 1024, // Aumentado para 20MB
    fieldSize: 80 * 1024 * 1024 // Adicionado limite de tamanho de campo
  }
});

const router = Router();

// Rotas
router.post('/', authenticate, upload.single('file'), asyncHandler(createContentHandler));
router.get('/', asyncHandler(getAllContentHandler));
router.get('/type/:type', asyncHandler(getContentByTypeHandler));
router.get('/sector/:sector', asyncHandler(getContentBySectorHandler));
router.get('/:id', asyncHandler(getContentByIdHandler));
router.put('/:id', authenticate, upload.single('file'), asyncHandler(updateContentHandler));
router.delete('/:id', authenticate, authorize('delete_content'), asyncHandler(deleteContentHandler));
router.post('/:id/view', asyncHandler(incrementViewsHandler));
router.post('/:id/additions', authenticate, upload.single('file'), asyncHandler(addContentAdditionHandler));

export default router;