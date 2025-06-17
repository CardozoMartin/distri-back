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
                    'https://vhbpfn9n-5173.brs.devtunnels.ms'
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
    }

    middlewares() {
        this.app.use(cors({
            origin: [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'https://vhbpfn9n-5173.brs.devtunnels.ms'
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
            });
            
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });
    }

    listen() {
        // Cambiar de app.listen a server.listen para soportar WebSocket
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en localhost:' + this.port);
        });
    }
}

export default Server;