// src/routes/contentRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import {
  createContentHandler,
  getAllContentHandler,
  getContentByIdHandler,
  updateContentHandler,
  deleteContentHandler,
  getContentByTypeHandler,
  getContentBySectorHandler
} from '../controllers/contentController';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB max
  } 
});

const router = Router();

// Rotas de conteúdo
router.post('/', authenticate, upload.single('file'), asyncHandler(createContentHandler));
router.get('/', asyncHandler(getAllContentHandler));
router.get('/type/:type', asyncHandler(getContentByTypeHandler));
router.get('/sector/:sector', asyncHandler(getContentBySectorHandler));
router.get('/:id', asyncHandler(getContentByIdHandler));
router.put('/:id', authenticate, upload.single('file'), asyncHandler(updateContentHandler));
router.delete('/:id', authenticate, authorize('delete_content'), asyncHandler(deleteContentHandler));

export default router;