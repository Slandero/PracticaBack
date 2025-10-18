#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para hacer preguntas
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

// Función para generar JWT secret seguro
const generateJWTSecret = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Configuración por defecto
const defaultConfig = {
  MONGO_URI: 'mongodb://localhost:27017/telecom-plus',
  PORT: '3000',
  NODE_ENV: 'development',
  JWT_SECRET: generateJWTSecret(),
  JWT_EXPIRES_IN: '7d',
  FRONTEND_URL: 'http://localhost:3001',
  APP_NAME: 'Telecom Plus S.A.S.',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Sistema de gestión de contratos y servicios de telecomunicaciones',
  DB_NAME: 'telecom-plus',
  DB_HOST: 'localhost',
  DB_PORT: '27017',
  LOG_LEVEL: 'info',
  LOG_FILE: 'logs/app.log',
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  BCRYPT_ROUNDS: '12',
  SESSION_SECRET: generateJWTSecret(),
  MAX_FILE_SIZE: '10485760',
  UPLOAD_PATH: 'uploads/',
  REDIS_URL: 'redis://localhost:6379',
  ENABLE_METRICS: 'true',
  METRICS_PORT: '9090'
};

async function setupEnvironment() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                CONFIGURACIÓN TELECOM PLUS S.A.S.            ║');
  console.log('║                    Variables de Entorno                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  console.log(`${colors.yellow}Este script te ayudará a configurar las variables de entorno.${colors.reset}`);
  console.log(`${colors.yellow}Presiona Enter para usar los valores por defecto.${colors.reset}\n`);

  const config = {};

  // Configuración de Base de Datos
  console.log(`${colors.blue}📊 CONFIGURACIÓN DE BASE DE DATOS${colors.reset}`);
  config.MONGO_URI = await question(`MongoDB URI (${defaultConfig.MONGO_URI}): `) || defaultConfig.MONGO_URI;
  config.DB_NAME = await question(`Nombre de la base de datos (${defaultConfig.DB_NAME}): `) || defaultConfig.DB_NAME;
  config.DB_HOST = await question(`Host de MongoDB (${defaultConfig.DB_HOST}): `) || defaultConfig.DB_HOST;
  config.DB_PORT = await question(`Puerto de MongoDB (${defaultConfig.DB_PORT}): `) || defaultConfig.DB_PORT;

  // Configuración del Servidor
  console.log(`\n${colors.blue}🚀 CONFIGURACIÓN DEL SERVIDOR${colors.reset}`);
  config.PORT = await question(`Puerto del servidor (${defaultConfig.PORT}): `) || defaultConfig.PORT;
  config.NODE_ENV = await question(`Entorno (${defaultConfig.NODE_ENV}): `) || defaultConfig.NODE_ENV;

  // Configuración de JWT
  console.log(`\n${colors.blue}🔐 CONFIGURACIÓN DE JWT${colors.reset}`);
  console.log(`${colors.green}JWT Secret generado automáticamente: ${config.JWT_SECRET || defaultConfig.JWT_SECRET}${colors.reset}`);
  config.JWT_SECRET = await question(`JWT Secret (presiona Enter para usar el generado): `) || defaultConfig.JWT_SECRET;
  config.JWT_EXPIRES_IN = await question(`Expiración del token (${defaultConfig.JWT_EXPIRES_IN}): `) || defaultConfig.JWT_EXPIRES_IN;

  // Configuración de CORS
  console.log(`\n${colors.blue}🌐 CONFIGURACIÓN DE CORS${colors.reset}`);
  config.FRONTEND_URL = await question(`URL del frontend (${defaultConfig.FRONTEND_URL}): `) || defaultConfig.FRONTEND_URL;

  // Configuración de la Aplicación
  console.log(`\n${colors.blue}📱 CONFIGURACIÓN DE LA APLICACIÓN${colors.reset}`);
  config.APP_NAME = await question(`Nombre de la aplicación (${defaultConfig.APP_NAME}): `) || defaultConfig.APP_NAME;
  config.APP_VERSION = await question(`Versión (${defaultConfig.APP_VERSION}): `) || defaultConfig.APP_VERSION;
  config.APP_DESCRIPTION = await question(`Descripción (${defaultConfig.APP_DESCRIPTION}): `) || defaultConfig.APP_DESCRIPTION;

  // Configuración de Seguridad
  console.log(`\n${colors.blue}🛡️ CONFIGURACIÓN DE SEGURIDAD${colors.reset}`);
  config.BCRYPT_ROUNDS = await question(`Rondas de bcrypt (${defaultConfig.BCRYPT_ROUNDS}): `) || defaultConfig.BCRYPT_ROUNDS;
  config.SESSION_SECRET = await question(`Session Secret (presiona Enter para usar el generado): `) || defaultConfig.SESSION_SECRET;

  // Configuración de Logs
  console.log(`\n${colors.blue}📝 CONFIGURACIÓN DE LOGS${colors.reset}`);
  config.LOG_LEVEL = await question(`Nivel de logs (${defaultConfig.LOG_LEVEL}): `) || defaultConfig.LOG_LEVEL;
  config.LOG_FILE = await question(`Archivo de logs (${defaultConfig.LOG_FILE}): `) || defaultConfig.LOG_FILE;

  // Configuración de Rate Limiting
  console.log(`\n${colors.blue}⏱️ CONFIGURACIÓN DE RATE LIMITING${colors.reset}`);
  config.RATE_LIMIT_WINDOW_MS = await question(`Ventana de tiempo en ms (${defaultConfig.RATE_LIMIT_WINDOW_MS}): `) || defaultConfig.RATE_LIMIT_WINDOW_MS;
  config.RATE_LIMIT_MAX_REQUESTS = await question(`Máximo de requests (${defaultConfig.RATE_LIMIT_MAX_REQUESTS}): `) || defaultConfig.RATE_LIMIT_MAX_REQUESTS;

  // Configuración de Archivos
  console.log(`\n${colors.blue}📁 CONFIGURACIÓN DE ARCHIVOS${colors.reset}`);
  config.MAX_FILE_SIZE = await question(`Tamaño máximo de archivo en bytes (${defaultConfig.MAX_FILE_SIZE}): `) || defaultConfig.MAX_FILE_SIZE;
  config.UPLOAD_PATH = await question(`Ruta de uploads (${defaultConfig.UPLOAD_PATH}): `) || defaultConfig.UPLOAD_PATH;

  // Configuración de Redis
  console.log(`\n${colors.blue}🔴 CONFIGURACIÓN DE REDIS${colors.reset}`);
  config.REDIS_URL = await question(`URL de Redis (${defaultConfig.REDIS_URL}): `) || defaultConfig.REDIS_URL;

  // Configuración de Monitoreo
  console.log(`\n${colors.blue}📊 CONFIGURACIÓN DE MONITOREO${colors.reset}`);
  config.ENABLE_METRICS = await question(`Habilitar métricas (${defaultConfig.ENABLE_METRICS}): `) || defaultConfig.ENABLE_METRICS;
  config.METRICS_PORT = await question(`Puerto de métricas (${defaultConfig.METRICS_PORT}): `) || defaultConfig.METRICS_PORT;

  // Generar archivo .env
  const envContent = `# ===========================================
# CONFIGURACIÓN TELECOM PLUS S.A.S.
# Generado automáticamente el ${new Date().toISOString()}
# ===========================================

# Configuración de la Base de Datos
MONGO_URI=${config.MONGO_URI}
DB_NAME=${config.DB_NAME}
DB_HOST=${config.DB_HOST}
DB_PORT=${config.DB_PORT}

# Configuración del Servidor
PORT=${config.PORT}
NODE_ENV=${config.NODE_ENV}

# Configuración de JWT
JWT_SECRET=${config.JWT_SECRET}
JWT_EXPIRES_IN=${config.JWT_EXPIRES_IN}

# Configuración de CORS
FRONTEND_URL=${config.FRONTEND_URL}

# Configuración de la Aplicación
APP_NAME=${config.APP_NAME}
APP_VERSION=${config.APP_VERSION}
APP_DESCRIPTION=${config.APP_DESCRIPTION}

# Configuración de Seguridad
BCRYPT_ROUNDS=${config.BCRYPT_ROUNDS}
SESSION_SECRET=${config.SESSION_SECRET}

# Configuración de Logs
LOG_LEVEL=${config.LOG_LEVEL}
LOG_FILE=${config.LOG_FILE}

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=${config.RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${config.RATE_LIMIT_MAX_REQUESTS}

# Configuración de Archivos
MAX_FILE_SIZE=${config.MAX_FILE_SIZE}
UPLOAD_PATH=${config.UPLOAD_PATH}

# Configuración de Redis
REDIS_URL=${config.REDIS_URL}

# Configuración de Monitoreo
ENABLE_METRICS=${config.ENABLE_METRICS}
METRICS_PORT=${config.METRICS_PORT}
`;

  // Escribir archivo .env
  const envPath = path.join(process.cwd(), '.env');
  fs.writeFileSync(envPath, envContent);

  console.log(`\n${colors.green}${colors.bright}✅ Archivo .env creado exitosamente!${colors.reset}`);
  console.log(`${colors.green}📁 Ubicación: ${envPath}${colors.reset}`);
  console.log(`\n${colors.yellow}⚠️  IMPORTANTE:${colors.reset}`);
  console.log(`${colors.yellow}   - El archivo .env ya está en .gitignore${colors.reset}`);
  console.log(`${colors.yellow}   - No subas este archivo al repositorio${colors.reset}`);
  console.log(`${colors.yellow}   - Cambia los secrets en producción${colors.reset}`);

  rl.close();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupEnvironment().catch(console.error);
}

module.exports = { setupEnvironment };

