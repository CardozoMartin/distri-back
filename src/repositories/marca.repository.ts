import Marca, { IMarca } from '../models/marca.model'


export interface IMarcaRepository {
    findMarcaAll(): Promise<IMarca[]>;
    findMarcaById(id: string): Promise<IMarca | null>
    findForName(name: string): Promise<IMarca | null>
    createMarca(marcaData: Partial<IMarca>): Promise<IMarca>;
    updateOneMarca(id: string, marcaData: Partial<IMarca>): Promise<IMarca | null>
    deleteOneMarca(id: string): Promise<boolean>
}

export class MarcaRepository implements IMarcaRepository {

    async findMarcaAll(): Promise<IMarca[]> {
        return await Marca.find();
    }

    async findMarcaById(id: string): Promise<IMarca | null> {
        return await Marca.findById(id);
    }
    
    async findForName(name: string): Promise<IMarca | null> {
        return await Marca.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    }

    async createMarca(marcaData: Partial<IMarca>): Promise<IMarca> {
        const newMarca = new Marca(marcaData);
        return await newMarca.save();
    }

    async updateOneMarca(id: string, marcaData: Partial<IMarca>): Promise<IMarca | null> {
        return await Marca.findByIdAndUpdate(id, marcaData, { new: true });
    }

    async deleteOneMarca(id: string): Promise<boolean> {
        const result = await Marca.findByIdAndDelete(id);
        return result !== null;
    }
}