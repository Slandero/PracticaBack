import mongoose, { Document, Schema, Types } from 'mongoose';

// Interfaz para el documento Contrato
export interface IContract extends Document {
  numeroContrato: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'Activo' | 'Inactivo' | 'Suspendido' | 'Cancelado';
  usuario_id: Types.ObjectId;
  servicios_ids: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Esquema del Contrato
const contractSchema = new Schema<IContract>({
  numeroContrato: {
    type: String,
    required: [true, 'El número de contrato es obligatorio'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'El número de contrato solo puede contener letras, números y guiones']
  },
  fechaInicio: {
    type: Date,
    required: [true, 'La fecha de inicio es obligatoria'],
    default: Date.now
  },
  fechaFin: {
    type: Date,
    required: [true, 'La fecha de fin es obligatoria'],
    validate: {
      validator: function(this: IContract, value: Date) {
        return value > this.fechaInicio;
      },
      message: 'La fecha de fin debe ser posterior a la fecha de inicio'
    }
  },
  estado: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: {
      values: ['Activo', 'Inactivo', 'Suspendido', 'Cancelado'],
      message: 'El estado debe ser: Activo, Inactivo, Suspendido o Cancelado'
    },
    default: 'Activo'
  },
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El ID del usuario es obligatorio']
  },
  servicios_ids: [{
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Al menos un servicio es obligatorio']
  }]
}, {
  timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Índices para mejorar el rendimiento
contractSchema.index({ usuario_id: 1 });
contractSchema.index({ numeroContrato: 1 });
contractSchema.index({ estado: 1 });

// Middleware para validar que el contrato tenga al menos un servicio
contractSchema.pre('save', function(next) {
  if (this.servicios_ids.length === 0) {
    next(new Error('El contrato debe tener al menos un servicio'));
  } else {
    next();
  }
});

// Crear y exportar el modelo
export const Contract = mongoose.model<IContract>('Contract', contractSchema);