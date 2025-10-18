<!-- 296df9aa-82cc-4876-b540-a12346e3b20e f1d215cc-fcce-424f-ba37-1b7abf8e529a -->
# Plan: Sistema Telecom Plus S.A.S.

## Estructura del Proyecto

Crear dos proyectos separados:

- `backend/` - API REST con Express + TypeScript + MongoDB
- `frontend/` - Aplicación Next.js

## Fase 1: Configuración Backend

### 1.1 Inicializar proyecto backend

- Crear carpeta `backend/`
- Inicializar proyecto Node.js con TypeScript
- Instalar dependencias: `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`, `express-validator`
- Instalar tipos: `@types/node`, `@types/express`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/cors`
- Configurar `tsconfig.json` para compilación TypeScript
- Crear estructura de carpetas: `src/models`, `src/controllers`, `src/routes`, `src/middlewares`, `src/config`

### 1.2 Configurar MongoDB

- Crear archivo `src/config/database.ts` para conexión a MongoDB
- Configurar variables de entorno en `.env` (MONGO_URI, JWT_SECRET, PORT)

### 1.3 Crear Modelos (Mongoose Schemas)

- **Usuario** (`src/models/User.ts`): nombre, email, password (hasheado), timestamps
- **Contrato** (`src/models/Contract.ts`): número de contrato, fecha inicio, fecha fin, estado, usuario_id (ref), servicios_ids (array de refs), timestamps
- **Servicio** (`src/models/Service.ts`): nombre, descripción, precio, tipo (Internet/Televisión), timestamps

### 1.4 Implementar Autenticación

- Crear middleware de autenticación JWT (`src/middlewares/auth.ts`)
- Crear controlador de autenticación (`src/controllers/authController.ts`):
- `register`: Registrar usuario (hashear password con bcrypt)
- `login`: Validar credenciales y generar JWT
- Crear rutas de autenticación (`src/routes/authRoutes.ts`)

### 1.5 Implementar CRUD de Contratos

- Crear controlador (`src/controllers/contractController.ts`):
- `createContract`: Crear contrato asociado al usuario autenticado
- `getContracts`: Listar contratos del usuario autenticado
- `getContractById`: Obtener detalle de un contrato específico
- `updateContract`: Actualizar contrato
- `deleteContract`: Eliminar contrato
- Crear rutas protegidas con middleware JWT (`src/routes/contractRoutes.ts`)

### 1.6 Implementar CRUD de Servicios

- Crear controlador (`src/controllers/serviceController.ts`):
- `createService`: Crear nuevo servicio (Internet o Televisión)
- `getServices`: Listar todos los servicios disponibles
- `getServiceById`: Obtener detalle de un servicio específico
- `updateService`: Actualizar servicio existente
- `deleteService`: Eliminar servicio
- Crear script seed opcional (`src/seeds/services.ts`) para popular servicios de ejemplo inicial
- Crear rutas protegidas con middleware JWT (`src/routes/serviceRoutes.ts`)

### 1.7 Configurar servidor Express

- Crear `src/index.ts`:
- Configurar Express con middlewares (cors, json)
- Conectar a MongoDB
- Registrar rutas (`/api/auth`, `/api/contracts`, `/api/services`)
- Iniciar servidor

## Fase 2: Configuración Frontend

### 2.1 Inicializar proyecto Next.js

- Crear carpeta `frontend/`
- Inicializar Next.js con TypeScript y App Router
- Instalar dependencias: `axios`, `jwt-decode`
- Configurar Tailwind CSS para estilos

### 2.2 Configurar gestión de estado y API

- Crear servicio API (`lib/api.ts`) con axios configurado (baseURL, interceptores para JWT)
- Crear Context de autenticación (`context/AuthContext.tsx`) para manejar usuario y token

### 2.3 Implementar páginas de autenticación

- **Login** (`app/login/page.tsx`): Formulario de login, guardar JWT en localStorage
- **Registro** (`app/register/page.tsx`): Formulario de registro
- Crear componentes reutilizables para formularios

### 2.4 Implementar Dashboard

- **Dashboard principal** (`app/dashboard/page.tsx`): 
- Mostrar lista de contratos del usuario
- Botones para crear, editar y eliminar contratos
- Proteger ruta con middleware de autenticación

### 2.5 Implementar gestión de Contratos

- **Crear contrato** (`app/contracts/new/page.tsx`):
- Formulario con campos del contrato
- Selector múltiple de servicios disponibles
- **Editar contrato** (`app/contracts/[id]/edit/page.tsx`):
- Pre-cargar datos del contrato
- Permitir modificar campos y servicios
- **Ver detalle** (`app/contracts/[id]/page.tsx`):
- Mostrar información completa del contrato
- Mostrar servicios asociados con detalles

### 2.6 Implementar navegación y protección de rutas

- Crear middleware de Next.js (`middleware.ts`) para proteger rutas privadas
- Crear componente de navegación/header con logout
- Redirigir a login si no hay token válido

## Fase 3: Integración y Pruebas

### 3.1 Probar flujo completo

- Registrar usuario desde frontend
- Hacer login y verificar JWT
- Crear contratos con servicios
- Listar, editar y eliminar contratos
- Verificar relaciones jerárquicas Usuario → Contrato → Servicio

### 3.2 Validaciones

- Validar datos en backend con `express-validator`
- Validar formularios en frontend
- Manejo de errores (respuestas 401, 404, 500)

### 3.3 Documentación

- Crear README.md en backend con instrucciones de instalación y endpoints API
- Crear README.md en frontend con instrucciones de ejecución
- Documentar variables de entorno necesarias

## Archivos Clave

**Backend:**

- `backend/src/index.ts` - Servidor Express principal
- `backend/src/models/User.ts`, `Contract.ts`, `Service.ts` - Modelos Mongoose
- `backend/src/controllers/authController.ts` - Autenticación JWT
- `backend/src/controllers/contractController.ts` - CRUD de contratos
- `backend/src/middlewares/auth.ts` - Validación de JWT

**Frontend:**

- `frontend/app/login/page.tsx` - Página de login
- `frontend/app/dashboard/page.tsx` - Dashboard principal
- `frontend/app/contracts/` - Páginas de gestión de contratos
- `frontend/lib/api.ts` - Cliente API con axios
- `frontend/context/AuthContext.tsx` - Context de autenticación

### To-dos

- [ ] Configurar proyecto backend con Express, TypeScript y estructura de carpetas
- [ ] Crear modelos de MongoDB (Usuario, Contrato, Servicio) con Mongoose
- [ ] Implementar sistema de autenticación JWT (registro, login, middleware)
- [ ] Implementar CRUD completo de contratos con rutas protegidas
- [ ] Implementar API de servicios y crear seed de datos predefinidos
- [ ] Configurar proyecto Next.js con TypeScript, Tailwind CSS y cliente API
- [ ] Crear páginas de login y registro con Context de autenticación
- [ ] Implementar dashboard y páginas de gestión de contratos (crear, editar, listar, eliminar)
- [ ] Probar flujo completo de la aplicación y validaciones