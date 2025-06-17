import { Router } from 'express'
import { BebidaController } from '../controller/bebida.controller';


const router = Router();
const bebidaController = new BebidaController();


//rutas para obtener
router.get('/allbebidas', bebidaController.getBebidasAll);
router.get('/:id', bebidaController.getBebidasById);
router.get('/allbebidas/:marca', bebidaController.getBebidasForMarca)
//rutas para crear una bebida

router.post('/',bebidaController.postBebida);

//rutas para editar o actualizar una bebida

router.put('/:id', bebidaController.putBebida)
router.put('/drinkState/:id',bebidaController.changeStateDrink)

// rutas para eliminar una bebida fisica o logica

router.delete('/:id', bebidaController.deleteBebida)

export default router