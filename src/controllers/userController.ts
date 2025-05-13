import { Request, Response } from 'express';
import { 
  createUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} from '../services/userService';

/**
 * Controlador para criar usuário
 */
export const createUserHandler = async (req: Request, res: Response) => {
  const user = await createUser(req.body);
  res.status(201).json(user);
};

/**
 * Controlador para obter todos os usuários
 */
export const getAllUsersHandler = async (_req: Request, res: Response) => {
  const users = await getAllUsers();
  res.status(200).json(users);
};

/**
 * Controlador para obter usuário por ID
 */
export const getUserByIdHandler = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = await getUserById(userId);
  res.status(200).json(user);
};

/**
 * Controlador para obter o usuário atual
 */
export const getCurrentUserHandler = async (req: Request, res: Response) => {
  // @ts-ignore - O middleware de autenticação adiciona o userId ao req
  const userId = req.userId;
  const user = await getUserById(userId);
  res.status(200).json(user);
};

/**
 * Controlador para atualizar usuário
 */
export const updateUserHandler = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const updatedUser = await updateUser(userId, req.body);
  res.status(200).json(updatedUser);
};

/**
 * Controlador para excluir usuário
 */
export const deleteUserHandler = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const result = await deleteUser(userId);
  res.status(200).json(result);
};