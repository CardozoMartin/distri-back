import { Document, model, Schema } from "mongoose";

export interface IEmpleado extends Document {
    nombre: string;
    edad: number;
    phone: string;
    email: string;
    direccion: string;
    ciudad: string;
}

const empleadoSchema = new Schema<IEmpleado>({
    nombre: {
        type: String,
        required: [true, "El nombre es obligatorio"],
    },
    edad: {
        type: Number,
        required: [true, "La edad es obligatoria"],
    },
    phone: {
        type: String,
        required: [true, "El teléfono es obligatorio"],
    },
    email: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
    },
    direccion: {
        type: String,
        required: [true, "La dirección es obligatoria"],
    },
    ciudad: {
        type: String,
        required: [true, "La ciudad es obligatoria"],
    }
}, { timestamps: true });

export default model<IEmpleado>('Empleado', empleadoSchema);