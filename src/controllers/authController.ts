import { Request, Response } from 'express';
import { loginUser } from '../services/authServices';
import { CreateUserInput } from '../ utils/validationSchemas';
import { createUser } from '../services/userService';

/**
 * Controlador para login de usuário
 */
export const loginHandler = async (req: Request, res: Response) => {
  try {
    const authResult = await loginUser(req.body);
    res.status(200).json(authResult);
  } catch (error) {
    console.error("Erro no login:", error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro no login',
      success: false
    });
  }
};

/**
 * Controlador para registrar novo usuário
 */
export const registerHandler = async (req: Request, res: Response) => {
  try {
    const userData = req.body as CreateUserInput;
    const user = await createUser(userData);
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro no registro',
      success: false
    });
  }
};