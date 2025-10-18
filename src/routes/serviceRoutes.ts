import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createService, 
  getServices, 
  getServiceById, 
  updateService, 
  deleteService 
} from '../controllers/serviceController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Validaciones para crear/actualizar servicio
const serviceValidation = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres')
    .trim(),
  
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es obligatoria')
    .isLength({ min: 10, max: 500 })
    .withMessage('La descripción debe tener entre 10 y 500 caracteres')
    .trim(),
  
  body('precio')
    .isNumeric()
    .withMessage('El precio debe ser un número')
    .isFloat({ min: 0 })
    .withMessage('El precio no puede ser negativo'),
  
  body('tipo')
    .isIn(['Internet', 'Televisión'])
    .withMessage('El tipo debe ser Internet o Televisión')
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas CRUD
router.post('/', serviceValidation, createService);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.put('/:id', serviceValidation, updateService);
router.delete('/:id', deleteService);

export default router;