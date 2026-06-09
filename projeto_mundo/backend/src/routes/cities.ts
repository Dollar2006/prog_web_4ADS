import { Router } from 'express';
import * as cidadeController from '../controllers/cidade.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Aplicar middleware de autenticação a TODAS as rotas
router.use(authMiddleware);

// Rotas protegidas
router.post('/', cidadeController.createCity);
router.get('/', cidadeController.listCities);
router.get('/:id', cidadeController.getCityById);
router.put('/:id', cidadeController.updateCity);
router.delete('/:id', cidadeController.deleteCity);

export default router;
