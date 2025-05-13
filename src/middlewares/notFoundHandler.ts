import { Request, Response } from 'express';

/**
 * Middleware para tratar rotas não encontradas
 */
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Recurso não encontrado' });
};