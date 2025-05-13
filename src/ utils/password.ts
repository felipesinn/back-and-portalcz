import bcrypt from 'bcrypt';

// Número de rounds para o bcrypt
const SALT_ROUNDS = 10;

/**
 * Criptografa uma senha
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compara a senha fornecida com a senha hash armazenada
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};