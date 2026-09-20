import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { 
  X, Clock, FileText, User, Activity, Stethoscope, Search, 
  Filter, Calendar, ChevronDown, ChevronRight, CheckCircle2, 
  ArrowRight, ShieldCheck, AlertCircle, Maximize2, Minimize2 
} from 'lucide-react';

const FIELD_LABELS = {
  name: 'Nombre y Apellido',
  identificationNumber: 'Cédula / Identificación',
  sedeAtencion: 'Sede de Atención',
  gender: 'Género',
  dateOfBirth: 'Fecha de Nacimiento',
  phone: 'Teléfono',
  email: 'Correo Electrónico',
  treatingDoctor: 'Médico Tratante',
  referringEntity: 'Ente Referente',
  nextAppointment: 'Próxima Cita',
  address: 'Dirección de Habitación',
  personalHistory: 'Antecedentes Personales / Alergias',
  surgicalHistory: 'Antecedentes Quirúrgicos (Qx)',
  familyHistory: 'Antecedentes Familiares',
  menarcheAge: 'Menarquia (edad)',
  menopauseAge: 'Menopausia (edad)',
  obstetricFormula: 'Fórmula Obstétrica (G, P, A, C)',
  bristolType: 'Escala de Bristol',
  bowelFrequency: 'Frecuencia Evacuatoria',
  strainToEvacuate: 'Pujo al Evacuar',
  incompleteEvacuation: 'Sensación Evacuación Incompleta / Tenesmo',
  bowelNotes: 'Observaciones de Hábito Evacuatorio',
  heartRate: 'Frecuencia Cardíaca (ppm)',
  respiratoryRate: 'Frecuencia Respiratoria (rpm)',
  bloodPressure: 'Tensión Arterial (mmHg)',
  oxygenSaturation: 'Saturación de Oxígeno (%)',
  heightCm: 'Talla (cm)',
  weightKg: 'Peso (Kg)',
  reasonForVisit: 'Motivo de Consulta',
  physicalInspection: 'Inspección Física',
  physicalPalpation: 'Palpación Física',
  rectalExamination: 'Tacto Rectal',
  anoscopy: 'Anoscopia',
  diagnoses: 'Diagnósticos',
  treatmentPlan: 'Plan de Tratamiento',
  evolutionaryReport: 'Informe Evolutivo'
};

