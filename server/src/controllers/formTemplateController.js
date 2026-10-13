const CustomFormTemplate = require('../models/CustomFormTemplate');
const User = require('../models/User');
const { Op } = require('sequelize');

module.exports = {
  // Obtener todas las plantillas disponibles para el usuario autenticado
  getTemplates: async (req, res) => {
    try {
      const user = req.user;
      const { targetModule, category } = req.query;

      const whereConditions = [];

      // Filtro por módulo (CONSULTATION, STUDY, o ALL)
      if (targetModule && targetModule !== 'ALL') {
        whereConditions.push({
          targetModule: {
            [Op.in]: [targetModule, 'ALL']
          }
        });
      }

      // Filtro por categoría
      if (category && category !== 'Todas') {
        whereConditions.push({ category });
      }

      // Visibilidad: Master y Administradores ven todas; Médicos ven las suyas + las globales
      const isMasterOrAdmin = ['MASTER', 'ADMINISTRADOR'].includes((user.role || '').toUpperCase());
      if (!isMasterOrAdmin) {
        whereConditions.push({
          [Op.or]: [
            { doctorId: user.id },
            { isGlobal: true }
          ]
        });
      }

      const templates = await CustomFormTemplate.findAll({
        where: whereConditions.length > 0 ? { [Op.and]: whereConditions } : {},
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'username', 'role', 'specialty']
          }
        ],
        order: [['id', 'DESC']]
      });

      return res.json(templates);
    } catch (error) {
      console.error('Error al obtener plantillas personalizadas:', error);
      return res.status(500).json({ error: 'Error al obtener plantillas de formulario', details: error.message });
    }
  },

  // Obtener una plantilla específica
  getTemplateById: async (req, res) => {
    try {
      const { id } = req.params;
      const template = await CustomFormTemplate.findByPk(id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'username', 'role', 'specialty']
          }
        ]
      });

      if (!template) {
        return res.status(404).json({ error: 'Plantilla no encontrada' });
      }

      return res.json(template);
    } catch (error) {
      console.error('Error al obtener plantilla:', error);
      return res.status(500).json({ error: 'Error al obtener plantilla', details: error.message });
    }
  },

  // Crear una nueva plantilla personalizada
  createTemplate: async (req, res) => {
    try {
      const { title, category, targetModule, description, fields, isGlobal } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'El título de la plantilla es obligatorio.' });
      }

      if (!Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({ error: 'La plantilla debe contener al menos un campo.' });
      }

      // Sanitizar campos
      const sanitizedFields = fields.map((f, index) => ({
        id: f.id || `campo_${Date.now()}_${index}`,
        label: f.label || `Campo ${index + 1}`,
        type: f.type || 'text', // 'text', 'textarea', 'number', 'select', 'checkbox', 'radio', 'date', 'time'
        placeholder: f.placeholder || '',
        required: Boolean(f.required),
        options: Array.isArray(f.options) ? f.options.filter(opt => typeof opt === 'string' && opt.trim() !== '') : [],
        defaultValue: f.defaultValue !== undefined ? f.defaultValue : '',
        width: f.width || 'full', // 'full', 'half', 'third'
        section: f.section || ''
      }));

      const isMasterOrAdmin = ['MASTER', 'ADMINISTRADOR'].includes((req.user.role || '').toUpperCase());

      const template = await CustomFormTemplate.create({
        doctorId: req.user.id,
        title: title.trim(),
        category: category || 'General',
        targetModule: targetModule || 'ALL',
        description: description || '',
        fields: sanitizedFields,
        isGlobal: isMasterOrAdmin ? Boolean(isGlobal) : false
      });

      const fullTemplate = await CustomFormTemplate.findByPk(template.id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'username', 'role', 'specialty']
          }
        ]
      });

      return res.status(201).json({ message: 'Plantilla creada exitosamente', template: fullTemplate });
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      return res.status(500).json({ error: 'Error al crear la plantilla', details: error.message });
    }
  },

  // Actualizar plantilla
  updateTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, targetModule, description, fields, isGlobal } = req.body;

      const template = await CustomFormTemplate.findByPk(id);
      if (!template) {
        return res.status(404).json({ error: 'Plantilla no encontrada' });
      }

      const isMasterOrAdmin = ['MASTER', 'ADMINISTRADOR'].includes((req.user.role || '').toUpperCase());
      if (template.doctorId !== req.user.id && !isMasterOrAdmin) {
        return res.status(403).json({ error: 'No tienes permiso para modificar esta plantilla.' });
      }

      if (title) template.title = title.trim();
      if (category !== undefined) template.category = category;
      if (targetModule !== undefined) template.targetModule = targetModule;
      if (description !== undefined) template.description = description;
      if (Array.isArray(fields)) {
        template.fields = fields.map((f, index) => ({
          id: f.id || `campo_${Date.now()}_${index}`,
          label: f.label || `Campo ${index + 1}`,
          type: f.type || 'text',
          placeholder: f.placeholder || '',
          required: Boolean(f.required),
          options: Array.isArray(f.options) ? f.options.filter(opt => typeof opt === 'string' && opt.trim() !== '') : [],
          defaultValue: f.defaultValue !== undefined ? f.defaultValue : '',
          width: f.width || 'full',
          section: f.section || ''
        }));
      }
      if (isMasterOrAdmin && isGlobal !== undefined) {
        template.isGlobal = Boolean(isGlobal);
      }

      await template.save();

      const updatedTemplate = await CustomFormTemplate.findByPk(id, {
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'username', 'role', 'specialty']
          }
        ]
      });

      return res.json({ message: 'Plantilla actualizada exitosamente', template: updatedTemplate });
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      return res.status(500).json({ error: 'Error al actualizar plantilla', details: error.message });
    }
  },

  // Eliminar plantilla
  deleteTemplate: async (req, res) => {
    try {
      const { id } = req.params;
      const template = await CustomFormTemplate.findByPk(id);
      if (!template) {
        return res.status(404).json({ error: 'Plantilla no encontrada' });
      }

      const isMasterOrAdmin = ['MASTER', 'ADMINISTRADOR'].includes((req.user.role || '').toUpperCase());
      if (template.doctorId !== req.user.id && !isMasterOrAdmin) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar esta plantilla.' });
      }

      await template.destroy();
      return res.json({ message: 'Plantilla eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      return res.status(500).json({ error: 'Error al eliminar la plantilla', details: error.message });
    }
  }
};
