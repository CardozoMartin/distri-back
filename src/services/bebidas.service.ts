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

    //obtener bebidas por el nombre de marca
    async getBebidaForMarca(marca: string): Promise<IBebidas[]> {
        return await this.bebidaRepo.findDrinkForMarc(marca)
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
    async changeStateDrink(id: string): Promise<IBebidas | null> {
        return await this.bebidaRepo.changeStateDrink(id)
    }

    // Servicio para descontar stock
    async decreaseStock(id: string, quantity: number): Promise<IBebidas | null> {
        try {
            if (quantity <= 0) {
                throw new Error("La cantidad a descontar debe ser mayor a 0");
            }

            return await this.bebidaRepo.decreaseStock(id, quantity);
        } catch (error) {
            console.error("Error en decreaseStock service:", error);
            throw error;
        }
    }

    // Servicio para aumentar stock
    async increaseStock(id: string, quantity: number): Promise<IBebidas | null> {
        try {
            if (quantity <= 0) {
                throw new Error("La cantidad a aumentar debe ser mayor a 0");
            }

            return await this.bebidaRepo.increaseStock(id, quantity);
        } catch (error) {
            console.error("Error en increaseStock service:", error);
            throw error;
        }
    }

    // Servicio para verificar disponibilidad de stock
    async checkStockAvailability(id: string, requiredQuantity: number): Promise<{
        isAvailable: boolean;
        currentStock: number;
        bebida: IBebidas | null;
    }> {
        try {
            const bebida = await this.bebidaRepo.findByIdBebida(id);
            
            if (!bebida) {
                return {
                    isAvailable: false,
                    currentStock: 0,
                    bebida: null
                };
            }

            return {
                isAvailable: bebida.stock >= requiredQuantity && bebida.isActive === true,
                currentStock: bebida.stock,
                bebida: bebida
            };
        } catch (error) {
            console.error("Error en checkStockAvailability service:", error);
            throw error;
        }
    }

    // Servicio para actualizar stock múltiples bebidas (útil para transacciones)
    async updateMultipleStock(updates: Array<{ id: string, quantity: number, operation: 'increase' | 'decrease' }>): Promise<{
        successful: Array<{ id: string, newStock: number }>;
        failed: Array<{ id: string, error: string }>;
    }> {
        const successful = [];
        const failed = [];

        for (const update of updates) {
            try {
                let result;
                if (update.operation === 'decrease') {
                    result = await this.decreaseStock(update.id, update.quantity);
                } else {
                    result = await this.increaseStock(update.id, update.quantity);
                }

                if (result) {
                    successful.push({
                        id: update.id,
                        newStock: result.stock
                    });
                }
            } catch (error) {
                failed.push({
                    id: update.id,
                    error: error instanceof Error ? error.message : 'Error desconocido'
                });
            }
        }

        return { successful, failed };
    }
}