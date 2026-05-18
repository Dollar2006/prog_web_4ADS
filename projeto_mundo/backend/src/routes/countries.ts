import { Router } from 'express';
import * as paisController from '../controllers/pais.controller.js';

const router = Router();

router.get('/', paisController.listCountries);
router.get('/:id', paisController.getCountryById);
router.post('/', paisController.createCountry);
router.put('/:id', paisController.updateCountry);
router.delete('/:id', paisController.deleteCountry);

export default router;
