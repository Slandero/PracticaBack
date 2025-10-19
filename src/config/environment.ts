import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Interfaz para las variables de entorno
interface EnvironmentConfig {
  // Base de datos
  MONGO_URI: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  
  // Servidor
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // JWT
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  
  // CORS
  FRONTEND_URL: string;
  
  // Aplicación
  APP_NAME: string;
  APP_VERSION: string;
  APP_DESCRIPTION: string;
  
  // Seguridad
  BCRYPT_ROUNDS: number;
  SESSION_SECRET: string;
  
  // Logs
  LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
  LOG_FILE: string;
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  
  // Archivos
  MAX_FILE_SIZE: number;
  UPLOAD_PATH: string;
  
  // Redis
  REDIS_URL: string;
  
  // Monitoreo
  ENABLE_METRICS: boolean;
  METRICS_PORT: number;
}

// Función para validar y obtener variables de entorno
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Variable de entorno requerida: ${key}`);
  }
  return value;
};

const getEnvNumber = (key: string, defaultValue?: number): number => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Variable de entorno requerida: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
};

const getEnvBoolean = (key: string, defaultValue?: boolean): boolean => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Variable de entorno requerida: ${key}`);
  }
  return value ? value.toLowerCase() === 'true' : defaultValue!;
};

// Configuración de variables de entorno
export const config: EnvironmentConfig = {
  // Base de datos
  MONGO_URI: getEnvVar('MONGO_URI', 'mongodb://localhost:27017/telecom-plus'),
  DB_NAME: getEnvVar('DB_NAME', 'telecom-plus'),
  DB_HOST: getEnvVar('DB_HOST', 'localhost'),
  DB_PORT: getEnvNumber('DB_PORT', 27017),
  
  // Servidor
  PORT: getEnvNumber('PORT', 3000),
  NODE_ENV: (getEnvVar('NODE_ENV', 'development') as 'development' | 'production' | 'test'),
  
  // JWT
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  
  // CORS
  FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
  
  // Aplicación
  APP_NAME: getEnvVar('APP_NAME', 'Telecom Plus S.A.S.'),
  APP_VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  APP_DESCRIPTION: getEnvVar('APP_DESCRIPTION', 'Sistema de gestión de contratos y servicios de telecomunicaciones'),
  
  // Seguridad
  BCRYPT_ROUNDS: getEnvNumber('BCRYPT_ROUNDS', 12),
  SESSION_SECRET: getEnvVar('SESSION_SECRET'),
  
  // Logs
  LOG_LEVEL: (getEnvVar('LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug'),
  LOG_FILE: getEnvVar('LOG_FILE', 'logs/app.log'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: getEnvNumber('RATE_LIMIT_WINDOW_MS', 900000), // 15 minutos
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  
  // Archivos
  MAX_FILE_SIZE: getEnvNumber('MAX_FILE_SIZE', 10485760), // 10MB
  UPLOAD_PATH: getEnvVar('UPLOAD_PATH', 'uploads/'),
  
  // Redis
  REDIS_URL: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  
  // Monitoreo
  ENABLE_METRICS: getEnvBoolean('ENABLE_METRICS', true),
  METRICS_PORT: getEnvNumber('METRICS_PORT', 9090)
};

// Función para validar la configuración
export const validateConfig = (): void => {
  const requiredVars = ['JWT_SECRET', 'SESSION_SECRET'];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Variable de entorno requerida no encontrada: ${varName}`);
    }
  }
  
  // Validar que JWT_SECRET tenga al menos 32 caracteres
  if (config.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  
  // Validar que SESSION_SECRET tenga al menos 32 caracteres
  if (config.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET debe tener al menos 32 caracteres');
  }
  
  // Validar puerto
  if (config.PORT < 1 || config.PORT > 65535) {
    throw new Error('PORT debe estar entre 1 y 65535');
  }
  
  // Validar entorno
  if (!['development', 'production', 'test'].includes(config.NODE_ENV)) {
    throw new Error('NODE_ENV debe ser development, production o test');
  }
};

// Función para mostrar la configuración (sin secrets)
export const getConfigSummary = (): Partial<EnvironmentConfig> => {
  return {
    MONGO_URI: config.MONGO_URI,
    DB_NAME: config.DB_NAME,
    DB_HOST: config.DB_HOST,
    DB_PORT: config.DB_PORT,
    PORT: config.PORT,
    NODE_ENV: config.NODE_ENV,
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN,
    FRONTEND_URL: config.FRONTEND_URL,
    APP_NAME: config.APP_NAME,
    APP_VERSION: config.APP_VERSION,
    APP_DESCRIPTION: config.APP_DESCRIPTION,
    BCRYPT_ROUNDS: config.BCRYPT_ROUNDS,
    LOG_LEVEL: config.LOG_LEVEL,
    LOG_FILE: config.LOG_FILE,
    RATE_LIMIT_WINDOW_MS: config.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: config.RATE_LIMIT_MAX_REQUESTS,
    MAX_FILE_SIZE: config.MAX_FILE_SIZE,
    UPLOAD_PATH: config.UPLOAD_PATH,
    REDIS_URL: config.REDIS_URL,
    ENABLE_METRICS: config.ENABLE_METRICS,
    METRICS_PORT: config.METRICS_PORT
  };
};

// Validar configuración al cargar el módulo
try {
  validateConfig();
  console.log('Configuración de variables de entorno validada correctamente');
} catch (error) {
  console.error('Error en la configuración de variables de entorno:', error);
  process.exit(1);
}

export default config;

