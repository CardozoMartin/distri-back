import { Document, model, Schema } from "mongoose"

export interface ICliente extends Document{
    name:string,
    surname:string,
    email:string,
    address:string,
    phone:string,
    dni:string, 
}

const clienteSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    dni: {
        type: String,
        required: true,
    }
})

export default model<ICliente>('Cliente', clienteSchema)