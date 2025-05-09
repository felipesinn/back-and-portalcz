import { Request, Response } from 'express';

/**
 * Middleware para lidar com rotas não encontradas
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
};