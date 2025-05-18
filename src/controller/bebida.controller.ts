import { BebidaService } from "../services/bebidas.service";
import { Request, Response } from "express";
import { MarcaService } from "../services/marca.service";

export class BebidaController {

    private bebidaService: BebidaService;
    private marcaService: MarcaService;

    constructor() {
        this.bebidaService = new BebidaService();
        this.marcaService = new MarcaService();
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

    //controlador para obtener las bebidas por marca
    getBebidasForMarca = async (req:Request, res:Response):Promise<void> =>{
        const { marca } = req.params
        
        try {
            const bebidas = await this.bebidaService.getBebidaForMarca(marca)
            if(!bebidas){
                res.status(404).json({message:'No se encontro ningun producto con esta marca'})
            }
            res.status(200).json({message:'Se encontro los siguientes productos',bebidas})
        } catch (error) {
            res.status(500).json({message:'ocurrio un error',error})
        }
    }
    //controlador para crear una bebida
    postBebida = async (req: Request, res: Response): Promise<void> => {
        const { body } = req
        const nameMarca = req.body.marca



        try {
            //verificamos que la marca exista en la base de datos
            const verifyMarca = await this.marcaService.getMarcaForName(nameMarca)
            if (!verifyMarca) {
                res.status(404).json({ message: 'No se encontro la marca' })
                return;
            }

            const bebidaData = { ...req.body, marca: nameMarca }
            const bebida = await this.bebidaService.postOneBebida(bebidaData)
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
        const { id } = req.params

        try {
            const drinkDelete = await this.bebidaService.deleteOneBebida(id)
            if (!drinkDelete) {
                res.status(404).json({ message: 'No se encontro la bebida para eliminar' })
            }
            res.status(200).json({ message: 'Se elimino con exito' })
        } catch (error) {
            res.status(500).json({ message: 'Ocurrio un error al eliminar la bebida' })
        }
    }
    //controlador para cambiar el estado de la bebida
    changeStateDrink = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params
        try {
            const drinkChangeState = await this.bebidaService.changeStateDrink(id);
            if (!drinkChangeState) {
                res.status(404).json({ message: 'No se encontro la bebida para modificar el estado' })
            }
            res.json(200).json({ message: 'Se modifico el estado de la bebida', drinkChangeState })
        } catch (error) {

        }
    }
}