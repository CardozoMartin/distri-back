import { IEmpleado } from "../models/empleados.model";
import { EmpleadosRepository, IEmpleadosRepository } from "../repositories/empleado.repository";

export class EmpleadoService {
    private empleadoRepo: IEmpleadosRepository;

    constructor(empleadoRepo?: IEmpleadosRepository) {
        this.empleadoRepo = empleadoRepo || new EmpleadosRepository();
    }

    // Servicio para obtener todos los empleados
    async getAllEmpleados(): Promise<IEmpleado[]> {
        return await this.empleadoRepo.findAllEmpleados();
    }

    // Servicio para obtener un empleado por id
    async getEmpleadoById(id: string): Promise<IEmpleado | null> {
        return await this.empleadoRepo.findByIdEmpleado(id);
    }

    // Servicio para crear un empleado
    async createEmpleado(empleadoData: Partial<IEmpleado>): Promise<IEmpleado> {
        return await this.empleadoRepo.createEmpleado(empleadoData);
    }

    // Servicio para actualizar un empleado
    async updateEmpleado(id: string, empleadoData: Partial<IEmpleado>): Promise<IEmpleado | null> {
        return await this.empleadoRepo.updateEmpleado(id, empleadoData);
    }

    // Servicio para eliminar un empleado
    async deleteEmpleado(id: string): Promise<boolean> {
        return await this.empleadoRepo.deleteEmpleado(id);
    }
}