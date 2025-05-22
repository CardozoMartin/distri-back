import Cliente, { ICliente } from "../models/clientes.model";


export interface IClientesRepository {
    findAllClients(): Promise<ICliente[]>;
    findByIdClient(id: string): Promise<ICliente | null>;
    findByEmailClient(email: string): Promise<ICliente | null>;
    findByPhoneClient(phone: string): Promise<ICliente | null>;
    findByDocumentClient(document: string): Promise<ICliente | null>;
    createClient(client: ICliente): Promise<ICliente>;
    updateClient(id: string, client: ICliente): Promise<ICliente | null>;
    deleteClient(id: string): Promise<boolean>;
}

export class ClientesRepository implements IClientesRepository {
    async findAllClients(): Promise<ICliente[]> {
        try {
            return await Cliente.find();
        } catch (error) {
            console.error("Error al obtener todos los clientes");
            return []
        }
    }
    async findByIdClient(id: string): Promise<ICliente | null> {
        try {
            return await Cliente.findById(id);
        } catch (error) {
            console.error("Error al obtener el cliente por id");
            return null
        }
    }
    async findByEmailClient(email: string): Promise<ICliente | null> {
        try {
            return await Cliente.findOne({ email: email });
        } catch (error) {
            console.error("Error al obtener el cliente por email");
            return null
        }
    }
    async findByPhoneClient(phone: string): Promise<ICliente | null> {
        try {
            return await Cliente.findOne({ phone: phone });
        } catch (error) {
            console.error("Error al obtener el cliente por telefono");
            return null;
        }
    }
    async findByDocumentClient(document: string): Promise<ICliente | null> {
        try {
            return await Cliente.findOne({ document: document });
        } catch (error) {
            console.error("Error al obtener el cliente por documento");
            return null
        }
    }
    async createClient(clientData: Partial<ICliente>): Promise<ICliente> {
        try {
            const newCliente = new Cliente(clientData);
            return await newCliente.save();
        } catch (error) {
            console.log("error al cargar un nuevo cliente");
            throw error;
        }
    }
    async updateClient(id: string, client: Partial<ICliente>): Promise<ICliente | null> {
        try {
            return await Cliente.findByIdAndUpdate(id, client, { new: true });
        } catch (error) {
            console.error("Error al actualizar el cliente");
            return null;
        }
    }
    async deleteClient(id: string): Promise<boolean> {
        try {
            const result = await Cliente.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            console.log("Error al eliminar el cliente");
            return false; // Indica que ocurrió un error al eliminar el cliente, no se encontró el registr
        }
    }

}