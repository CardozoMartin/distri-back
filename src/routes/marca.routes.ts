
import { Router } from 'express';
import { MarcaController } from '../controller/marca.controller';
import { TokenMiddleware } from '../middleware/token.middleware';

const router = Router();
const marcaController = new MarcaController();
const isAdmin = new TokenMiddleware();

// Routes for getting marca(s)
router.get('/', marcaController.getAllMarca);
router.get('/:id', marcaController.getMarcaById);
router.get('/name/:name', marcaController.getMarcaForName);

// Route for creating a marca
router.post('/', marcaController.postMarca);

// Route for updating a marca
router.put('/:id', isAdmin.verifyAdminToken, marcaController.putMarca);

// Route for deleting a marca
router.delete('/:id', isAdmin.verifyAdminToken, marcaController.deleteMarca);

export default router;