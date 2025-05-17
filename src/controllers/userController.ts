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
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao criar usuário',
      success: false
    });
  }
};

/**
 * Controlador para obter todos os usuários
 */
export const getAllUsersHandler = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ 
      message: "Erro ao buscar usuários",
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    });
  }
};

/**
 * Controlador para obter usuário por ID
 */
export const getUserByIdHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error(`Erro ao buscar usuário ID ${req.params.id}:`, error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao buscar usuário',
      success: false
    });
  }
};

/**
 * Controlador para obter o usuário atual
 */
export const getCurrentUserHandler = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - O middleware de autenticação adiciona o userId ao req
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado" });
    }
    const user = await getUserById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao buscar usuário atual',
      success: false
    });
  }
};

/**
 * Controlador para atualizar usuário
 */
export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const updatedUser = await updateUser(userId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(`Erro ao atualizar usuário ID ${req.params.id}:`, error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
      success: false
    });
  }
};

/**
 * Controlador para excluir usuário
 */
export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const result = await deleteUser(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error(`Erro ao excluir usuário ID ${req.params.id}:`, error);
    res.status((error as any).statusCode || 500).json({ 
      message: error instanceof Error ? error.message : 'Erro ao excluir usuário',
      success: false
    });
  }
};