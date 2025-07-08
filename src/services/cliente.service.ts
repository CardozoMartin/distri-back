import { ICliente } from "../models/clientes.model";
import { ClientesRepository, IClientesRepository } from "../repositories/cliente.repository";


export class ClienteService {

    private clienteRepo: IClientesRepository;

    constructor(clienteRepo?: IClientesRepository) {
        this.clienteRepo = clienteRepo || new ClientesRepository();
    }

    //servicio para obtener todo los clientes
    async getAllClients(): Promise<ICliente[]> {
        return await this.clienteRepo.findAllClients();
    }
    //Servicios para obtener un cliente por id
    async getClienteById(id: string): Promise<ICliente | null> {
        return await this.clienteRepo.findByIdClient(id);
    }
    //servicios para obtener un cliente por numero de telefono
    async getClienteForPhone(phone: string): Promise<ICliente | null> {
        return await this.clienteRepo.findByPhoneClient(phone);
    }
    //servicio para obtener cliente por documento
    async getClienteForDocumente(dni: string): Promise<ICliente | null> {
        return await this.clienteRepo.findByDocumentClient(dni);
    }
    //servicio para obtener cliente por email
    async getClienteForEmail(email: string): Promise<ICliente | null> {
        return await this.clienteRepo.findByEmailClient(email);
    }
    // Servicio para crear un cliente
    async createCliente(clienteData: Partial<ICliente>): Promise<ICliente> {
      
        try {
           

            return await this.clienteRepo.createClient(clienteData);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error(`Error al crear cliente: ${error}`);
        }
    }

    //servicios para actualizar un cliente
    async updateCliente(id:string,clienteData:Partial<ICliente>):Promise<ICliente | null>{
        return await this.clienteRepo.updateClient(id,clienteData);
    }
    //servicios para eliminar un cliente
    async deleteCliente(id:string):Promise<boolean>{
        return await this.clienteRepo.deleteClient(id)
    }
}