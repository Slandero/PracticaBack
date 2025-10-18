import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { 
  createContract, 
  getContracts, 
  getContractById, 
  updateContract, 
  deleteContract,
  getContractStats
} from '../controllers/ContractController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Validaciones para crear/actualizar contrato
const contractValidation = [
  body('numeroContrato')
    .notEmpty()
    .withMessage('El número de contrato es obligatorio')
    .isLength({ min: 3, max: 20 })
    .withMessage('El número de contrato debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El número de contrato solo puede contener letras mayúsculas, números y guiones')
    .trim()
    .toUpperCase(),
  
  body('fechaInicio')
    .notEmpty()
    .withMessage('La fecha de inicio es obligatoria')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('La fecha de inicio no puede ser anterior a hoy');
      }
      return true;
    }),
  
  body('fechaFin')
    .notEmpty()
    .withMessage('La fecha de fin es obligatoria')
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      const fechaFin = new Date(value);
      const fechaInicio = new Date(req.body.fechaInicio);
      if (fechaFin <= fechaInicio) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo', 'Suspendido', 'Cancelado'])
    .withMessage('El estado debe ser: Activo, Inactivo, Suspendido o Cancelado'),
  
  body('servicios_ids')
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un servicio')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('servicios_ids debe ser un array');
      }
      if (value.length === 0) {
        throw new Error('Debe seleccionar al menos un servicio');
      }
      // Verificar que todos los elementos son ObjectIds válidos
      const mongoose = require('mongoose');
      for (const id of value) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error('Uno o más IDs de servicios no son válidos');
        }
      }
      return true;
    })
];

// Validaciones para actualizar contrato (más flexibles)
const updateContractValidation = [
  body('numeroContrato')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('El número de contrato debe tener entre 3 y 20 caracteres')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('El número de contrato solo puede contener letras mayúsculas, números y guiones')
    .trim()
    .toUpperCase(),
  
  body('fechaInicio')
    .optional()
    .isISO8601()
    .withMessage('La fecha de inicio debe ser una fecha válida'),
  
  body('fechaFin')
    .optional()
    .isISO8601()
    .withMessage('La fecha de fin debe ser una fecha válida')
    .custom((value, { req }) => {
      if (value && req.body.fechaInicio) {
        const fechaFin = new Date(value);
        const fechaInicio = new Date(req.body.fechaInicio);
        if (fechaFin <= fechaInicio) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }
      return true;
    }),
  
  body('estado')
    .optional()
    .isIn(['Activo', 'Inactivo', 'Suspendido', 'Cancelado'])
    .withMessage('El estado debe ser: Activo, Inactivo, Suspendido o Cancelado'),
  
  body('servicios_ids')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Debe seleccionar al menos un servicio')
    .custom((value) => {
      if (value && !Array.isArray(value)) {
        throw new Error('servicios_ids debe ser un array');
      }
      if (value && value.length === 0) {
        throw new Error('Debe seleccionar al menos un servicio');
      }
      if (value) {
        // Verificar que todos los elementos son ObjectIds válidos
        const mongoose = require('mongoose');
        for (const id of value) {
          if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Uno o más IDs de servicios no son válidos');
          }
        }
      }
      return true;
    })
];

// Validaciones para parámetros
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('ID de contrato inválido')
];

// Validaciones para query parameters
const queryValidation = [
  query('estado')
    .optional()
    .isIn(['Activo', 'Inactivo', 'Suspendido', 'Cancelado'])
    .withMessage('El estado debe ser: Activo, Inactivo, Suspendido o Cancelado'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe ser un número entero entre 1 y 100')
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD
router.post('/', contractValidation, createContract);
router.get('/', queryValidation, getContracts);
router.get('/stats', getContractStats);
router.get('/:id', idValidation, getContractById);
router.put('/:id', [...idValidation, ...updateContractValidation], updateContract);
router.delete('/:id', idValidation, deleteContract);

export default router;

