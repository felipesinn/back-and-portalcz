import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

interface AppError extends Error {
  statusCode?: number;
}

/**
 * Middleware de tratamento de erros global
 */
export const errorHandler: ErrorRequestHandler = (
  err: AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Erro:', err);
  
  // Determina o status do erro (usa 500 como padrão)
  const statusCode = err.statusCode || 500;
  
  // Estrutura da resposta de erro
  const errorResponse = {
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  };
  
  res.status(statusCode).json(errorResponse);
};