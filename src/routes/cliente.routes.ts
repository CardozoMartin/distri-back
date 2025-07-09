import { Router } from "express";
import { ClienteController } from "../controller/cliente.controller";


const router = Router();

const clienteController = new ClienteController();

router.get('/', clienteController.getClientesAll);
router.get('/:id', clienteController.getClienteForById)
router.get('/email/:email',clienteController.getClienteByEmail)
router.get('/phone/:phone',clienteController.getClienteByPhone)
router.get('/dni/:dni',clienteController.getClienteByDocument)
router.post('/crearcliente', clienteController.createCliente)
router.put('/:id', clienteController.updateCliente)
router.delete('/:id', clienteController.deleteCliente)


export default router;