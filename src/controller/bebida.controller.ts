import { BebidaService } from "../services/bebidas.service";
import { Request, Response } from "express";

export class BebidaController {

    private bebidaService: BebidaService;

    constructor() {
        this.bebidaService = new BebidaService();
    }
    //controlador para obtener todos los productos
    getBebidasAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const bebidas = await this.bebidaService.getAllBebidas();
            res.status(200).json({ message: "Todas las Bebidas", bebidas })
        } catch (error) {
            res.status(500).json({
                message: 'Ocurrio un error ', error
            })
        }
    }

    //contrlador para obtener una bebida por id
    getBebidasById = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params
        try {
            const bebida = await this.bebidaService.getBebidaById(id)
            if (!bebida) {
                res.status(400).json({ message: 'No se encontro la bebida' })
            }
            res.status(200).json({ message: 'Bebida encontrada', bebida })
        } catch (error) {
            res.status(500).json({
                message: 'Ocurrio un error al buscar una bebida', error
            })
        }
    }
    //controlador para crear una bebida
    postBebida = async (req: Request, res: Response): Promise<void> => {
        const { body } = req
        try {
            const bebida = await this.bebidaService.postOneBebida(body)
            res.status(200).json(bebida);
        } catch (error) {
            res.status(500).json({ message: 'Ocurrio un error al crear la bebida' })
        }
    }
    //controlador para actualizar una bebida
    putBebida = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params
        const { body } = req
        try {
            const bebida = await this.bebidaService.putOneBebida(id, body)
            if (!bebida) {
                res.status(404).json({ message: 'No se encontro la bebida para actualizar' })
            }
            res.status(200).json({ message: 'Se actualizo con exito', bebida })
        } catch (error) {
            res.status(500).json({ message: 'Ocurrio un error al actualizar la bebida' })

        }
    }
    //controlador para eliminar una bebida
    deleteBebida = async (req: Request, res: Response): Promise<void> => {

    }
}