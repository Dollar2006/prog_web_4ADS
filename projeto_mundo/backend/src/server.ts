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
import continentsRoutes from './routes/continents.js';
import countriesRoutes from './routes/countries.js';

app.use(express.json());

// Rota de teste
app.get('/api/status', (req, res) => {
  res.json({ status: 'OK', message: 'Backend do Projeto Mundo está rodando!' });
});

app.use('/api/continents', continentsRoutes);

app.use('/api/countries', countriesRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
