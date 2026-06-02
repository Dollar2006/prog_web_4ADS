import prisma from '../lib/prisma.js';
import bcryptjs from 'bcryptjs';

const DEFAULT_USERS = [
  {
    email: 'admin123@email.com',
    senha: 'admin123',
    role: 'admin'
  },
  {
    email: 'user123@email.com',
    senha: 'user123',
    role: 'user'
  }
];

export async function seedDefaultUsers() {
  try {
    for (const user of DEFAULT_USERS) {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email: user.email }
      });

      if (!usuarioExistente) {
        // Hash da senha
        const salt = await bcryptjs.genSalt(10);
        const senhaHash = await bcryptjs.hash(user.senha, salt);

        // Cria o usuário
        await prisma.usuario.create({
          data: {
            email: user.email,
            senha: senhaHash,
            role: user.role
          }
        });

        console.log(`✓ Usuário padrão criado: ${user.email}`);
      } else {
        console.log(`✓ Usuário padrão já existe: ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Erro ao fazer seed dos usuários padrão:', error);
    throw error;
  }
}
