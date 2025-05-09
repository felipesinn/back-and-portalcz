import { Router } from 'express';
import { createUserHandler, getAllUsersHandler } from '../controllers/userController';
import { loginHandler } from '../controllers/authController';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../ utils/asyncHandler';

const router = Router();

// Rotas públicas
router.post('/auth/login', asyncHandler(loginHandler));
router.post('/users', asyncHandler(createUserHandler));

// Rotas protegidas
router.get('/users', authenticate, authorize('view_users'), asyncHandler(getAllUsersHandler));

export default router;