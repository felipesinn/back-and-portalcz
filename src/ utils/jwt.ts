import jwt from 'jsonwebtoken';

// Tipos para o payload do token
interface TokenPayload {
  id: number;
  email: string;
  isMaster: boolean;
  permissions: string[];
}

// Secret key para assinar os tokens (deve estar no .env em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

// Tempo de expiração do token (em segundos ou uma string como '1d', '2h', etc.)
const TOKEN_EXPIRY = '24h';

/**
 * Assina um token JWT
 */
export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verifica e decodifica um token JWT
 */
export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};