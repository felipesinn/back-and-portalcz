import prisma from '../lib/prisma';
import { LoginInput } from '../ utils/validationSchemas';
import { comparePassword } from '../ utils/password';
import { signToken } from '../ utils/jwt';
import { determineUserRole, determineUserSector } from './userService';

interface AuthResult {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    sector?: string; // Adicionado o campo sector
    permissions: string[];
  };
}

/**
 * Autentica um usuário
 */
export const loginUser = async (data: LoginInput): Promise<AuthResult> => {
  // Buscar o usuário pelo e-mail
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  
  if (!user) {
    const error = new Error('Credenciais inválidas') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  // Verificar a senha
  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Credenciais inválidas') as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }

  // Determinar a role do usuário
  const role = determineUserRole(user.isMaster, user.permissions);
  
  // Determinar o setor do usuário
  const sector = determineUserSector(user.permissions);

  // Gerar token JWT
  const token = signToken({
    id: user.id,
    email: user.email,
    isMaster: user.isMaster,
    permissions: user.permissions
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role,
      sector: sector, // Incluído o setor na resposta
      permissions: user.permissions,
    }
  };
};