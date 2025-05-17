import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { hasPermission } from '../services/permissions.service';
import { UserRole } from '../types/content.types';

// Extendendo a interface Request para incluir userId e userRole
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
      userPermissions?: string[];
      userSector?: string;
    }
  }
}

/**
 * Middleware de autenticação
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token de autenticação inválido' });
    }
    
    // Verificar o token
    const secretKey = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      const decoded = jwt.verify(token, secretKey) as {
        id: number;
        email: string;
        isMaster: boolean;
        permissions: string[];
      };
      
      // Determinar o papel do usuário
      let userRole: UserRole = 'user';
      if (decoded.isMaster && decoded.permissions.includes('all')) {
        userRole = 'super_admin';
      } else if (decoded.isMaster) {
        userRole = 'admin';
      } else if (decoded.permissions.includes('manager')) {
        userRole = 'manager';
      }
      
      // Determinar o setor do usuário
      let userSector: string | undefined;
      if (decoded.permissions.includes('suporte')) userSector = 'suporte';
      else if (decoded.permissions.includes('tecnico')) userSector = 'tecnico';
      else if (decoded.permissions.includes('noc')) userSector = 'noc';
      else if (decoded.permissions.includes('comercial')) userSector = 'comercial';
      else if (decoded.permissions.includes('adm')) userSector = 'adm';
      
      // Adicionar informações do usuário ao objeto request
      req.userId = decoded.id;
      req.userRole = userRole;
      req.userPermissions = decoded.permissions;
      req.userSector = userSector;
      
      // Prosseguir
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const authorize = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId || !req.userRole) {
        return res.status(401).json({ message: 'Usuário não autenticado' });
      }
      
      const userPermissions = req.userPermissions || [];
      
      if (!hasPermission(req.userRole as UserRole, userPermissions, requiredPermission)) {
        return res.status(403).json({ 
          message: 'Acesso negado. Você não tem permissão para realizar esta ação',
          required: requiredPermission
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Função para verificar se um usuário é admin
 */
export const isAdmin = (userId: number): boolean => {
  // Esta é uma implementação de exemplo
  // Em uma aplicação real, você verificaria isso no banco de dados
  const adminIds = [1, 12, 13]; // IDs de admin conhecidos
  return adminIds.includes(userId);
};