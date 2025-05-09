import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../ utils/jwt';

// Estender a interface Request para incluir o 'user'
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        isMaster: boolean;
        permissions: string[];
      };
    }
  }
}

/**
 * Middleware de autenticação
 * Verifica se o token é válido e adiciona os dados do usuário na requisição
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token ausente ou malformado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * Middleware de autorização
 * Verifica se o usuário possui a permissão necessária para acessar o recurso
 */
export function authorize(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    if (user.isMaster || (user.permissions && user.permissions.includes(requiredPermission))) {
      next(); // autorizado
    } else {
      res.status(403).json({ error: 'Permissão negada' });
    }
  };
}