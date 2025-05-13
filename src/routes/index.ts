// src/routes/index.ts
import { Router } from 'express';
import userRoutes from './userRoutes';
import contentRoutes from './contentRoutes';
import { loginHandler, registerHandler } from '../controllers/authController';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// Rotas de autenticação
router.post('/login', asyncHandler(loginHandler));
router.post('/register', asyncHandler(registerHandler));

// Outras rotas
router.use('/users', userRoutes);
router.use('/content', contentRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;