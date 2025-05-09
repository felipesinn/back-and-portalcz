import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Cria um hash para a senha
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compara uma senha com um hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}