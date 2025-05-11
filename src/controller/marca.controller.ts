import { Request, Response } from "express";
import { MarcaService } from "../services/marca.service";


export class MarcaController {
    private marcaService: MarcaService;

    constructor() {
        this.marcaService = new MarcaService();
    }
    //controlador para obtener todas las marcas
    getAllMarca = async (req: Request, res: Response): Promise<void> => {
        try {
            const marca = await this.marcaService.getMarcaAll();
            res.status(200).json({ message: 'Todas las Marcas', marca })
        } catch (error) {
            res.status(500).json({ message: 'Ocurrio un error al obtener todas las marcas', error })
        }
    }

    //controlador para obetner una marca por id
    getMarcaById = async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params
        try {
            const marca = await this.marcaService.getMarcaById(id);
            if (!marca) {
                res.status(404).json({ message: 'No se encontro la marca por el id' });
            }
            res.status(200).json({ message: 'Marca encontrada', marca })
        } catch (error) {
            res.status(500).json({ message: 'ocurrio un error', error })
        }
    }
    //controlador para buscar una marca por el nombre
    getMarcaForName = async (req: Request, res: Response): Promise<void> => {
        const { name } = req.body

        try {
            const marca = await this.marcaService.getMarcaForName(name);
            if (!marca) {
                res.status(404).json({ message: 'No se encontro la marca por el nombre' })
            }
            res.status(200).json({ message: 'Marca encotnrada por nombre', marca })
        } catch (error) {
            res.status(500).json({ message: 'Ocurrio un problema', error })
        }
    }
    //controlador para crear una marca
    postMarca = async (req: Request, res: Response): Promise<void> => {
        const { body } = req;
        try {
            const marca = await this.marcaService.createMarca(body);
            res.status(201).json({ message: 'Marca creada con exito', marca })
        } catch (error) {
            res.status(500).json({ message: 'Ocurrio un problema al crear la marca', error })
        }
    }
    //controlador par actualizar una marca
    putMarca = async(req:Request,res:Response):Promise<void> =>{
        const { id } = req.params;
        const { body } = req; 

        try {
            const marca = await this.marcaService.updateMarca(id,body)
            if(!marca){
                res.status(404).json({message:'No se encontro la marca para actualizar'})
            }
            res.status(200).json({message:"Se actualizo la marca con exito",marca})
        } catch (error) {
            res.status(500).json({message:'Ocurrio un error',error})
        }
    }

    //controlador para eliminar una marca
    deleteMarca = async(req:Request, res:Response):Promise<void> =>{
        const { id } = req.params;

        try {
            const marca = await this.marcaService.deleteMarca(id);
            if(!marca){
                res.status(404).json({message:'Ocurrio un error al encontr la marca para eliminar'})
            }
            res.status(200).json({message:'Se elimino la marca con exito',marca})
        } catch (error) {
            res.status(500).json({message:'Ocurrio un error',error})
        }
    }
}