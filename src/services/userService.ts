import prisma from '../lib/prisma';
import { CreateUserInput, UpdateUserInput } from '../ utils/validationSchemas';
import { hashPassword } from '../ utils/password';

/**
 * Determina a role do usuário baseado em suas permissões
 */
export function determineUserRole(isMaster: boolean, permissions: string[]): string {
  // Modificado para incluir super_admin
  if (isMaster && permissions.includes('all')) return 'super_admin';
  if (isMaster) return 'admin';
  if (permissions.includes('manager')) return 'manager';
  return 'user'; // role padrão
}

/**
 * Determina o setor do usuário baseado em suas permissões
 */
export function determineUserSector(permissions: string[]): string | undefined {
  // Verifica permissões específicas de setor
  if (permissions.includes('suporte')) return 'suporte';
  if (permissions.includes('tecnico')) return 'tecnico';
  if (permissions.includes('noc')) return 'noc';
  if (permissions.includes('comercial')) return 'comercial';
  if (permissions.includes('adm')) return 'adm';
  
  // Se não tiver permissão específica de setor, retorna undefined
  return undefined;
}

/**
 * Cria um novo usuário
 */
export const createUser = async (data: CreateUserInput) => {
  // Verificar se o e-mail já está em uso
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    const error = new Error('E-mail já está em uso') as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }

  // Criptografar a senha
  const hashedPassword = await hashPassword(data.password);

  // Criar o usuário
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isMaster: data.isMaster ?? false,
      permissions: data.permissions ?? [],
    },
  });

  // Retornar o usuário formatado para o frontend
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: determineUserRole(user.isMaster, user.permissions),
    sector: determineUserSector(user.permissions),  // Adicionado campo sector
    permissions: user.permissions,
    createdAt: user.createdAt,
  };
};

/**
 * Busca todos os usuários
 */
export const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  
  // Formatar usuários para o frontend
  return users.map((user: { id: any; name: any; email: any; isMaster: boolean; permissions: string[]; createdAt: any; }) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: determineUserRole(user.isMaster, user.permissions),
    sector: determineUserSector(user.permissions),  // Adicionado campo sector
    permissions: user.permissions,
    createdAt: user.createdAt,
  }));
};

/**
 * Busca um usuário pelo ID
 */
export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    const error = new Error('Usuário não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Formatar usuário para o frontend
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: determineUserRole(user.isMaster, user.permissions),
    sector: determineUserSector(user.permissions),  // Adicionado campo sector
    permissions: user.permissions,
    createdAt: user.createdAt,
  };
};

/**
 * Atualiza um usuário
 */
export const updateUser = async (id: number, data: UpdateUserInput) => {
  // Verificar se o usuário existe
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    const error = new Error('Usuário não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Se estiver atualizando o e-mail, verificar se já está em uso
  if (data.email && data.email !== existingUser.email) {
    const emailInUse = await prisma.user.findUnique({ where: { email: data.email } });
    if (emailInUse) {
      const error = new Error('E-mail já está em uso') as Error & { statusCode: number };
      error.statusCode = 400;
      throw error;
    }
  }

  // Se estiver atualizando a senha, criptografar
  let hashedPassword: string | undefined;
  if (data.password) {
    hashedPassword = await hashPassword(data.password);
  }

  // Atualizar o usuário
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isMaster: data.isMaster,
      permissions: data.permissions,
    },
  });

  // Formatar usuário para o frontend
  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: determineUserRole(updatedUser.isMaster, updatedUser.permissions),
    sector: determineUserSector(updatedUser.permissions),  // Adicionado campo sector
    permissions: updatedUser.permissions,
    createdAt: updatedUser.createdAt,
  };
};

/**
 * Exclui um usuário
 */
export const deleteUser = async (id: number) => {
  // Verificar se o usuário existe
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    const error = new Error('Usuário não encontrado') as Error & { statusCode: number };
    error.statusCode = 404;
    throw error;
  }

  // Excluir o usuário
  await prisma.user.delete({ where: { id } });
  return { message: 'Usuário excluído com sucesso' };
};