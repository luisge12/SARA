import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { X, Clock, FileText } from 'lucide-react';

export function AuditLogModal({ patientId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [patientId]);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/api/patients/${patientId}/audit`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatAction = (action) => {
    switch (action) {
      case 'UPDATE_DEMOGRAPHICS': return 'Actualización de Datos Base/Parámetros';
      case 'CREATE_CONSULTATION': return 'Creación de Consulta Clínica';
      case 'UPDATE_CONSULTATION': return 'Modificación de Consulta Clínica';
      default: return action;
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', padding: '2rem', backgroundColor: 'var(--color-bg-main)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock /> Historial de Modificaciones (Trazabilidad)
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <p>Cargando trazabilidad...</p>
        ) : logs.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)' }}>No hay modificaciones registradas para este paciente.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'var(--color-bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>{formatAction(log.actionType)}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{formatDate(log.createdAt)}</span>
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
                  Modificado por: <strong>{log.modifiedBy?.name || 'Desconocido'}</strong> ({log.modifiedBy?.role || 'Sistema'})
                </div>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: 'var(--color-primary)' }}>Ver detalles técnicos</summary>
                  <pre style={{ fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px', overflowX: 'auto', marginTop: '0.5rem' }}>
                    {JSON.stringify(log.changesDescription, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
