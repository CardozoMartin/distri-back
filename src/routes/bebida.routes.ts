import { Router } from 'express'
import { BebidaController } from '../controller/bebida.controller';
import { TokenMiddleware } from '../middleware/token.middleware';
import { ValidateBodyMiddleware } from '../middleware/validateBody';
import { post_schemaBebida, put_schemaBebida } from '../utils/SchemaDrinks';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const bebidaController = new BebidaController();
const isAdmin = new TokenMiddleware();
const validateBody = new ValidateBodyMiddleware()

//rutas para obtener 
//rutas publicas
router.get('/stockbebidas/bajostock', bebidaController.getDrinksWithLowStock)
router.get('/allbebidas', bebidaController.getBebidasAll);
router.get('/:id', bebidaController.getBebidasById);
router.get('/allbebidas/:marca', bebidaController.getBebidasForMarca)
//rutas para crear una bebida

router.post('/', isAdmin.verifyAdminToken,
    (req: Request, res: Response, next: NextFunction) => {
        validateBody.validatePostBody(req, res, next, post_schemaBebida);
    }, bebidaController.postBebida);

//rutas para editar o actualizar una bebida

router.put('/:id', isAdmin.verifyAdminToken,
    (req: Request, res: Response, next: NextFunction) => {
        validateBody.validatePutBody(req, res, next, put_schemaBebida);
    }, bebidaController.putBebida);
router.put('/drinkState/:id', isAdmin.verifyAdminToken, bebidaController.changeStateDrink)

// rutas para eliminar una bebida fisica o logica

router.delete('/:id',
    isAdmin.verifyAdminToken,
    bebidaController.deleteBebida)

export default router