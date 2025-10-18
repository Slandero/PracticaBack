# API Endpoints - Contratos

## Autenticación Requerida
Todos los endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <tu_jwt_token>
```

## Endpoints Disponibles

### 1. Crear Contrato
**POST** `/api/contracts`

**Body:**
```json
{
  "numeroContrato": "CONT-2024-001",
  "fechaInicio": "2024-01-01T00:00:00.000Z",
  "fechaFin": "2024-12-31T23:59:59.999Z",
  "estado": "Activo",
  "servicios_ids": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Contrato creado exitosamente",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "numeroContrato": "CONT-2024-001",
    "fechaInicio": "2024-01-01T00:00:00.000Z",
    "fechaFin": "2024-12-31T23:59:59.999Z",
    "estado": "Activo",
    "usuario_id": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j4",
      "nombre": "Juan Pérez",
      "email": "juan@example.com"
    },
    "servicios_ids": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "nombre": "Internet Básico 50MB",
        "descripcion": "Plan de internet básico...",
        "precio": 45000,
        "tipo": "Internet"
      }
    ],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 2. Listar Contratos
**GET** `/api/contracts`

**Query Parameters:**
- `estado` (opcional): Filtrar por estado (Activo, Inactivo, Suspendido, Cancelado)
- `page` (opcional): Número de página (por defecto 1)
- `limit` (opcional): Elementos por página (por defecto 10, máximo 100)

**Ejemplo:** `/api/contracts?estado=Activo&page=1&limit=5`

**Respuesta:**
```json
{
  "success": true,
  "message": "Contratos obtenidos exitosamente",
  "data": {
    "contracts": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalContracts": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 3. Obtener Contrato por ID
**GET** `/api/contracts/:id`

**Respuesta:**
```json
{
  "success": true,
  "message": "Contrato obtenido exitosamente",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
    "numeroContrato": "CONT-2024-001",
    "fechaInicio": "2024-01-01T00:00:00.000Z",
    "fechaFin": "2024-12-31T23:59:59.999Z",
    "estado": "Activo",
    "usuario_id": {...},
    "servicios_ids": [...],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### 4. Actualizar Contrato
**PUT** `/api/contracts/:id`

**Body:** (todos los campos son opcionales)
```json
{
  "numeroContrato": "CONT-2024-001-UPDATED",
  "fechaInicio": "2024-02-01T00:00:00.000Z",
  "fechaFin": "2024-12-31T23:59:59.999Z",
  "estado": "Suspendido",
  "servicios_ids": ["64f1a2b3c4d5e6f7g8h9i0j1"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Contrato actualizado exitosamente",
  "data": {
    // Contrato actualizado con datos poblados
  }
}
```

### 5. Eliminar Contrato
**DELETE** `/api/contracts/:id`

**Respuesta:**
```json
{
  "success": true,
  "message": "Contrato eliminado exitosamente"
}
```

### 6. Obtener Estadísticas de Contratos
**GET** `/api/contracts/stats`

**Respuesta:**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "totalContracts": 25,
    "contractsByStatus": [
      { "_id": "Activo", "count": 20 },
      { "_id": "Inactivo", "count": 3 },
      { "_id": "Suspendido", "count": 2 }
    ],
    "contractsByServiceType": [
      { "_id": "Internet", "count": 15 },
      { "_id": "Televisión", "count": 10 }
    ]
  }
}
```

## Códigos de Error

- **400**: Datos de entrada inválidos
- **401**: No autenticado
- **404**: Contrato no encontrado
- **409**: Conflicto (número de contrato duplicado)
- **500**: Error interno del servidor

## Validaciones

### Número de Contrato
- Obligatorio
- 3-20 caracteres
- Solo letras mayúsculas, números y guiones
- Único en el sistema

### Fechas
- Fecha de inicio: No puede ser anterior a hoy
- Fecha de fin: Debe ser posterior a la fecha de inicio
- Formato ISO 8601

### Estado
- Valores permitidos: Activo, Inactivo, Suspendido, Cancelado
- Por defecto: Activo

### Servicios
- Mínimo 1 servicio
- Todos los IDs deben ser válidos
- Los servicios deben existir en la base de datos

