import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { hasPermission } from '../services/permissions.service';
import { UserRole } from '../types/content.types';

/**
 * Middleware para validação de dados com Zod
 */
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validar o corpo da requisição
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatar erros de validação do Zod
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({ 
          message: 'Erro de validação',
          errors 
        });
      }
      
      // Para outros tipos de erro
      next(error);
    }
  };
};

/**
 * Middleware para validar permissões específicas além da autenticação básica
 * Deve ser usado após o middleware de autenticação
 */
export const validatePermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.userRole;
      const userPermissions = req.userPermissions || [];

      if (!userRole) {
        return res.status(401).json({ message: 'Usuário não autenticado adequadamente' });
      }

      // Verificar se o usuário tem a permissão necessária
      if (!hasPermission(userRole as UserRole, userPermissions, requiredPermission)) {
        return res.status(403).json({ message: 'Acesso não autorizado' });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para validar acesso baseado em setor
 * Verifica se o usuário tem permissão para acessar o setor especificado
 */
export const validateSectorAccess = (paramName: string = 'sector') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.userRole;
      const userPermissions = req.userPermissions || [];
      const userSector = req.userSector;

      if (!userRole) {
        return res.status(401).json({ message: 'Usuário não autenticado adequadamente' });
      }

      // Super Admin tem acesso a todos os setores
      if (userRole === 'super_admin' || userPermissions.includes('all')) {
        return next();
      }

      // Obter o setor da requisição (parâmetro, query ou body)
      const requestedSector = req.params[paramName] || 
                             req.query[paramName] || 
                             req.body[paramName];

      // Se não há setor especificado, permitir acesso
      if (!requestedSector) {
        return next();
      }

      // Verificar se o usuário tem permissão para o setor solicitado
      // Admins só podem acessar seu próprio setor, usuários comuns também
      if (requestedSector === userSector || userPermissions.includes(requestedSector as string)) {
        return next();
      }

      return res.status(403).json({ message: 'Acesso não autorizado a este setor' });
    } catch (error) {
      next(error);
    }
  };
};