export function AuditLogModal({ patient, patientId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedJson, setExpandedJson] = useState({});
  const [isMaximized, setIsMaximized] = useState(false);

  const targetPatientId = patient?.id || patientId;
  const patientName = patient?.name || patient?.username || 'Paciente';
  const patientIdDoc = patient?.identificationNumber || '';

  useEffect(() => {
    if (targetPatientId) {
      fetchLogs();
    }
  }, [targetPatientId]);

  // Escuchar tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/patients/${targetPatientId}/audit`);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error al obtener auditoría:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getActionConfig = (action) => {
    switch (action) {
      case 'UPDATE_DEMOGRAPHICS':
        return {
          title: 'Actualización de Datos / Signos Vitales',
          color: '#2ab7ca',
          bg: 'rgba(42, 183, 202, 0.12)',
          border: 'rgba(42, 183, 202, 0.35)',
          icon: <Activity size={16} />
        };
      case 'CREATE_PATIENT':
        return {
          title: 'Registro Inicial del Paciente',
          color: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          icon: <User size={16} />
        };
      case 'CREATE_CONSULTATION':
        return {
          title: 'Nueva Consulta Clínica Registrada',
          color: '#8b5cf6',
          bg: 'rgba(139, 92, 246, 0.12)',
          border: 'rgba(139, 92, 246, 0.35)',
          icon: <Stethoscope size={16} />
        };
      case 'UPDATE_CONSULTATION':
        return {
          title: 'Modificación de Consulta Clínica',
          color: '#f59e0b',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.35)',
          icon: <FileText size={16} />
        };
      case 'APPOINTMENT_SCHEDULED':
      case 'APPOINTMENT_UPDATED':
        return {
          title: 'Gestión de Cita Médica',
          color: '#06b6d4',
          bg: 'rgba(6, 182, 212, 0.12)',
          border: 'rgba(6, 182, 212, 0.35)',
          icon: <Calendar size={16} />
        };
      default:
        return {
          title: action || 'Modificación de Expediente',
          color: 'var(--color-primary)',
          bg: 'rgba(34, 80, 93, 0.12)',
          border: 'rgba(34, 80, 93, 0.35)',
          icon: <ShieldCheck size={16} />
        };
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'médico':
      case 'medico':
        return { bg: '#e0e7ff', text: '#3730a3' };
      case 'recepcionista':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'master':
      case 'administrador':
        return { bg: '#fee2e2', text: '#991b1b' };
      default:
        return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  // Helper para extraer diferencias (compatibilidad retroactiva si no vienen en log.changesDescription.diffs)
  const extractDiffsFromLog = (log) => {
    let desc = log.changesDescription || {};
    if (typeof desc === 'string') {
      try {
        desc = JSON.parse(desc);
      } catch (e) {
        desc = {};
      }
    }
    if (Array.isArray(desc.diffs) && desc.diffs.length > 0) {
      return desc.diffs;
    }

    // Si viene del formato antiguo con oldProfile/newProfile
    if (desc.oldProfile || desc.newProfile || desc.oldUser || desc.newUser) {
      const diffs = [];
      const oldCombined = { ...(desc.oldUser || {}), ...(desc.oldProfile || {}) };
      const newCombined = { ...(desc.newUser || {}), ...(desc.newProfile || {}) };
      const keys = Array.from(new Set([...Object.keys(oldCombined), ...Object.keys(newCombined)]));

      for (const k of keys) {
        if (['id', 'userId', 'createdAt', 'updatedAt', 'created_at', 'updated_at'].includes(k)) continue;
        const oldVal = oldCombined[k] != null ? String(oldCombined[k]) : '';
        const newVal = newCombined[k] != null ? String(newCombined[k]) : '';
        if (oldVal !== newVal) {
          diffs.push({
            field: k,
            label: FIELD_LABELS[k] || k,
            oldValue: oldVal || '(vacío)',
            newValue: newVal || '(vacío)'
          });
        }
      }
      return diffs;
    }

    // Si es CREATE_PATIENT y viene de registros antiguos sin diffs explícitos
    if (log.actionType === 'CREATE_PATIENT') {
      const diffs = [];
      const metaUser = desc.user || desc.newUser || {};
      const nombre = metaUser.name || patientName || (desc.summary?.includes(': ') ? desc.summary.split(': ')[1] : '');
      const usuario = metaUser.username || patient?.username;
      
      if (nombre) {
        diffs.push({
          field: 'name',
          label: 'Nombre Completo',
          oldValue: '(alta inicial - nuevo registro)',
          newValue: nombre
        });
      }
      if (usuario && usuario !== nombre) {
        diffs.push({
          field: 'username',
          label: 'Usuario del Sistema',
          oldValue: '(alta inicial)',
          newValue: usuario
        });
      }
      if (patientIdDoc) {
        diffs.push({
          field: 'identificationNumber',
          label: 'Cédula / Identificación',
          oldValue: '(alta inicial)',
          newValue: patientIdDoc
        });
      }
      return diffs;
    }

    return [];
  };

  // Filtrado y búsqueda en vivo
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filtro de categoría
      if (filterType === 'DEMOGRAPHICS' && !['UPDATE_DEMOGRAPHICS', 'CREATE_PATIENT'].includes(log.actionType)) {
        return false;
      }
      if (filterType === 'CLINICAL' && !['CREATE_CONSULTATION', 'UPDATE_CONSULTATION'].includes(log.actionType)) {
        return false;
      }

      // Búsqueda por término
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const actionName = (log.actionType || '').toLowerCase();
      const userName = (log.modifiedBy?.name || log.modifiedBy?.username || '').toLowerCase();
      const role = (log.modifiedBy?.role || '').toLowerCase();
      const summary = (log.changesDescription?.summary || '').toLowerCase();
      const diffs = extractDiffsFromLog(log);
      const diffsText = diffs.map(d => `${d.label} ${d.oldValue} ${d.newValue}`).join(' ').toLowerCase();

      return (
        actionName.includes(term) ||
        userName.includes(term) ||
        role.includes(term) ||
        summary.includes(term) ||
        diffsText.includes(term)
      );
    });
  }, [logs, filterType, searchTerm]);

  const toggleJson = (id) => {
    setExpandedJson(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return createPortal(
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(6px)',
        zIndex: 100000, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{ 
          width: isMaximized ? '99vw' : '95vw', 
          maxWidth: isMaximized ? '100vw' : '1180px', 
          height: isMaximized ? '98vh' : '90vh', 
          maxHeight: isMaximized ? '98vh' : '90vh', 
          display: 'flex', 
          flexDirection: 'column', 
          backgroundColor: '#ffffff', 
          borderRadius: isMaximized ? '8px' : '16px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        {/* CABECERA DEL MODAL */}
        <div 
          style={{ 
            padding: '1.25rem 1.75rem', 
            borderBottom: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#fafbfc',
            flexShrink: 0
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div 
                style={{ 
                  backgroundColor: 'rgba(42, 183, 202, 0.15)', 
                  color: 'var(--color-primary)', 
                  padding: '0.45rem', 
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-text-main)', margin: 0 }}>
                  Historial de Modificaciones y Auditoría
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                  <span>Expediente: <strong style={{ color: 'var(--color-primary)' }}>{patientName}</strong></span>
                  {patientIdDoc && <span>• C.I.: <strong>{patientIdDoc}</strong></span>}
                  <span>• Total de registros: <span style={{ backgroundColor: 'rgba(42, 183, 202, 0.15)', color: 'var(--color-primary)', padding: '0.1rem 0.55rem', borderRadius: '12px', fontWeight: '700' }}>{logs.length}</span></span>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#64748b',
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s, color 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
              title={isMaximized ? "Restaurar tamaño normal" : "Maximizar a pantalla completa"}
            >
              {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button 
              onClick={onClose} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                color: '#94a3b8', 
                padding: '0.45rem', 
                borderRadius: '8px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s, color 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
              title="Cerrar modal"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* BARRA DE FILTROS Y BÚSQUEDA */}
        <div 
          style={{ 
            padding: '0.85rem 1.75rem', 
            backgroundColor: '#ffffff', 
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            flexShrink: 0
          }}
        >
          {/* Botones de Categorías */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('ALL')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: filterType === 'ALL' ? '1px solid var(--color-primary)' : '1px solid #cbd5e1',
                backgroundColor: filterType === 'ALL' ? 'var(--color-primary)' : '#ffffff',
                color: filterType === 'ALL' ? '#ffffff' : '#0f172a',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              Todos ({logs.length})
            </button>
            <button
              onClick={() => setFilterType('DEMOGRAPHICS')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: filterType === 'DEMOGRAPHICS' ? '1px solid var(--color-accent)' : '1px solid #cbd5e1',
                backgroundColor: filterType === 'DEMOGRAPHICS' ? 'var(--color-accent)' : '#ffffff',
                color: filterType === 'DEMOGRAPHICS' ? '#ffffff' : '#0f172a',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Activity size={13} /> Datos y Signos
            </button>
            <button
              onClick={() => setFilterType('CLINICAL')}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: filterType === 'CLINICAL' ? '1px solid #8b5cf6' : '1px solid #cbd5e1',
                backgroundColor: filterType === 'CLINICAL' ? '#8b5cf6' : '#ffffff',
                color: filterType === 'CLINICAL' ? '#ffffff' : '#0f172a',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Stethoscope size={13} /> Consultas Médicas
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 200px', maxWidth: '350px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Buscar por campo, usuario o valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.4rem 0.75rem 0.4rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                backgroundColor: '#f8fafc',
                outline: 'none',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.backgroundColor = '#ffffff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
            />
          </div>
        </div>

        {/* CUERPO CON LÍNEA DE TIEMPO DE REGISTROS CON SCROLL GARANTIZADO */}
        <div 
          style={{ 
            flex: '1 1 auto', 
            minHeight: 0,
            overflowY: 'auto', 
            WebkitOverflowScrolling: 'touch',
            padding: '1.5rem 1.75rem', 
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <div 
                style={{ 
                  display: 'inline-block', 
                  width: '36px', 
                  height: '36px', 
                  border: '3px solid rgba(42, 183, 202, 0.2)', 
                  borderTopColor: 'var(--color-accent)', 
                  borderRadius: '50%', 
                  animation: 'spin 0.8s linear infinite',
                  marginBottom: '1rem'
                }} 
              />
              <p style={{ fontWeight: '500' }}>Cargando bitácora de trazabilidad de la base de datos...</p>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
              <AlertCircle size={44} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#475569', marginBottom: '0.35rem' }}>
                Sin registros de auditoría
              </h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
                No se han registrado modificaciones para este paciente todavía. Todos los cambios que se realicen en adelante se guardarán automáticamente aquí.
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <Search size={36} style={{ margin: '0 auto 0.5rem auto', opacity: 0.5 }} />
              <p style={{ fontWeight: '500' }}>No se encontraron registros que coincidan con la búsqueda o filtro.</p>
              <button 
                onClick={() => { setSearchTerm(''); setFilterType('ALL'); }}
                style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const config = getActionConfig(log.actionType);
              const diffs = extractDiffsFromLog(log);
              const roleBadge = getRoleBadgeStyle(log.modifiedBy?.role);
              const isJsonOpen = !!expandedJson[log.id];

              return (
                <div 
                  key={log.id || index}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                    flexShrink: 0,
                    width: '100%'
                  }}
                >
                  {/* ENCABEZADO DE LA TARJETA */}
                  <div 
                    style={{ 
                      padding: '0.85rem 1.25rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                      borderBottom: '1px solid #f1f5f9',
                      backgroundColor: '#fafbfc'
                    }}
                  >
                    {/* Badge de tipo de acción */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.35rem', 
                          padding: '0.3rem 0.65rem', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem', 
                          fontWeight: '700',
                          backgroundColor: config.bg,
                          color: config.color,
                          border: `1px solid ${config.border}`
                        }}
                      >
                        {config.icon} {config.title}
                      </span>
                    </div>

                    {/* Meta: Usuario modificador y fecha */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.84rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Por:</span>
                        <strong style={{ color: '#0f172a' }}>
                          {log.modifiedBy?.name || log.modifiedBy?.username || 'Sistema'}
                        </strong>
                        {log.modifiedBy?.role && (
                          <span 
                            style={{ 
                              padding: '0.15rem 0.45rem', 
                              borderRadius: '6px', 
                              fontSize: '0.72rem', 
                              fontWeight: '700',
                              backgroundColor: roleBadge.bg,
                              color: roleBadge.text
                            }}
                          >
                            {log.modifiedBy.role}
                          </span>
                        )}
                      </div>
                      <span style={{ color: '#94a3b8' }}>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#334155', fontWeight: '500' }}>
                        <Clock size={13} />
                        <span>{formatDate(log.createdAt || log.created_at || log.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CUERPO DE LA TARJETA: RESUMEN Y TABLA DE CAMBIOS */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    {log.changesDescription?.summary && (
                      <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#0f172a', marginBottom: diffs.length > 0 ? '0.75rem' : 0 }}>
                        {log.changesDescription.summary}
                      </p>
                    )}

                    {/* TABLA DE DIFERENCIAS CAMPO POR CAMPO */}
                    {diffs.length > 0 && (
                      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.5rem' }}>
                        <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', textAlign: 'left', color: '#0f172a' }}>
                              <th style={{ padding: '0.65rem 1rem', width: '30%', minWidth: '180px', fontWeight: '700' }}>Campo Modificado</th>
                              <th style={{ padding: '0.65rem 1rem', width: '35%', minWidth: '220px', fontWeight: '700' }}>Valor Anterior</th>
                              <th style={{ padding: '0.65rem 1rem', width: '35%', minWidth: '220px', fontWeight: '700' }}>Valor Nuevo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {diffs.map((diff, dIdx) => (
                              <tr 
                                key={dIdx} 
                                style={{ 
                                  borderBottom: dIdx === diffs.length - 1 ? 'none' : '1px solid #f1f5f9',
                                  backgroundColor: dIdx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                                }}
                              >
                                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                                  {diff.label || diff.field}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span 
                                    style={{ 
                                      display: 'inline-block',
                                      padding: '0.35rem 0.65rem', 
                                      borderRadius: '6px', 
                                      backgroundColor: '#fee2e2', 
                                      color: '#991b1b', 
                                      border: '1px solid #fecaca',
                                      wordBreak: 'break-word',
                                      fontSize: '0.84rem',
                                      fontWeight: '600',
                                      lineHeight: '1.45'
                                    }}
                                  >
                                    {diff.oldValue || '(vacío)'}
                                  </span>
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span 
                                    style={{ 
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      padding: '0.35rem 0.65rem', 
                                      borderRadius: '6px', 
                                      backgroundColor: '#dcfce7', 
                                      color: '#14532d',
                                      border: '1px solid #bbf7d0',
                                      fontWeight: '700',
                                      wordBreak: 'break-word',
                                      fontSize: '0.84rem',
                                      lineHeight: '1.45'
                                    }}
                                  >
                                    <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                                    {diff.newValue || '(vacío)'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* DETALLES TÉCNICOS EXPANDIBLES (JSON) */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <button
                        onClick={() => toggleJson(log.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#334155',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: 0,
                          fontWeight: '600'
                        }}
                      >
                        {isJsonOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span>{isJsonOpen ? 'Ocultar detalles técnicos' : 'Ver detalles técnicos (JSON)'}</span>
                      </button>

                      {isJsonOpen && (
                        <pre 
                          style={{ 
                            fontSize: '0.73rem', 
                            backgroundColor: '#0f172a', 
                            color: '#f8fafc',
                            padding: '0.85rem', 
                            borderRadius: '8px', 
                            overflowX: 'auto', 
                            marginTop: '0.5rem',
                            maxHeight: '220px',
                            lineHeight: '1.4'
                          }}
                        >
                          {JSON.stringify(log.changesDescription, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* PIE DEL MODAL */}
        <div 
          style={{ 
            padding: '0.9rem 1.75rem', 
            borderTop: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: '#fafbfc'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} style={{ color: 'var(--color-accent)' }} />
            <span>Registro inmutable firmado con PostgreSQL</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: 'var(--color-text-main)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
