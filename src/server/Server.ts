import express, { Application } from 'express'
import cors from 'cors';
import path from 'path';


class Server {

    private app: Application;
    private port: string;


    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000'

        this.middlewares();
        this.configureRoutes();
    }

    middlewares() { }

    private configureRoutes(): void {

    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriend en localhost' + this.port)
        })
    }
}

export default Server;