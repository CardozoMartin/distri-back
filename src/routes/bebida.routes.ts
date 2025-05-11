import { Router } from 'express'
import { BebidaController } from '../controller/bebida.controller';


const router = Router();
const bebidaController = new BebidaController();


//rutas para obtener
router.get('/', bebidaController.getBebidasAll);
router.get('/', bebidaController.getBebidasById);

//rutas para crear una bebida

router.post('/', bebidaController.postBebida);

//rutas para editar o actualizar una bebida

router.put('/', bebidaController.putBebida)

// rutas para eliminar una bebida fisica o logica

router.delete('/', bebidaController.deleteBebida)

export default router