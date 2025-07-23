import { Schema, model, Document } from 'mongoose';

// Interface for the Marca document
export interface IMarca extends Document {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
//se agrega modelo
// Schema definition
const MarcaSchema = new Schema<IMarca>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la marca es obligatorio'],
      unique: true, // Make sure nombre is unique
      index: true   // Create an index on nombre
    },
    descripcion: {
      type: String,
      default: ''
    },
    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    versionKey: false // Removes __v field
  }
);

// Create and export the model
export default model<IMarca>('Marca', MarcaSchema);