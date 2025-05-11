import Bebida, { IBebidas } from "../models/bebidas.model";


export interface IBebidasRepository{
    findAllBebida(): Promise<IBebidas[]>;
    findByIdBebida(id:string): Promise<IBebidas | null>;
    createBebida(bebidaData: Partial<IBebidas>):Promise<IBebidas>;
    updateBebida(id:string,bebidaData:Partial<IBebidas>): Promise<IBebidas | null >
    deleteBebida(id:string): Promise<boolean>;
}

export class BebidaRepository implements IBebidasRepository {
    async findByIdBebida(id: string): Promise<IBebidas | null> {
        try {
            return await Bebida.findById(id);
        } catch (error) {
            console.error("Error finding bebida by ID:", error);
            return null;
        }
    }

    async createBebida(bebidaData: Partial<IBebidas>): Promise<IBebidas> {
        try {
            const bebida = new Bebida(bebidaData);
            return await bebida.save();
        } catch (error) {
            console.error("Error creating bebida:", error);
            throw error;
        }
    }

    async updateBebida(id: string, bebidaData: Partial<IBebidas>): Promise<IBebidas | null> {
        try {
            return await Bebida.findByIdAndUpdate(id, bebidaData, { new: true });
        } catch (error) {
            console.error("Error updating bebida:", error);
            return null;
        }
    }

    async deleteBebida(id: string): Promise<boolean> {
        try {
            const result = await Bebida.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.error("Error deleting bebida:", error);
            return false;
        }
    }

    async findAllBebida(): Promise<IBebidas[]> {
        try {
            return await Bebida.find();
        } catch (error) {
            console.error("Error finding all bebidas:", error);
            throw error;
        }
    }
}