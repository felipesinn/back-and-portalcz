import { Router } from 'express';
import userRoutes from './userRoutes';
import { loginHandler, registerHandler } from '../controllers/authController';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// Rotas de autenticação
router.post('/login', asyncHandler(loginHandler));
router.post('/register', asyncHandler(registerHandler));

// Outras rotas
router.use('/users', userRoutes);

export default router;