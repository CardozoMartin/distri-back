
import mongoose, { Document, Schema } from "mongoose";

export interface IMarca extends Document {
  name: string;
  logoImage?: string;
}

const MarcaSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  logoImage: { type: String },
});

export default mongoose.model<IMarca>('Marca', MarcaSchema);
