import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global para tratamento de erros
 */
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('Erro:', err.message);
  
  // Verificar se o erro tem statusCode (para erros personalizados)
  const statusCode = (err as any).statusCode || 500;
  
  // Responder com o código de status e mensagem de erro
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * Wrapper para tratar funções assíncronas em controllers do Express
 * CORRIGIDA a tipagem para aceitar qualquer tipo de retorno (any)
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};