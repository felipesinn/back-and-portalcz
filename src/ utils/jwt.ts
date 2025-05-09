import jwt from 'jsonwebtoken';

// Verificar o JWT_SECRET no ambiente
if (!process.env.JWT_SECRET) {
  console.error('ERRO: Variável de ambiente JWT_SECRET não definida!');
  process.exit(1);
}

const secret = process.env.JWT_SECRET;

/**
 * Interface para o payload do token JWT
 */
interface TokenPayload {
  id: number;
  email: string;
  isMaster: boolean;
  permissions: string[];
}

/**
 * Gera um token JWT com os dados do usuário
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, secret) as TokenPayload;
}