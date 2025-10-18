import { Request, Response } from 'express';
import { Contract } from '../models/Contract';
import { Service } from '../models/Service';
import { User } from '../models/User';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Interfaz para el request con usuario autenticado
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    nombre: string;
  };
}

// Crear nuevo contrato
export const createContract = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
      return;
    }

    const { numeroContrato, fechaInicio, fechaFin, estado, servicios_ids } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar si ya existe un contrato con el mismo número
    const existingContract = await Contract.findOne({ numeroContrato });
    if (existingContract) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un contrato con ese número'
      });
      return;
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Verificar que todos los servicios existen
    const services = await Service.find({ _id: { $in: servicios_ids } });
    if (services.length !== servicios_ids.length) {
      res.status(400).json({
        success: false,
        message: 'Uno o más servicios no existen'
      });
      return;
    }

    // Crear nuevo contrato
    const newContract = new Contract({
      numeroContrato,
      fechaInicio: new Date(fechaInicio),
      fechaFin: new Date(fechaFin),
      estado: estado || 'Activo',
      usuario_id: userId,
      servicios_ids
    });

    const savedContract = await newContract.save();

    // Poblar los datos del contrato para la respuesta
    const populatedContract = await Contract.findById(savedContract._id)
      .populate('usuario_id', 'nombre email')
      .populate('servicios_ids', 'nombre descripcion precio tipo');

    res.status(201).json({
      success: true,
      message: 'Contrato creado exitosamente',
      data: populatedContract
    });

  } catch (error) {
    console.error('Error creando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Listar contratos del usuario autenticado
export const getContracts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { estado, page = 1, limit = 10 } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Construir filtro
    const filter: any = { usuario_id: userId };
    if (estado) {
      filter.estado = estado;
    }

    // Calcular paginación
    const skip = (Number(page) - 1) * Number(limit);

    // Obtener contratos con paginación y población
    const contracts = await Contract.find(filter)
      .populate('usuario_id', 'nombre email')
      .populate('servicios_ids', 'nombre descripcion precio tipo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Contar total de contratos
    const total = await Contract.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Contratos obtenidos exitosamente',
      data: {
        contracts,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalContracts: total,
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo contratos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener contrato por ID
export const getContractById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar que el ID es válido
    
    if (!mongoose.Types.ObjectId.isValid(id || '')) {
      res.status(400).json({
        success: false,
        message: 'ID de contrato inválido'
      });
      return;
    }

    const contract = await Contract.findOne({ _id: id, usuario_id: userId })
      .populate('usuario_id', 'nombre email')
      .populate('servicios_ids', 'nombre descripcion precio tipo');
    
    if (!contract) {
      res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Contrato obtenido exitosamente',
      data: contract
    });

  } catch (error) {
    console.error('Error obteniendo contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar contrato
export const updateContract = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { numeroContrato, fechaInicio, fechaFin, estado, servicios_ids } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar que el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id || '')) {
      res.status(400).json({
        success: false,
        message: 'ID de contrato inválido'
      });
      return;
    }

    // Verificar que el contrato existe y pertenece al usuario
    const existingContract = await Contract.findOne({ _id: id, usuario_id: userId });
    if (!existingContract) {
      res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
      return;
    }

    // Verificar si ya existe otro contrato con el mismo número
    if (numeroContrato && numeroContrato !== existingContract.numeroContrato) {
      const duplicateContract = await Contract.findOne({ 
        numeroContrato, 
        _id: { $ne: id } 
      });
      if (duplicateContract) {
        res.status(409).json({
          success: false,
          message: 'Ya existe otro contrato con ese número'
        });
        return;
      }
    }

    // Verificar que todos los servicios existen (si se proporcionan)
    if (servicios_ids && servicios_ids.length > 0) {
      const services = await Service.find({ _id: { $in: servicios_ids } });
      if (services.length !== servicios_ids.length) {
        res.status(400).json({
          success: false,
          message: 'Uno o más servicios no existen'
        });
        return;
      }
    }

    // Preparar datos para actualización
    const updateData: any = {};
    if (numeroContrato) updateData.numeroContrato = numeroContrato;
    if (fechaInicio) updateData.fechaInicio = new Date(fechaInicio);
    if (fechaFin) updateData.fechaFin = new Date(fechaFin);
    if (estado) updateData.estado = estado;
    if (servicios_ids) updateData.servicios_ids = servicios_ids;

    // Actualizar contrato
    const updatedContract = await Contract.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('usuario_id', 'nombre email')
     .populate('servicios_ids', 'nombre descripcion precio tipo');

    res.status(200).json({
      success: true,
      message: 'Contrato actualizado exitosamente',
      data: updatedContract
    });

  } catch (error) {
    console.error('Error actualizando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar contrato
export const deleteContract = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Verificar que el ID es válido
    if (!mongoose.Types.ObjectId.isValid(id || '')) {
      res.status(400).json({
        success: false,
        message: 'ID de contrato inválido'
      });
      return;
    }

    // Verificar que el contrato existe y pertenece al usuario
    const contract = await Contract.findOne({ _id: id, usuario_id: userId });
    if (!contract) {
      res.status(404).json({
        success: false,
        message: 'Contrato no encontrado'
      });
      return;
    }

    // Eliminar contrato
    await Contract.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Contrato eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de contratos del usuario
export const getContractStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Obtener estadísticas agregadas
    const stats = await Contract.aggregate([
      { $match: { usuario_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$estado',
          count: { $sum: 1 }
        }
      }
    ]);

    // Obtener total de contratos
    const totalContracts = await Contract.countDocuments({ usuario_id: userId });

    // Obtener contratos por tipo de servicio
    const contractsByServiceType = await Contract.aggregate([
      { $match: { usuario_id: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$servicios_ids' },
      {
        $lookup: {
          from: 'services',
          localField: 'servicios_ids',
          foreignField: '_id',
          as: 'service'
        }
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$service.tipo',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        totalContracts,
        contractsByStatus: stats,
        contractsByServiceType
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};
