import { Request, Response } from "express";
import { EmpleadoService } from "../services/empleado.service";


export class EmpleadoController {

    private empleadoService: EmpleadoService;

    constructor(empleadoService?: EmpleadoService) {
        this.empleadoService = empleadoService || new EmpleadoService();
    }

    //controlador para obtener todos los empleados
    getAllEmpleados = async(req: Request, res: Response) => {
        try {
            const empleados = await this.empleadoService.getAllEmpleados();
            res.status(200).json({ message: 'Todos los empleados', data: empleados });
        } catch (error) {
            console.error("Error al obtener todos los empleados");
            res.status(500).json({ message: 'Error al obtener todos los empleados' });
        }
    }
    //controlador para obtener un empleado por id
    getEmpleadoById = async(req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const empleado = await this.empleadoService.getEmpleadoById(req.params.id);
            if (!empleado) {
                res.status(404).json({ message: 'Empleado no encontrado' });
            }
            res.status(200).json({ message: 'Empleado encontrado', data: empleado });
        } catch (error) {
            console.error("Error al obtener el empleado por id");
            res.status(500).json({ message: 'Error al obtener el empleado por id' });
        }
    }

    //controlador para crear un empleado
    createEmpleado = async(req: Request, res: Response) => {
        try {
            const empleado = await this.empleadoService.createEmpleado(req.body);
            res.status(201).json({ message: 'Empleado creado', data: empleado });
        } catch (error) {
            console.error("Error al crear el empleado");
            res.status(500).json({ message: 'Error al crear el empleado' });
        }
    }

    //controlador para actualizar un empleado
    updateEmpleado = async(req: Request, res: Response) => {
        const { id } = req.params;
        const { body } = req;

        try {
            const empleado = await this.empleadoService.updateEmpleado(id, body);
            if (!empleado) {
                res.status(404).json({ message: 'Empleado no encontrado' });
            }
            res.status(200).json({ message: 'Empleado actualizado', data: empleado });
        } catch (error) {
            console.error("Error al actualizar el empleado");
            res.status(500).json({ message: 'Error al actualizar el empleado' });
        }
    }
    //controlador para eliminar un empleado
    deleteEmpleado = async(req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const empleado = await this.empleadoService.deleteEmpleado(id);
            if (!empleado) {
                res.status(404).json({ message: 'Empleado no encontrado' });
            }
            res.status(200).json({ message: 'Empleado eliminado', data: empleado });
        } catch (error) {
            console.error("Error al eliminar el empleado");
            res.status(500).json({ message: 'Error al eliminar el empleado' });
        }
    }
} 