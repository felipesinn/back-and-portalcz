import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../ utils/jwt';

/**
 * Middleware de autenticação
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obter o token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação ausente ou inválido' });
    }

    // Extrair o token
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    const decoded = verifyToken(token);
    
    // Adicionar dados do usuário ao request para uso posterior
    // @ts-ignore - Estendendo o objeto Request
    req.userId = decoded.id;
    // @ts-ignore - Estendendo o objeto Request
    req.userPermissions = decoded.permissions;
    // @ts-ignore - Estendendo o objeto Request
    req.isMaster = decoded.isMaster;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token de autenticação inválido ou expirado' });
  }
};

/**
 * Middleware de autorização baseado em permissões
 */
export const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - O middleware de autenticação adiciona o isMaster e userPermissions ao req
      const { isMaster, userPermissions } = req;
      
      // Administradores têm acesso a tudo
      if (isMaster) {
        return next();
      }
      
      // Verificar se o usuário tem a permissão necessária
      if (!userPermissions || !userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }
      
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }
  };
};