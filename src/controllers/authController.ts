import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { signToken } from '../ utils/jwt';
import { comparePassword } from '../ utils/password';

/**
 * Controller de login
 * Autentica o usuário e retorna um token JWT
 */
export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    res.status(401).json({ error: 'Credenciais inválidas' });
    return;
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    isMaster: user.isMaster,
    permissions: user.permissions
  });

  res.status(200).json({ 
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isMaster: user.isMaster,
      permissions: user.permissions
    }
  });
};