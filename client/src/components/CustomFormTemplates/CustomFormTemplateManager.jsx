import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import DynamicFormRenderer from './DynamicFormRenderer';
import { 
  FileText, Plus, Trash2, Download, Upload, Eye, Check, X, 
  Sparkles, Layers, Sliders, Type, AlignLeft, Hash, ListFilter, 
  CheckSquare, Calendar, Globe, User, Edit3, ArrowLeft
} from 'lucide-react';
import './CustomFormTemplateManager.css';

export function CustomFormTemplateManager({
  isOpen,
  onClose,
  targetModule = 'ALL', // 'CONSULTATION', 'STUDY', 'ALL'
  onSelectTemplate = null
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'builder' | 'import'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Usuario autenticado
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = (currentUser.role || '').toUpperCase();
  const isMasterOrAdmin = ['MASTER', 'ADMINISTRADOR'].includes(userRole);

  // Estado del Constructor (Builder)
  const [editingId, setEditingId] = useState(null);
  const [formMeta, setFormMeta] = useState({
    title: '',
    category: 'General',
    targetModule: targetModule || 'ALL',
    description: '',
    isGlobal: false
  });
  const [formFields, setFormFields] = useState([]);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewValues, setPreviewValues] = useState({});

  // Estado de Importación
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, targetModule]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/form-templates', {
        params: { targetModule: targetModule === 'ALL' ? undefined : targetModule }
      });
      setTemplates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al cargar plantillas personalizadas:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetBuilder = () => {
    setEditingId(null);
    setFormMeta({
      title: '',
      category: 'General',
      targetModule: targetModule || 'ALL',
      description: '',
      isGlobal: false
    });
    setFormFields([
      {
        id: `campo_${Date.now()}_1`,
        label: 'Motivo Específico de Evaluación',
        type: 'text',
        placeholder: 'Ingrese el motivo detallado...',
        required: true,
        width: 'full',
        options: []
      }
    ]);
    setShowLivePreview(false);
    setPreviewValues({});
  };

  const handleStartNew = () => {
    resetBuilder();
    setActiveTab('builder');
  };

  const handleEdit = (tmpl) => {
    setEditingId(tmpl.id);
    setFormMeta({
      title: tmpl.title || '',
      category: tmpl.category || 'General',
      targetModule: tmpl.targetModule || 'ALL',
      description: tmpl.description || '',
      isGlobal: Boolean(tmpl.isGlobal)
    });
    setFormFields(Array.isArray(tmpl.fields) ? tmpl.fields : []);
    setShowLivePreview(false);
    setPreviewValues({});
    setActiveTab('builder');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta plantilla personalizada?')) {
      return;
    }
    try {
      await api.delete(`/api/form-templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
      alert('Plantilla eliminada exitosamente.');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar la plantilla');
    }
  };

  // Añadir un nuevo campo en el constructor
  const addField = (fieldType) => {
    const timestamp = Date.now();
    const newField = {
      id: `campo_${timestamp}_${formFields.length + 1}`,
      label: fieldType === 'text' ? 'Texto Corto'
        : fieldType === 'textarea' ? 'Descripción Detallada'
        : fieldType === 'number' ? 'Valor Numérico'
        : fieldType === 'select' ? 'Opciones de Selección'
        : fieldType === 'checkbox' ? 'Opción de Verificación'
        : fieldType === 'date' ? 'Fecha de Control' : 'Nuevo Campo',
      type: fieldType,
      placeholder: '',
      required: false,
      width: fieldType === 'textarea' ? 'full' : 'half',
      options: fieldType === 'select' ? ['Opción 1', 'Opción 2', 'Opción 3'] : []
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (idx, key, value) => {
    const updated = [...formFields];
    updated[idx] = { ...updated[idx], [key]: value };
    setFormFields(updated);
  };

  const removeField = (idx) => {
    setFormFields(formFields.filter((_, i) => i !== idx));
  };

  // Guardar plantilla (desde el constructor)
  const handleSaveBuilder = async (e) => {
    e.preventDefault();
    if (!formMeta.title.trim()) {
      alert('Por favor ingrese el título de la plantilla.');
      return;
    }
    if (formFields.length === 0) {
      alert('Agregue al menos un campo al formulario.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formMeta.title.trim(),
        category: formMeta.category,
        targetModule: formMeta.targetModule,
        description: formMeta.description,
        isGlobal: formMeta.isGlobal,
        fields: formFields
      };

      if (editingId) {
        const res = await api.put(`/api/form-templates/${editingId}`, payload);
        alert('¡Plantilla actualizada exitosamente!');
        setTemplates(prev => prev.map(t => t.id === editingId ? res.data.template : t));
      } else {
        const res = await api.post('/api/form-templates', payload);
        alert('¡Plantilla personalizada guardada exitosamente!');
        setTemplates(prev => [res.data.template, ...prev]);
      }
      setActiveTab('list');
      resetBuilder();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  };

  // Exportar plantilla a JSON
  const handleExportJson = (tmpl) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tmpl, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Plantilla_${tmpl.title.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Descargar plantilla modelo de ejemplo
  const handleDownloadSample = () => {
    const sample = {
      title: "Evaluación Especial de Muestra",
      category: "General",
      targetModule: "ALL",
      description: "Plantilla modelo para importar campos personalizados en SARA.",
      isGlobal: false,
      fields: [
        {
          id: "motivo_especifico",
          label: "Motivo Específico de Consulta / Procedimiento",
          type: "text",
          placeholder: "Escriba el motivo detallado...",
          required: true,
          width: "full"
        },
        {
          id: "nivel_severidad",
          label: "Nivel de Severidad",
          type: "select",
          options: ["Leve", "Moderado", "Severo", "Crítico"],
          required: true,
          width: "half"
        },
        {
          id: "requiere_seguimiento",
          label: "¿Requiere Control Estricto a las 48 Horas?",
          type: "checkbox",
          required: false,
          width: "half"
        },
        {
          id: "observaciones_adicionales",
          label: "Observaciones Clínicas y Hallazgos",
          type: "textarea",
          placeholder: "Anotaciones médicas adicionales...",
          required: false,
          width: "full"
        }
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "Plantilla_Modelo_SARA.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Procesar archivo JSON subido
  const handleFileUpload = (e) => {
    setImportError('');
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setImportJsonText(JSON.stringify(parsed, null, 2));
      } catch (err) {
        setImportError('El archivo seleccionado no es un JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  // Guardar plantilla importada
  const handleProcessImport = async () => {
    setImportError('');
    if (!importJsonText.trim()) {
      setImportError('Por favor suba un archivo o pegue la estructura JSON.');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.title || !parsed.fields || !Array.isArray(parsed.fields)) {
        setImportError('El JSON debe contener al menos las propiedades "title" y un arreglo "fields".');
        return;
      }

      setSaving(true);
      const payload = {
        title: parsed.title,
        category: parsed.category || 'General',
        targetModule: parsed.targetModule || targetModule || 'ALL',
        description: parsed.description || '',
        isGlobal: isMasterOrAdmin ? Boolean(parsed.isGlobal) : false,
        fields: parsed.fields
      };

      const res = await api.post('/api/form-templates', payload);
      alert('¡Plantilla importada y guardada exitosamente!');
      setTemplates(prev => [res.data.template, ...prev]);
      setImportJsonText('');
      setActiveTab('list');
    } catch (err) {
      setImportError(err.response?.data?.error || err.message || 'Error al procesar la plantilla.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cft-modal-overlay">
      <div className="cft-modal-content">
        {/* Cabecera */}
        <div className="cft-modal-header">
          <h2>
            <Layers size={22} color="#0284c7" />
            Gestor de Plantillas y Formularios Personalizados
          </h2>
          <button className="cft-modal-close-btn" onClick={onClose} title="Cerrar">&times;</button>
        </div>

        {/* Pestañas de navegación */}
        <div className="cft-tabs">
          <button
            type="button"
            className={`cft-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <ListFilter size={16} /> Mis Plantillas ({templates.length})
          </button>
          <button
            type="button"
            className={`cft-tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
            onClick={handleStartNew}
          >
            <Plus size={16} /> Diseñar Nueva Plantilla
          </button>
          <button
            type="button"
            className={`cft-tab-btn ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => { setActiveTab('import'); setImportError(''); }}
          >
            <Upload size={16} /> Subir / Importar Plantilla (JSON)
          </button>
        </div>

        {/* Cuerpo */}
        <div className="cft-modal-body">
          {/* VISTA 1: LISTADO DE PLANTILLAS */}
          {activeTab === 'list' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Plantillas Disponibles</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Cada médico o master puede utilizar, exportar o crear nuevas plantillas dinámicas.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleStartNew}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.5rem 1rem', borderRadius: '8px', background: '#0284c7',
                      color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} /> Nueva Plantilla
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  Cargando plantillas...
                </div>
              ) : templates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <FileText size={42} color="#94a3b8" style={{ marginBottom: '0.5rem', opacity: 0.7 }} />
                  <h4 style={{ margin: '0.5rem 0', color: '#334155' }}>No tienes plantillas personalizadas aún</h4>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.25rem auto' }}>
                    Crea tu primer formulario dinámico con el diseñador visual o sube una plantilla en formato JSON.
                  </p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button
                      onClick={handleStartNew}
                      style={{ padding: '0.5rem 1rem', background: '#0284c7', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Crear con Diseñador Visual
                    </button>
                    <button
                      onClick={() => setActiveTab('import')}
                      style={{ padding: '0.5rem 1rem', background: '#fff', color: '#0284c7', borderRadius: '8px', border: '1px solid #0284c7', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Subir Archivo JSON
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {templates.map(tmpl => {
                    const isAuthor = tmpl.doctorId === currentUser.id;
                    const canEdit = isAuthor || isMasterOrAdmin;
                    const fieldsCount = Array.isArray(tmpl.fields) ? tmpl.fields.length : 0;

                    return (
                      <div
                        key={tmpl.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.25rem',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '280px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '12px', fontWeight: 700,
                              backgroundColor: '#e0f2fe', color: '#0369a1'
                            }}>
                              {tmpl.category || 'General'}
                            </span>

                            <span style={{
                              fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '12px', fontWeight: 600,
                              backgroundColor: tmpl.targetModule === 'CONSULTATION' ? '#fef3c7' : tmpl.targetModule === 'STUDY' ? '#dcfce7' : '#f3e8ff',
                              color: tmpl.targetModule === 'CONSULTATION' ? '#92400e' : tmpl.targetModule === 'STUDY' ? '#166534' : '#6b21a8'
                            }}>
                              {tmpl.targetModule === 'CONSULTATION' ? 'Consulta Médica' : tmpl.targetModule === 'STUDY' ? 'Estudios' : 'Ambos Módulos'}
                            </span>

                            {tmpl.isGlobal && (
                              <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.6rem', borderRadius: '12px', fontWeight: 700, background: '#fef08a', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Globe size={11} /> Global Clínica
                              </span>
                            )}
                          </div>

                          <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
                            {tmpl.title}
                          </h4>

                          {tmpl.description && (
                            <p style={{ margin: '0 0 0.35rem 0', color: '#475569', fontSize: '0.85rem' }}>
                              {tmpl.description}
                            </p>
                          )}

                          <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <span><strong>{fieldsCount}</strong> {fieldsCount === 1 ? 'campo' : 'campos definidos'}</span>
                            <span>Creado por: <strong>{tmpl.author?.name || tmpl.author?.username || 'Médico'}</strong></span>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          {onSelectTemplate && (
                            <button
                              type="button"
                              onClick={() => { onSelectTemplate(tmpl); onClose(); }}
                              style={{
                                padding: '0.45rem 0.85rem', background: '#059669', color: '#fff',
                                borderRadius: '6px', border: 'none', fontWeight: 700, fontSize: '0.82rem',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
                              }}
                            >
                              <Check size={14} /> Seleccionar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleExportJson(tmpl)}
                            title="Descargar esta plantilla como archivo JSON"
                            style={{
                              padding: '0.45rem 0.75rem', background: '#fff', color: '#475569',
                              borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem',
                              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                            }}
                          >
                            <Download size={14} /> Exportar JSON
                          </button>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleEdit(tmpl)}
                              title="Editar diseño de campos"
                              style={{
                                padding: '0.45rem 0.75rem', background: '#fff', color: '#0284c7',
                                borderRadius: '6px', border: '1px solid #bae6fd', fontSize: '0.82rem',
                                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                              }}
                            >
                              <Edit3 size={14} /> Editar
                            </button>
                          )}

                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDelete(tmpl.id)}
                              title="Eliminar plantilla"
                              style={{
                                padding: '0.45rem 0.6rem', background: '#fff', color: '#ef4444',
                                borderRadius: '6px', border: '1px solid #fca5a5', cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VISTA 2: CONSTRUCTOR VISUAL DE CAMPOS (BUILDER) */}
          {activeTab === 'builder' && (
            <form onSubmit={handleSaveBuilder}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                    {editingId ? 'Editar Plantilla de Formulario' : 'Diseñar Nueva Plantilla Personalizada'}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Configura los datos generales y añade los campos que desees que aparezcan en pantalla.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowLivePreview(!showLivePreview)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.5rem 0.85rem', borderRadius: '8px',
                      background: showLivePreview ? '#0284c7' : '#fff',
                      color: showLivePreview ? '#fff' : '#0284c7',
                      border: '1px solid #0284c7', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    <Eye size={15} /> {showLivePreview ? 'Ocultar Vista Previa' : 'Vista Previa en Vivo'}
                  </button>
                </div>
              </div>

              {/* Parámetros Básicos */}
              <div style={{
                background: '#f8fafc', padding: '1.25rem', borderRadius: '12px',
                border: '1px solid #e2e8f0', marginBottom: '1.5rem',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem'
              }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                    Título de la Plantilla *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Evaluación de Control Pediátrico / Protocolo de Colonoscopia Avanzada"
                    value={formMeta.title}
                    onChange={(e) => setFormMeta({ ...formMeta, title: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                    Aplica a Módulo:
                  </label>
                  <select
                    value={formMeta.targetModule}
                    onChange={(e) => setFormMeta({ ...formMeta, targetModule: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                  >
                    <option value="ALL">Ambos (Consultas y Estudios)</option>
                    <option value="CONSULTATION">Solo Consulta Médica (Módulo 4)</option>
                    <option value="STUDY">Solo Estudios y Procedimientos (Módulo 6)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                    Especialidad / Categoría
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Coloproctología, Cardiología, General..."
                    value={formMeta.category}
                    onChange={(e) => setFormMeta({ ...formMeta, category: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.3rem' }}>
                    Descripción u Objetivo (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Breve explicación del propósito de esta ficha clínica..."
                    value={formMeta.description}
                    onChange={(e) => setFormMeta({ ...formMeta, description: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
                  />
                </div>

                {isMasterOrAdmin && (
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="isGlobalCheck"
                      checked={formMeta.isGlobal}
                      onChange={(e) => setFormMeta({ ...formMeta, isGlobal: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="isGlobalCheck" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer' }}>
                      Plantilla Global de la Clínica (Disponible para todos los médicos del centro)
                    </label>
                  </div>
                )}
              </div>

              {/* Paleta para agregar tipos de campos */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Añadir Campo al Formulario:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="cft-palette-btn" onClick={() => addField('text')}>
                    <Type size={15} /> Texto Corto
                  </button>
                  <button type="button" className="cft-palette-btn" onClick={() => addField('textarea')}>
                    <AlignLeft size={15} /> Área de Texto
                  </button>
                  <button type="button" className="cft-palette-btn" onClick={() => addField('number')}>
                    <Hash size={15} /> Número
                  </button>
                  <button type="button" className="cft-palette-btn" onClick={() => addField('select')}>
                    <ListFilter size={15} /> Menú Opciones (Select)
                  </button>
                  <button type="button" className="cft-palette-btn" onClick={() => addField('checkbox')}>
                    <CheckSquare size={15} /> Casilla (Checkbox)
                  </button>
                  <button type="button" className="cft-palette-btn" onClick={() => addField('date')}>
                    <Calendar size={15} /> Fecha
                  </button>
                </div>
              </div>

              {/* Lista de campos añadidos */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                  Campos Configurados ({formFields.length}):
                </span>

                {formFields.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    Usa los botones superiores para añadir campos a tu formulario.
                  </div>
                ) : (
                  formFields.map((field, idx) => (
                    <div key={field.id || idx} className="cft-field-builder-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7' }}>
                          #{idx + 1} - Tipo: {field.type.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeField(idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.82rem' }}
                        >
                          <Trash2 size={15} /> Eliminar Campo
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                            Etiqueta / Pregunta *
                          </label>
                          <input
                            type="text"
                            required
                            value={field.label}
                            onChange={(e) => updateField(idx, 'label', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>

                        {field.type !== 'checkbox' && (
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                              Texto de Ayuda (Placeholder)
                            </label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(idx, 'placeholder', e.target.value)}
                              placeholder="Ej. Ingrese valor..."
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                            />
                          </div>
                        )}

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                            Ancho del Campo
                          </label>
                          <select
                            value={field.width || 'full'}
                            onChange={(e) => updateField(idx, 'width', e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          >
                            <option value="full">100% de la fila (Completo)</option>
                            <option value="half">50% de la fila (Media columna)</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                          <input
                            type="checkbox"
                            id={`req_${idx}`}
                            checked={field.required}
                            onChange={(e) => updateField(idx, 'required', e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <label htmlFor={`req_${idx}`} style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                            Campo Obligatorio
                          </label>
                        </div>
                      </div>

                      {/* Configuración de opciones para Select */}
                      {field.type === 'select' && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1' }}>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.2rem' }}>
                            Opciones del Menú (separadas por coma):
                          </label>
                          <input
                            type="text"
                            value={(field.options || []).join(', ')}
                            onChange={(e) => updateField(idx, 'options', e.target.value.split(',').map(s => s.trim()))}
                            placeholder="Ej. Normal, Leve, Moderado, Severo"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Vista Previa en Vivo (si está activa) */}
              {showLivePreview && (
                <div style={{
                  padding: '1.25rem', borderRadius: '12px', border: '2px solid #0284c7',
                  background: '#f0f9ff', marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Sparkles size={18} color="#0284c7" />
                    <h4 style={{ margin: 0, color: '#0369a1', fontSize: '0.98rem' }}>
                      Vista Previa Interactiva: {formMeta.title || 'Formulario'}
                    </h4>
                  </div>
                  <DynamicFormRenderer
                    fields={formFields}
                    values={previewValues}
                    onChange={(k, v) => setPreviewValues({ ...previewValues, [k]: v })}
                  />
                </div>
              )}

              {/* Botones de acción */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                    background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {saving ? 'Guardando...' : (editingId ? 'Actualizar Plantilla' : 'Guardar Plantilla')}
                </button>
              </div>
            </form>
          )}

          {/* VISTA 3: SUBIR / IMPORTAR PLANTILLA (JSON) */}
          {activeTab === 'import' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>Subir Plantilla desde Archivo</h3>
                  <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                    Sube un archivo <code>.json</code> o pega la definición estructurada para generar el formulario automáticamente.
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.5rem 0.85rem', borderRadius: '8px', background: '#fff',
                      color: '#0284c7', border: '1px solid #0284c7', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    <Download size={15} /> Descargar Plantilla de Ejemplo (JSON)
                  </button>
                </div>
              </div>

              {/* Zona de Drop / Selección de Archivo */}
              <div
                className="cft-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={38} color="#0284c7" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ margin: '0 0 0.35rem 0', color: '#1e293b' }}>
                  Haga clic para seleccionar o arrastre un archivo .JSON
                </h4>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
                  El archivo se leerá automáticamente y generará los campos en tu cuenta.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </div>

              {/* Editor / Pegado de JSON */}
              <div style={{ marginTop: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  O pega aquí directamente el contenido JSON de la plantilla:
                </label>
                <textarea
                  rows={8}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{\n  "title": "Evaluación Cardíaca",\n  "fields": [\n    { "id": "ritmo", "label": "Ritmo Cardíaco", "type": "text", "required": true }\n  ]\n}'
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1',
                    fontFamily: 'monospace', fontSize: '0.85rem', boxSizing: 'border-box'
                  }}
                />
              </div>

              {importError && (
                <div style={{
                  padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5',
                  color: '#991b1b', borderRadius: '8px', marginTop: '0.75rem', fontSize: '0.88rem', fontWeight: 600
                }}>
                  {importError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={saving || !importJsonText.trim()}
                  style={{
                    padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                    background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {saving ? 'Importando...' : 'Importar y Crear Formulario'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomFormTemplateManager;
