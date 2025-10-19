// Exportar todos los modelos desde un solo archivo
export { User, IUser } from './models/User';
export { Service, IService } from './models/Service';
export { Contract, IContract } from './models/Contract';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import { config, getConfigSummary } from './config/environment';

// Importar rutas
import authRoutes from './routes/authRoutes';
import contractRoutes from './routes/ContractRutes';
import serviceRoutes from './routes/serviceRoutes';

// Crear aplicación Express
const app = express();
const PORT = config.PORT;

// Middlewares globales
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: `${config.MAX_FILE_SIZE}mb` }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((_req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${_req.method} ${_req.path}`);
  next();
});

// Ruta de salud del servidor
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    config: getConfigSummary()
  });
});

// Ruta raíz
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: config.APP_NAME,
    version: config.APP_VERSION,
    description: config.APP_DESCRIPTION,
    endpoints: {
      auth: '/api/auth',
      contracts: '/api/contracts',
      services: '/api/services',
      health: '/health'
    }
  });
});

// Registrar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/services', serviceRoutes);

// Middleware global de manejo de errores
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env['NODE_ENV'] === 'development' && { stack: error.stack })
  });
});

// Función para iniciar el servidor
const startServer = async (): Promise<void> => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('Servidor iniciado exitosamente');
      console.log(`Puerto: ${PORT}`);
      console.log(`Entorno: ${config.NODE_ENV}`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
      console.log(`Métricas: ${config.ENABLE_METRICS ? `http://localhost:${config.METRICS_PORT}` : 'Deshabilitadas'}`);
      console.log('Endpoints disponibles:');
      console.log('POST /api/auth/register');
      console.log('POST /api/auth/login');
      console.log('GET  /api/contracts');
      console.log('POST /api/contracts');
      console.log('GET  /api/services');
      console.log('POST /api/services');
      console.log(`Logs: ${config.LOG_FILE}`);
    });
    
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Manejar cierre graceful del servidor
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
