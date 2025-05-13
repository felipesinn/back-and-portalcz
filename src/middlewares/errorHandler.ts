import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para tratar erros de forma assíncrona
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware global para tratamento de erros
 */
export const errorHandler = (
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Erro:', err);
  
  // Definir código de status padrão como 500 se não for especificado
  const statusCode = err.statusCode || 500;
  
  // Enviar resposta de erro
  res.status(statusCode).json({
    message: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};