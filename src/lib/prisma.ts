import { PrismaClient } from '@prisma/client';

// Instância do Prisma Client para ser usada em toda a aplicação
const prisma = new PrismaClient();

export default prisma;