import { Router } from 'express';
import {
  createUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  getCurrentUserHandler
} from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/errorHandler';

const router = Router();

// Rotas protegidas
router.get('/', authenticate, asyncHandler(getAllUsersHandler));
router.get('/me', authenticate, asyncHandler(getCurrentUserHandler));
router.get('/:id', authenticate, asyncHandler(getUserByIdHandler));
router.put('/:id', authenticate, asyncHandler(updateUserHandler));
router.delete('/:id', authenticate, authorize('delete_user'), asyncHandler(deleteUserHandler));
router.post('/', asyncHandler(createUserHandler));

export default router;