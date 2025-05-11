import express, { Application } from 'express'
import cors from 'cors';
import path from 'path';
import bebidasRouter from '../routes/bebida.routes'
import marcasRouter from '../routes/marca.routes'

class Server {

    private app: Application;
    private port: string;


    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000'

        this.middlewares();
        this.configureRoutes();
    }

    middlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

     }

    private configureRoutes(): void {
        this.app.use('/api/bebidas',bebidasRouter)
        this.app.use('/api/marca',marcasRouter)
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriend en localhost' + this.port)
        })
    }
}

export default Server;