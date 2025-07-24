// server/Server.ts
import express, { Application } from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';

import bebidasRouter from '../routes/bebida.routes'
import marcasRouter from '../routes/marca.routes'
import cartRouter from '../routes/cart.routes'
import clienteRouter from '../routes/cliente.routes'
import empleadoRouter from '../routes/empleados.routes'
import loginRouter from '../routes/login.route';
import { whatsappService } from '../services/whatsapp.service'; // Importar la instancia

// Singleton para manejar WebSocket globalmente
export class SocketManager {
    private static instance: SocketManager;
    private io: SocketIOServer | null = null;

    private constructor() {}

    static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            SocketManager.instance = new SocketManager();
        }
        return SocketManager.instance;
    }

    setIO(io: SocketIOServer): void {
        this.io = io;
    }

    getIO(): SocketIOServer | null {
        return this.io;
    }

    // Método para emitir eventos de carrito
    emitCartEvent(event: string, data: any): void {
        if (this.io) {
            this.io.to('cart-notifications').emit(event, data);
        }
    }

    // Método para emitir eventos a administradores
    emitAdminEvent(event: string, data: any): void {
        if (this.io) {
            this.io.to('admin-notifications').emit(event, data);
        }
    }

    // Método para emitir eventos de WhatsApp
    emitWhatsAppEvent(event: string, data: any): void {
        if (this.io) {
            this.io.to('admin-notifications').emit(event, data);
        }
    }
}

class Server {
    private app: Application;
    private port: string;
    private server: http.Server;
    private io: SocketIOServer;
    private socketManager: SocketManager;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '4000';
        
        // Crear servidor HTTP
        this.server = http.createServer(this.app);
        
        // Configurar Socket.IO
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: [
                    'http://localhost:5173',
                    'http://127.0.0.1:5173',
                    'http://localhost:3000',
                    'http://127.0.0.1:3000',
                    'https://vhbpfn9n-5173.brs.devtunnels.ms',
                    "https://admindistrinort.netlify.app",
                    "https://distrinort.netlify.app",
                     'http://localhost:5174',
                    'http://127.0.0.1:5174',
                ],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        // Configurar el singleton
        this.socketManager = SocketManager.getInstance();
        this.socketManager.setIO(this.io);

        this.middlewares();
        this.configureRoutes();
        this.configureSocket();
        
        // Inicializar WhatsApp service después de configurar todo
        this.initializeWhatsApp();
    }

    middlewares() {
        this.app.use(cors({
            origin: [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:5174',
                'http://127.0.0.1:5174',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'https://vhbpfn9n-5173.brs.devtunnels.ms',
                "https://admindistrinort.netlify.app",
                "https://distrinort.netlify.app"
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            credentials: true,
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    configureRoutes() {
        this.app.use('/api/bebidas', bebidasRouter);
        this.app.use('/api/marcas', marcasRouter);
        this.app.use('/api/cart', cartRouter);
        this.app.use('/api/clientes', clienteRouter);
        this.app.use('/api/empleados', empleadoRouter);
        this.app.use('/api/login', loginRouter);

        // Agregar ruta para estado de WhatsApp
        this.app.get('/api/whatsapp/status', (req, res) => {
            try {
                const status = whatsappService.getState();
                res.json({ status, message: 'WhatsApp service status' });
            } catch (error) {
                res.status(500).json({ error: 'Error getting WhatsApp status' });
            }
        });

        // Ruta para enviar mensajes de WhatsApp
        this.app.post('/api/whatsapp/send', async (req, res) => {
            try {
                const { phone, message } = req.body;
                
                if (!phone || !message) {
                    return res.status(400).json({ error: 'Phone and message are required' });
                }

                await whatsappService.sendMessage(phone, message);
                res.json({ success: true, message: 'Message sent successfully' });
            } catch (error) {
                console.error('Error sending WhatsApp message:', error);
                res.status(500).json({ error: 'Error sending message' });
            }
        });
    }

    private configureSocket(): void {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);
            
            // Unir al cliente a la sala de notificaciones de carritos
            socket.join('cart-notifications');
            
            // Evento para administradores
            socket.on('join-admin', () => {
                socket.join('admin-notifications');
                console.log('Admin conectado:', socket.id);
                
                // Enviar estado actual de WhatsApp al admin que se conecta
                const whatsappStatus = whatsappService.getState();
                socket.emit('whatsapp-status', { status: whatsappStatus });
            });
            
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
    }

    // Método para inicializar WhatsApp service
    private async initializeWhatsApp(): Promise<void> {
        try {
            console.log('🚀 Iniciando WhatsApp Service...');
            
            // Configurar eventos de WhatsApp para emitir a través de Socket.IO
            this.setupWhatsAppEvents();
            
            // Inicializar el servicio
            await whatsappService.start();
            
        } catch (error) {
            console.error('❌ Error al inicializar WhatsApp Service:', error);
            
            // Emitir error a los administradores conectados
            this.socketManager.emitAdminEvent('whatsapp-error', {
                error: 'Failed to initialize WhatsApp service',
                details: error
            });
        }
    }

    // Configurar eventos de WhatsApp para notificar a través de WebSocket
    private setupWhatsAppEvents(): void {
        // Nota: Este método asume que tu WhatsApp service tiene estos eventos
        // Si no los tiene, puedes modificar el WhatsApp service para incluirlos
        
        // Ejemplo de cómo podrías extender el WhatsApp service:
        /*
        whatsappService.on('qr', (qr) => {
            this.socketManager.emitAdminEvent('whatsapp-qr', { qr });
        });

        whatsappService.on('ready', () => {
            this.socketManager.emitAdminEvent('whatsapp-ready', {
                message: 'WhatsApp is ready'
            });
        });

        whatsappService.on('authenticated', () => {
            this.socketManager.emitAdminEvent('whatsapp-authenticated', {
                message: 'WhatsApp authenticated successfully'
            });
        });

        whatsappService.on('disconnected', (reason) => {
            this.socketManager.emitAdminEvent('whatsapp-disconnected', {
                reason,
                message: 'WhatsApp disconnected'
            });
        });
        */
    }

    listen() {
        // Cambiar de app.listen a server.listen para soportar WebSocket
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en localhost:' + this.port);
        });
    }

    // Método para obtener el servicio de WhatsApp (útil para testing)
    getWhatsAppService() {
        return whatsappService;
    }
}

export default Server;