import { Request, Response } from 'express';
import { loginUser } from '../services/authServices';
import { CreateUserInput } from '../ utils/validationSchemas';
import { createUser } from '../services/userService';

/**
 * Controlador para login de usuário
 */
export const loginHandler = async (req: Request, res: Response) => {
  const authResult = await loginUser(req.body);
  res.status(200).json(authResult);
};

/**
 * Controlador para registrar novo usuário
 */
export const registerHandler = async (req: Request, res: Response) => {
  const userData = req.body as CreateUserInput;
  const user = await createUser(userData);
  res.status(201).json(user);
};