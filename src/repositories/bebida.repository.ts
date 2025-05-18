import Bebida, { IBebidas } from "../models/bebidas.model";


export interface IBebidasRepository {
    findAllBebida(): Promise<IBebidas[]>;
    findByIdBebida(id: string): Promise<IBebidas | null>;
    createBebida(bebidaData: Partial<IBebidas>): Promise<IBebidas>;
    updateBebida(id: string, bebidaData: Partial<IBebidas>): Promise<IBebidas | null>
    deleteBebida(id: string): Promise<boolean>;
    changeStateDrink(id: string): Promise<IBebidas | null>;
    findDrinkForMarc(name:string):Promise<IBebidas[]>

}

export class BebidaRepository implements IBebidasRepository {
   async findDrinkForMarc(name: string): Promise<IBebidas[]> {
        try {             
       
        return await Bebida.find({ marca: name });
    } catch (error) {             
        console.error("Error finding bebidas by marca:", error);             
        return [];         
    }     
    }
    //repositorio para buscar una bebida por id
    async findByIdBebida(id: string): Promise<IBebidas | null> {
        try {
            return await Bebida.findById(id);
        } catch (error) {
            console.error("Error finding bebida by ID:", error);
            return null;
        }
    }
    //repositorio para crear una bebida
    async createBebida(bebidaData: Partial<IBebidas>): Promise<IBebidas> {
        try {
            const bebida = new Bebida(bebidaData);
            return await bebida.save();
        } catch (error) {
            console.error("Error creating bebida:", error);
            throw error;
        }
    }
    //repositorio para actualizar una bebida
    async updateBebida(id: string, bebidaData: Partial<IBebidas>): Promise<IBebidas | null> {
        try {
            return await Bebida.findByIdAndUpdate(id, bebidaData, { new: true });
        } catch (error) {
            console.error("Error updating bebida:", error);
            return null;
        }
    }
    //repositorio para eliminar una bebida
    async deleteBebida(id: string): Promise<boolean> {
        try {
            const result = await Bebida.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.error("Error deleting bebida:", error);
            return false;
        }
    }
    //repo para obtener todas las ebidas
    async findAllBebida(): Promise<IBebidas[]> {
        try {
            return await Bebida.find();
        } catch (error) {
            console.error("Error finding all bebidas:", error);
            throw error;
        }
    }
    // repositorio para modificar si está activa la bebida
    async changeStateDrink(id: string): Promise<IBebidas | null> {
        try {
            // Obtener la bebida actual
            const bebida = await Bebida.findById(id);
            if (!bebida) return null;

            // Cambiar el estado de isActive
            const nuevoEstado = !bebida.isActive;

            // Actualizar el documento con el nuevo estado
            const bebidaActualizada = await Bebida.findByIdAndUpdate(
                id,
                { isActive: nuevoEstado },
                { new: true } // para devolver el documento actualizado
            );

            return bebidaActualizada;
        } catch (error) {
            console.error('Error al cambiar el estado de la bebida:', error);
            return null;
        }
    }

}