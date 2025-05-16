
import { Router } from 'express';
import { MarcaController } from '../controller/marca.controller';

const router = Router();
const marcaController = new MarcaController();

// Routes for getting marca(s)
router.get('/', marcaController.getAllMarca);
router.get('/:id', marcaController.getMarcaById);
router.get('/name/:name', marcaController.getMarcaForName);

// Route for creating a marca
router.post('/', marcaController.postMarca);

// Route for updating a marca
router.put('/:id', marcaController.putMarca);

// Route for deleting a marca
router.delete('/:id', marcaController.deleteMarca);

export default router;