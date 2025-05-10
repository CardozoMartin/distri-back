import dotenv from 'dotenv';

import  connectDB  from './database/database'
import Server from './server/Server'

//funcion principal para iniciar el servidor

const starServer = async () => {
    await connectDB();
    dotenv.config();


    const server = new Server();

    server.listen()
}

starServer();