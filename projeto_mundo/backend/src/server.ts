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

app.use(express.json());

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Backend do Projeto Mundo está rodando!' });
});

// Listar todos os continentes
app.get('/api/continentes', async (req, res) => {
  try {
    const continentes = await prisma.continente.findMany();
    res.json(continentes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar continentes' });
  }
});

// Listar todos os países
app.get('/api/paises', async (req, res) => {
  try {
    const paises = await prisma.pais.findMany({
      include: { continente: true }
    });
    res.json(paises);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar países' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
