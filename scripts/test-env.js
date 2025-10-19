#!/usr/bin/env node

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

try {
  // Importar la configuración
  const { config, getConfigSummary } = require('../src/config/environment');
  
  console.log(`${colors.green} Variables de entorno cargadas correctamente${colors.reset}\n`);
  
  // Mostrar resumen de configuración
  const summary = getConfigSummary();
  
  console.log(`${colors.blue} RESUMEN DE CONFIGURACIÓN:${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  
  Object.entries(summary).forEach(([key, value]) => {
    const displayValue = typeof value === 'string' && value.length > 50 
      ? value.substring(0, 47) + '...' 
      : value;
    console.log(`${colors.cyan}${key.padEnd(25)}${colors.reset}: ${colors.yellow}${displayValue}${colors.reset}`);
  });
  
  console.log(`\n${colors.green} Todas las validaciones pasaron correctamente${colors.reset}`);
  console.log(`${colors.green} El servidor está listo para iniciar${colors.reset}\n`);
  
  // Verificar archivos importantes
  const fs = require('fs');
  const path = require('path');
  
  console.log(`${colors.blue}VERIFICACIÓN DE ARCHIVOS:${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(50)}${colors.reset}`);
  
  const filesToCheck = [
    '.env',
    'src/config/environment.ts',
    'src/config/database.ts',
    'src/index.ts'
  ];
  
  filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`${colors.green}${colors.reset} ${file}`);
    } else {
      console.log(`${colors.red}${colors.reset} ${file} ${colors.red}(no encontrado)${colors.reset}`);
    }
  });

  
} catch (error) {
  console.error(`${colors.red}Error cargando variables de entorno:${colors.reset}`);
  console.error(`${colors.red}${error.message}${colors.reset}\n`);
  process.exit(1);
}

