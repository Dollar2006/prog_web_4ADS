import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validação básica
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      const result = await authService.authenticate(email, password);
      
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      return res.status(401).json({ error: message });
    }
  },

  async signup(req: Request, res: Response) {
    try {
      const { email, password, confirmPassword } = req.body;

      // Validações
      if (!email || !password || !confirmPassword) {
        return res.status(400).json({
          error: 'Email, senha e confirmação são obrigatórios'
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          error: 'As senhas não conferem'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      const result = await authService.register(email, password);
      
      return res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar';
      return res.status(400).json({ error: message });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email é obrigatório'
        });
      }

      const result = await authService.requestPasswordReset(email);
      
      // Em produção, enviar email com o resetToken
      // Por agora, retornar o token para demonstração
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao solicitar reset';
      return res.status(400).json({ error: message });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { resetToken, novaSenha, confirmaSenha } = req.body;

      if (!resetToken || !novaSenha || !confirmaSenha) {
        return res.status(400).json({
          error: 'Token, nova senha e confirmação são obrigatórios'
        });
      }

      if (novaSenha !== confirmaSenha) {
        return res.status(400).json({
          error: 'As senhas não conferem'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      const result = await authService.resetPassword(resetToken, novaSenha);
      
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao resetar senha';
      return res.status(400).json({ error: message });
    }
  },

  async updatePassword(req: AuthRequest, res: Response) {
    try {
      const { senhaAtual, novaSenha, confirmaSenha } = req.body;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!senhaAtual || !novaSenha || !confirmaSenha) {
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios'
        });
      }

      if (novaSenha !== confirmaSenha) {
        return res.status(400).json({
          error: 'As novas senhas não conferem'
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      const result = await authService.updatePassword(userId, senhaAtual, novaSenha);
      
      return res.status(200).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar senha';
      return res.status(400).json({ error: message });
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const decoded = authService.verifyToken(token);
      
      return res.status(200).json({
        user: {
          id: (decoded as any).userId,
          email: (decoded as any).userEmail,
          role: (decoded as any).role
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao verificar token';
      return res.status(401).json({ error: message });
    }
  }
};

