import mongoose, { Document, Schema } from 'mongoose';

// Interfaz para el documento Servicio
export interface IService extends Document {
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: 'Internet' | 'Televisión';
  createdAt: Date;
  updatedAt: Date;
}

// Esquema del Servicio
const serviceSchema = new Schema<IService>({
  nombre: {
    type: String,
    required: [true, 'El nombre del servicio es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  tipo: {
    type: String,
    required: [true, 'El tipo de servicio es obligatorio'],
    enum: {
      values: ['Internet', 'Televisión'],
      message: 'El tipo debe ser Internet o Televisión'
    }
  }
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Crear y exportar el modelo
export const Service = mongoose.model<IService>('Service', serviceSchema);