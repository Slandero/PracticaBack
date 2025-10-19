import mongoose from 'mongoose';
import { config } from './environment';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log(` MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(' Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Manejar eventos de conexión
mongoose.connection.on('connected', () => {
  console.log(' Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose desconectado de MongoDB');
});

// Cerrar conexión cuando la aplicación se cierre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(' Conexión a MongoDB cerrada por terminación de la aplicación');
  process.exit(0);
});