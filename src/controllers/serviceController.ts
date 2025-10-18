import { Request, Response } from 'express';
import { Service } from '../models/Service';
import { validationResult } from 'express-validator';

// Crear nuevo servicio
export const createService = async (req: Request, res: Response): Promise<void> => {
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

    const { nombre, descripcion, precio, tipo } = req.body;

    // Verificar si ya existe un servicio con el mismo nombre
    const existingService = await Service.findOne({ nombre });
    if (existingService) {
      res.status(409).json({
        success: false,
        message: 'Ya existe un servicio con ese nombre'
      });
      return;
    }

    // Crear nuevo servicio
    const newService = new Service({
      nombre,
      descripcion,
      precio,
      tipo
    });

    const savedService = await newService.save();

    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: savedService
    });

  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Listar todos los servicios
export const getServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo, page = 1, limit = 10 } = req.query;
    
    // Construir filtro
    const filter: any = {};
    if (tipo) {
      filter.tipo = tipo;
    }

    // Calcular paginación
    const skip = (Number(page) - 1) * Number(limit);

    // Obtener servicios con paginación
    const services = await Service.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Contar total de servicios
    const total = await Service.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: 'Servicios obtenidos exitosamente',
      data: {
        services,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalServices: total,
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener servicio por ID
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Servicio obtenido exitosamente',
      data: service
    });

  } catch (error) {
    console.error('Error obteniendo servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar servicio
export const updateService = async (req: Request, res: Response): Promise<void> => {
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
    const { nombre, descripcion, precio, tipo } = req.body;

    // Verificar si el servicio existe
    const existingService = await Service.findById(id);
    if (!existingService) {
      res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
      return;
    }

    // Verificar si ya existe otro servicio con el mismo nombre
    if (nombre && nombre !== existingService.nombre) {
      const duplicateService = await Service.findOne({ 
        nombre, 
        _id: { $ne: id } 
      });
      if (duplicateService) {
        res.status(409).json({
          success: false,
          message: 'Ya existe otro servicio con ese nombre'
        });
        return;
      }
    }

    // Actualizar servicio
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { nombre, descripcion, precio, tipo },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: updatedService
    });

  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar servicio
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar si el servicio existe
    const service = await Service.findById(id);
    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
      return;
    }

    // Verificar si el servicio está siendo usado en algún contrato
    const { Contract } = await import('../models/Contract');
    const contractsUsingService = await Contract.find({ servicios_ids: id });
    
    if (contractsUsingService.length > 0) {
      res.status(409).json({
        success: false,
        message: 'No se puede eliminar el servicio porque está siendo usado en contratos activos',
        data: {
          contractsCount: contractsUsingService.length
        }
      });
      return;
    }

    // Eliminar servicio
    await Service.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};