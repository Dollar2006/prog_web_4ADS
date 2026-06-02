import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';

export const authService = {
  async authenticate(email: string, password: string) {
    // Procura o usuário no banco
    const user = await prisma.usuario.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    // Valida a senha com bcrypt
    const senhaValida = await bcryptjs.compare(password, user.senha);
    if (!senhaValida) {
      throw new Error('Email ou senha inválidos');
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        userEmail: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'seu_secret_key',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  },

  async register(email: string, password: string) {
    // Verifica se o usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      throw new Error('Este email já está registrado');
    }

    // Hash da senha
    const salt = await bcryptjs.genSalt(10);
    const senhaHash = await bcryptjs.hash(password, salt);

    // Cria o novo usuário
    const usuario = await prisma.usuario.create({
      data: {
        email,
        senha: senhaHash,
        role: 'user'
      }
    });

    // Gera o token JWT
    const token = jwt.sign(
      {
        userId: usuario.id,
        userEmail: usuario.email,
        role: usuario.role
      },
      process.env.JWT_SECRET || 'seu_secret_key',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      }
    };
  },

  async requestPasswordReset(email: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      // Por segurança, não revela se o email existe
      throw new Error('Se o email existe, será enviado um link de recuperação');
    }

    // Gera token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcryptjs.hash(resetToken, 10);
    const resetExpires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // Salva o token no banco
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: resetTokenHash,
        resetExpires
      }
    });

    // Retorna o token para o frontend enviar por email (em produção, enviar via email real)
    return {
      resetToken,
      message: 'Se o email existe, será enviado um link de recuperação'
    };
  },

  async resetPassword(resetToken: string, novaSenha: string) {
    // Busca todos os usuários com reset token (em produção usar hash seguro)
    const usuarios = await prisma.usuario.findMany();
    
    let usuarioEncontrado = null;
    for (const usuario of usuarios) {
      if (usuario.resetToken) {
        const tokenValido = await bcryptjs.compare(resetToken, usuario.resetToken);
        if (tokenValido && usuario.resetExpires && usuario.resetExpires > new Date()) {
          usuarioEncontrado = usuario;
          break;
        }
      }
    }

    if (!usuarioEncontrado) {
      throw new Error('Token de reset inválido ou expirado');
    }

    // Hash da nova senha
    const salt = await bcryptjs.genSalt(10);
    const senhaHash = await bcryptjs.hash(novaSenha, salt);

    // Atualiza a senha e remove o token
    await prisma.usuario.update({
      where: { id: usuarioEncontrado.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetExpires: null
      }
    });

    return { message: 'Senha alterada com sucesso' };
  },

  async updatePassword(userId: number, senhaAtual: string, novaSenha: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    // Valida a senha atual
    const senhaValida = await bcryptjs.compare(senhaAtual, usuario.senha);
    if (!senhaValida) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const salt = await bcryptjs.genSalt(10);
    const senhaHash = await bcryptjs.hash(novaSenha, salt);

    // Atualiza a senha
    await prisma.usuario.update({
      where: { id: userId },
      data: { senha: senhaHash }
    });

    return { message: 'Senha alterada com sucesso' };
  },

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_key');
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
};

