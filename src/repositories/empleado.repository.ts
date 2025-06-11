import Empleado, { IEmpleado} from '../models/empleados.model'

export interface IEmpleadosRepository {
    findAllEmpleados(): Promise<IEmpleado[]>;
    findByIdEmpleado(id: string): Promise<IEmpleado | null>;
    createEmpleado(empleadoData: Partial<IEmpleado>): Promise<IEmpleado>;
    updateEmpleado(id: string, empleadoData: Partial<IEmpleado>): Promise<IEmpleado | null>;
    deleteEmpleado(id: string): Promise<boolean>;
}

export class EmpleadosRepository implements IEmpleadosRepository {
    async findAllEmpleados(): Promise<IEmpleado[]> {
        try {
            return await Empleado.find();
        } catch (error) {
            console.error("Error al obtener todos los empleados:", error);
            throw error; // Consistente con otros métodos
        }
    }

    async findByIdEmpleado(id: string): Promise<IEmpleado | null> {
        try {
            return await Empleado.findById(id);
        } catch (error) {
            console.error("Error al obtener el empleado por id:", error);
            throw error; // Consistente con otros métodos
        }
    }

    async createEmpleado(empleadoData: Partial<IEmpleado>): Promise<IEmpleado> {
        try {
            const newEmpleado = new Empleado(empleadoData);
            return await newEmpleado.save();
        } catch (error) {
            console.error("Error al crear el empleado:", error);
            throw error;
        }
    }

    async updateEmpleado(id: string, empleadoData: Partial<IEmpleado>): Promise<IEmpleado | null> {
        try {
            return await Empleado.findByIdAndUpdate(id, empleadoData, { new: true });
        } catch (error) {
            console.error("Error al actualizar el empleado:", error);
            throw error;
        }
    }

    async deleteEmpleado(id: string): Promise<boolean> {
        try {
            const result = await Empleado.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.error("Error al eliminar el empleado:", error);
            throw error; // Consistente con otros métodos
        }
    }
}