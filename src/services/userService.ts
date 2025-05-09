import prisma from '../lib/prisma';
import { createUserSchema } from '../ utils/validationSchemas';
import { hashPassword } from '../ utils/password';

/**
 * Cria um novo usuário no banco de dados
 */
export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  isMaster?: boolean;
  permissions?: string[];
}) => {
  // Valida os dados com o schema Zod
  const validatedData = createUserSchema.parse(data);
  
  // Hash da senha antes de salvar no banco
  const hashedPassword = await hashPassword(validatedData.password);
  
  // Cria o usuário no banco com a senha hasheada
  return await prisma.user.create({
    data: {
      ...validatedData,
      password: hashedPassword
    }
  });
};

/**
 * Retorna todos os usuários do banco de dados
 */
export const getAllUsers = async () => {
  return await prisma.user.findMany();
};