import { IBebidas } from "../models/bebidas.model";
import { BebidaRepository, IBebidasRepository } from "../repositories/bebida.repository";



export class BebidaService {
    private bebidaRepo: IBebidasRepository;

    constructor(bebidasRepo?: IBebidasRepository) {
        this.bebidaRepo = bebidasRepo || new BebidaRepository()
    }
    //servicios para obtener todas las bebidas
    async getAllBebidas(): Promise<IBebidas[]> {
        return await this.bebidaRepo.findAllBebida();
    }
    //Servicios para obtener una bebida por id
    async getBebidaById(id: string): Promise<IBebidas | null> {
        return await this.bebidaRepo.findByIdBebida(id);
    }
    //servicios para crear una bebida
    async postOneBebida(bebidaData: Partial<IBebidas>): Promise<IBebidas> {
        return await this.bebidaRepo.createBebida(bebidaData)
    }
    //servicios para actualizar una bebida
    async putOneBebida(id: string, bebidaData: Partial<IBebidas>): Promise<IBebidas | null> {
        return await this.bebidaRepo.updateBebida(id, bebidaData)
    }
    //servicios para eliminar una bebida
    async deleteOneBebida(id: string): Promise<boolean> {
        return await this.bebidaRepo.deleteBebida(id);
    }
    //actualizar el estado de una bebida
    async changeStateDrink(id:string): Promise<IBebidas | null>{
        return await this.bebidaRepo.changeStateDrink(id)
    }
}