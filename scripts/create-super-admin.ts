/**
 * Script para criar um super_admin no banco de dados
 * 
 * Para executar: 
 * npx ts-node scripts/create-super-admin.ts
 */

import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/ utils/password';

async function createSuperAdmin() {
  try {
    // Verificar se já existe um super_admin
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        isMaster: true,
        permissions: {
          has: 'all'
        }
      }
    });

    if (existingSuperAdmin) {
      console.log('Já existe um super_admin no sistema:');
      console.log(`Email: ${existingSuperAdmin.email}`);
      console.log('Se você deseja criar outro, exclua o existente primeiro ou modifique este script.');
      return;
    }

    // Criptografar a senha
    const hashedPassword = await hashPassword('senha123');

    // Criar o usuário super_admin
    const superAdmin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@cznet.com',
        password: hashedPassword,
        isMaster: true,
        permissions: ['all', 'suporte'], // 'all' para super_admin, 'suporte' como setor padrão
      },
    });

    console.log('Super Admin criado com sucesso:');
    console.log(`ID: ${superAdmin.id}`);
    console.log(`Nome: ${superAdmin.name}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log('Role: super_admin');
    console.log('Setor: suporte');
    console.log('Senha: senha123');
    console.log('\nLembre-se de alterar a senha após o primeiro login!');
  } catch (error) {
    console.error('Erro ao criar super_admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();