import { Router } from 'express';
import { MarcaController } from '../controller/marca.controller';


const router = Router();
const marcaController = new MarcaController();

//rutas para obtener
router.get('/', marcaController.getAllMarca)
router.get('/', marcaController.getMarcaById)
router.get('/', marcaController.getMarcaForName)

//rutas para crear una marca
router.post('/', marcaController.postMarca)

//rutas para editar
router.put('/', marcaController.putMarca)

//rutas para eliminar fisica o logica
router.delete('/', marcaController.deleteMarca)

export default router