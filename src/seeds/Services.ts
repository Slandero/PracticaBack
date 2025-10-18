import mongoose from 'mongoose';
import { Service } from '../models/Service';
import { connectDB } from '../config/database';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Datos de servicios predefinidos
const servicesData = [
  // Servicios de Internet
  {
    nombre: 'Internet Básico 50MB',
    descripcion: 'Plan de internet básico con velocidad de 50 Mbps, ideal para navegación y uso básico',
    precio: 45000,
    tipo: 'Internet'
  },
  {
    nombre: 'Internet Estándar 100MB',
    descripcion: 'Plan de internet estándar con velocidad de 100 Mbps, perfecto para streaming y trabajo remoto',
    precio: 65000,
    tipo: 'Internet'
  },
  {
    nombre: 'Internet Premium 200MB',
    descripcion: 'Plan de internet premium con velocidad de 200 Mbps, ideal para múltiples dispositivos y gaming',
    precio: 85000,
    tipo: 'Internet'
  },
  {
    nombre: 'Internet Ultra 500MB',
    descripcion: 'Plan de internet ultra con velocidad de 500 Mbps, para usuarios exigentes y empresas',
    precio: 120000,
    tipo: 'Internet'
  },
  
  // Servicios de Televisión
  {
    nombre: 'TV Básica',
    descripcion: 'Paquete básico de televisión con 50 canales nacionales e internacionales',
    precio: 35000,
    tipo: 'Televisión'
  },
  {
    nombre: 'TV Estándar',
    descripcion: 'Paquete estándar de televisión con 100 canales incluyendo deportes y películas',
    precio: 55000,
    tipo: 'Televisión'
  },
  {
    nombre: 'TV Premium',
    descripcion: 'Paquete premium de televisión con 150 canales, HD y contenido exclusivo',
    precio: 75000,
    tipo: 'Televisión'
  },
  {
    nombre: 'TV Ultra + HBO',
    descripcion: 'Paquete ultra de televisión con 200 canales, HD, 4K y HBO incluido',
    precio: 95000,
    tipo: 'Televisión'
  }
];

// Función para poblar la base de datos
export const seedServices = async (): Promise<void> => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Limpiar servicios existentes (opcional)
    await Service.deleteMany({});
    console.log('🧹 Servicios existentes eliminados');

    // Insertar servicios
    const createdServices = await Service.insertMany(servicesData);
    console.log(`✅ ${createdServices.length} servicios creados exitosamente`);

    // Mostrar resumen
    const internetServices = createdServices.filter(s => s.tipo === 'Internet');
    const tvServices = createdServices.filter(s => s.tipo === 'Televisión');
    
    console.log('\n Resumen de servicios creados:');
    console.log(` Servicios de Internet: ${internetServices.length}`);
    console.log(` Servicios de Televisión: ${tvServices.length}`);
    console.log(` Precio promedio: $${Math.round(createdServices.reduce((sum, s) => sum + s.precio, 0) / createdServices.length).toLocaleString()}`);

  } catch (error) {
    console.error(' Error poblando servicios:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔒 Conexión a la base de datos cerrada');
    process.exit(0);
  }
};

// Ejecutar seed si se llama directamente
if (require.main === module) {
  seedServices();
}