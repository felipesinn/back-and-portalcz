import { Request, Response } from 'express';
import { createUser, getAllUsers } from '../services/userService';

/**
 * Controller para criar um novo usuário
 */
export const createUserHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await createUser(req.body);
    
    // Remove a senha da resposta por segurança
    const { password, ...userWithoutPassword } = user;
    
    res.status(201).json({ 
      message: 'Usuário criado com sucesso', 
      user: userWithoutPassword 
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        res.status(400).json({ error: 'Este e-mail já está em uso' });
        return;
      }
    }
    throw error; // Passa para o middleware de erro global
  }
};

/**
 * Controller para listar todos os usuários
 */
export const getAllUsersHandler = async (_req: Request, res: Response): Promise<void> => {
  const users = await getAllUsers();
  
  // Remove senhas de todos os usuários na resposta
  const safeUsers = users.map((user: { [x: string]: any; password: any; }) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.status(200).json(safeUsers);
};