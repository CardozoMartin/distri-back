import { Document, model, Schema } from "mongoose";

export interface ICart extends Document {
    productos: Array<{ id: string, quantity: number, price: number, name: string }>,
    total: number,
    user: Array<{ id: string, name: string, email: string, phone: string }>
    status: string,
    fecha: Date,
    paymentMethod: string,
    delivered: boolean,
    statusOrder: 'pending' | 'accepted' | 'cancelled'
}


const cartSchema = new Schema({
    productos: [{
        id: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        name: { type: String, required: true }
    }],
    total: { type: Number, required: true },
    user: [{
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    }],
    status: { type: String, required: true },
    fecha: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    delivered: { type: Boolean, required: true },
    statusOrder: {
        type: String,
        enum: ['pending', 'accepted', 'cancelled'],
        default: 'pending'
    }
})

export default model<ICart>('Cart', cartSchema);