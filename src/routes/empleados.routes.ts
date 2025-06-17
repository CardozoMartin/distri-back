import { Router } from "express";
import { EmpleadoController } from "../controller/empleado.controller";

const router = Router();
const empleadoController = new EmpleadoController();
router.get('/', empleadoController.getAllEmpleados);
router.get('/:id', empleadoController.getEmpleadoById)
router.post('/', empleadoController.createEmpleado)
router.put('/:id', empleadoController.updateEmpleado)
router.delete('/:id', empleadoController.deleteEmpleado)

export default router;