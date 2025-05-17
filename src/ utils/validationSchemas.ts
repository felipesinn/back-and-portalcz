// src/utils/validationSchemas.ts
import { z } from 'zod';

// Schema para validar os dados de criação de usuário
export const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  isMaster: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

// Schema para validar os dados de login
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para validar os dados de atualização de usuário
export const updateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  email: z.string().email('E-mail inválido').optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional(),
  isMaster: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

// Tipos derivados dos schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;