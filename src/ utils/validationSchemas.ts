import { z } from 'zod';

/**
 * Schema de validação para criação de usuário
 */
export const createUserSchema = z.object({
  name: z.string().min(1, { message: "O nome é obrigatório." }),
  email: z.string().email({ message: "O e-mail deve ser válido." }),
  password: z.string().min(6, { message: "A senha deve ter no mínimo 6 caracteres." }),
  isMaster: z.boolean().optional().default(false),
  permissions: z.array(z.string()).optional().default([]),
});