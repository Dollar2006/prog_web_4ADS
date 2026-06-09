import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do CORS
app.use(cors({
  origin: 'http://localhost:5173', // Porta padrão do Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

import prisma from './lib/prisma.js';
import { seedDefaultUsers } from './lib/seed.js';
import authRoutes from './routes/auth.js';
import continentsRoutes from './routes/continents.js';
import countriesRoutes from './routes/countries.js';
import citiesRoutes from './routes/cities.js';
import * as cidadeController from './controllers/cidade.controller.js';

app.use(express.json());

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Backend do Projeto Mundo está rodando!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// ============================================
// ROTA PÚBLICA - Validação de Cidade (SEM AUTENTICAÇÃO)
// ============================================
app.get('/api/cities/validate', cidadeController.validateCity);

app.use('/api/auth', authRoutes);

app.use('/api/continents', continentsRoutes);

app.use('/api/countries', countriesRoutes);

app.use('/api/cities', citiesRoutes);

// Inicia o servidor e faz seed dos usuários padrão
async function startServer() {
  try {
    // Verifica conexão com o banco
    await prisma.$connect();
    console.log('✓ Conectado ao banco de dados');

    // Faz seed dos usuários padrão
    await seedDefaultUsers();

    app.listen(PORT, () => {
      console.log(`\n✓ Server is running on http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();


