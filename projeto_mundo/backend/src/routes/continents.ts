import { Router } from 'express';
import * as continenteController from '../controllers/continente.controller.js';

const router = Router();

router.get('/', continenteController.listContinents);
router.get('/:id', continenteController.getContinentById);
router.post('/', continenteController.createContinent);
router.put('/:id', continenteController.updateContinent);
router.delete('/:id', continenteController.deleteContinent);

export default router;
