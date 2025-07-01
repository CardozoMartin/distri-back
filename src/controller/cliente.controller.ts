import { Request, Response } from 'express';
import { ClienteService } from "../services/cliente.service";

export class ClienteController {
    private clienteServ: ClienteService;

    constructor(clienteServ?: ClienteService) {
        this.clienteServ = clienteServ || new ClienteService();
    }

    // Controlador para obtener todos los clientes
    getClientesAll = async (req: Request, res: Response): Promise<void> => {
        try {
            const clientes = await this.clienteServ.getAllClients();
            res.status(200).json({
                message: 'Todos los Clientes',
                clientes,
                total: clientes.length
            });
        } catch (error) {
            console.error('Error en getClientesAll:', error);
            res.status(500).json({
                message: 'Error al obtener todos los clientes',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para obtener un cliente por id
    getClienteForById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Validar que el ID esté presente
            if (!id) {
                res.status(400).json({ message: 'ID del cliente es requerido' });
                return;
            }

            const cliente = await this.clienteServ.getClienteById(id);

            if (!cliente) {
                res.status(404).json({ message: 'Cliente no encontrado' });
                return;
            }

            res.status(200).json({
                message: 'Cliente encontrado',
                cliente
            });
        } catch (error) {
            console.error('Error en getClienteForById:', error);
            res.status(500).json({
                message: "Error al encontrar al cliente",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para obtener cliente por email
    getClienteByEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.params;

            if (!email) {
                res.status(400).json({ message: 'Email es requerido' });
                return;
            }

            const cliente = await this.clienteServ.getClienteForEmail(email);

            if (!cliente) {
                res.status(404).json({ message: 'Cliente no encontrado' });
                return;
            }

            res.status(200).json({
                message: 'Cliente encontrado',
                cliente
            });
        } catch (error) {
            console.error('Error en getClienteByEmail:', error);
            res.status(500).json({
                message: "Error al buscar cliente por email",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para obtener cliente por teléfono
    getClienteByPhone = async (req: Request, res: Response): Promise<void> => {
        try {
            const { phone } = req.params;

            if (!phone) {
                res.status(400).json({ message: 'Teléfono es requerido' });
                return;
            }

            const cliente = await this.clienteServ.getClienteForPhone(phone);

            if (!cliente) {
                res.status(404).json({ message: 'Cliente no encontrado' });
                return;
            }

            res.status(200).json({
                message: 'Cliente encontrado',
                cliente
            });
        } catch (error) {
            console.error('Error en getClienteByPhone:', error);
            res.status(500).json({
                message: "Error al buscar cliente por teléfono",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para obtener cliente por documento
    getClienteByDocument = async (req: Request, res: Response): Promise<void> => {
        try {
            const { dni } = req.params;

            if (!dni) {
                res.status(400).json({ message: 'Documento es requerido' });
                return;
            }

            const cliente = await this.clienteServ.getClienteForDocumente(dni);

            if (!cliente) {
                res.status(404).json({ message: 'Cliente no encontrado' });
                return;
            }

            res.status(200).json({
                message: 'Cliente encontrado',
                cliente
            });
        } catch (error) {
            console.error('Error en getClienteByDocument:', error);
            res.status(500).json({
                message: "Error al buscar cliente por documento",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para crear un cliente
    createCliente = async (req: Request, res: Response): Promise<void> => {
        try {
            const clienteData = req.body;

            if (!clienteData || Object.keys(clienteData).length === 0) {
                res.status(400).json({ message: 'Los datos del cliente son requeridos' });
                return;
            }
            
            // Verificamos si el email ya existe
            if (!clienteData.email || !clienteData.email.includes('@')) {
                res.status(400).json({ message: 'Email es requerido y debe ser válido' });
                return;
            }
            
            const nuevoCliente = await this.clienteServ.createCliente(clienteData);

            res.status(201).json({
                message: 'Cliente creado exitosamente',
                cliente: nuevoCliente
            });
        } catch (error) {
            console.error('Error en createCliente:', error);

            // Manejo específico de errores de validación
            if (error instanceof Error) {
                // Error de duplicado (email, documento o teléfono ya existente)
                if (error.message.includes('Ya existe un cliente con este email')) {
                    res.status(409).json({
                        message: 'El email ya está en uso. Por favor, utiliza un email diferente.',
                        error: 'DUPLICATE_EMAIL',
                        details: 'Ya existe un cliente registrado con este email'
                    });
                    return;
                }

                if (error.message.includes('Ya existe un cliente con este documento')) {
                    res.status(409).json({
                        message: 'Ya existe un cliente registrado con este documento',
                        error: 'DUPLICATE_DOCUMENT'
                    });
                    return;
                }

                if (error.message.includes('Ya existe un cliente con este teléfono')) {
                    res.status(409).json({
                        message: 'Ya existe un cliente registrado con este teléfono',
                        error: 'DUPLICATE_PHONE'
                    });
                    return;
                }

                // Errores de validación general
                if (error.message.includes('requerido') || error.message.includes('válido')) {
                    res.status(400).json({
                        message: error.message,
                        error: 'VALIDATION_ERROR'
                    });
                    return;
                }
            }

            // Error interno del servidor
            res.status(500).json({
                message: "Error interno al crear el cliente",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para actualizar un cliente
    updateCliente = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const clienteData = req.body;

            if (!id) {
                res.status(400).json({ message: 'ID del cliente es requerido' });
                return;
            }

            if (!clienteData || Object.keys(clienteData).length === 0) {
                res.status(400).json({ message: 'Los datos del cliente son requeridos' });
                return;
            }

            const clienteActualizado = await this.clienteServ.updateCliente(id, clienteData);

            res.status(200).json({
                message: 'Cliente actualizado exitosamente',
                cliente: clienteActualizado
            });
        } catch (error) {
            console.error('Error en updateCliente:', error);

            if (error instanceof Error && error.message === 'Cliente no encontrado') {
                res.status(404).json({ message: error.message });
                return;
            }

            res.status(500).json({
                message: "Error al actualizar el cliente",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Controlador para eliminar un cliente
    deleteCliente = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ message: 'ID del cliente es requerido' });
                return;
            }

            const eliminado = await this.clienteServ.deleteCliente(id);

            if (!eliminado) {
                res.status(404).json({ message: 'Cliente no encontrado' });
                return;
            }

            res.status(200).json({
                message: 'Cliente eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en deleteCliente:', error);

            if (error instanceof Error && error.message === 'Cliente no encontrado') {
                res.status(404).json({ message: error.message });
                return;
            }

            res.status(500).json({
                message: "Error al eliminar el cliente",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}