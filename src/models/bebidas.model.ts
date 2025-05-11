import mongoose, { Document, Schema } from "mongoose";

export interface IBebidas extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  marca: string;
  imagen: string;
  sabor: string;
  tipo: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BebidasSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    marca: { type: String, required: true },
    imagen: { type: String, required: true },
    sabor: { type: String, required: true },
    tipo: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IBebidas>('Bebidas', BebidasSchema);
