import { IMarca } from "../models/marca.model";
import { IMarcaRepository, MarcaRepository } from "../repositories/marca.repository";



export class MarcaService {
    private marcaRepo: IMarcaRepository;

    constructor(marcaRepo?: IMarcaRepository) {
        this.marcaRepo = marcaRepo || new MarcaRepository();
    }
    //servicio para obtener todas las marcas
    async getMarcaAll(): Promise<IMarca[]> {
        return await this.marcaRepo.findMarcaAll();
    }
    //servicio para obtener una marca por id
    async getMarcaById(id: string): Promise<IMarca | null> {
        return await this.marcaRepo.findMarcaById(id);
    }
    //servicio para obtener una marca por el nombre
    async getMarcaForName(name: string): Promise<IMarca | null> {
        return await this.marcaRepo.findForName(name);
    }
    //servicios para crear una marca
    async createMarca(marcaData: Partial<IMarca>): Promise<IMarca> {
        return await this.marcaRepo.createMarca(marcaData);
    }
    //servicio para actualizar una marca
    async updateMarca(id: string, marcaData: Partial<IMarca>): Promise<IMarca | null> {
        return await this.marcaRepo.updateOneMarca(id, marcaData);
    }
    //servicios para eliminar una marca
    async deleteMarca(id: string): Promise<boolean> {
        return await this.marcaRepo.deleteOneMarca(id);
    }
}