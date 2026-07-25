import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import api from '../services/api';
import { Calendar, X, CheckCircle, Clock, Trash2 } from 'lucide-react';

export function AppointmentModal({ onClose, onSuccess, initialPatientId = null, appointmentToEdit = null }) {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form State
  const [patientId, setPatientId] = useState(appointmentToEdit ? (appointmentToEdit.patientId || appointmentToEdit.patient?.id || '') : (initialPatientId || ''));
  const [doctorId, setDoctorId] = useState(appointmentToEdit ? (appointmentToEdit.doctorId || appointmentToEdit.doctor?.id || '') : '');
  const [sedeAtencion, setSedeAtencion] = useState(appointmentToEdit ? (appointmentToEdit.sedeAtencion || 'CENTRAL') : 'CENTRAL');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [reason, setReason] = useState(appointmentToEdit ? (appointmentToEdit.reason || '') : '');
  const [status, setStatus] = useState(appointmentToEdit ? (appointmentToEdit.status || 'Confirmada') : 'Confirmada');
  const [notes, setNotes] = useState(appointmentToEdit ? (appointmentToEdit.notes || '') : '');

  // Payment State
  const [totalAmount, setTotalAmount] = useState(appointmentToEdit ? (appointmentToEdit.totalAmount || '0') : '0');
  const [paidAmount, setPaidAmount] = useState(appointmentToEdit ? (appointmentToEdit.paidAmount || '0') : '0');
  const [paymentMethod, setPaymentMethod] = useState(appointmentToEdit ? (appointmentToEdit.paymentMethod || 'Efectivo (USD)') : 'Efectivo (USD)');
  const [paymentStatus, setPaymentStatus] = useState(appointmentToEdit ? (appointmentToEdit.paymentStatus || 'Pendiente') : 'Pendiente');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-calculate pending amount
  const tot = parseFloat(totalAmount || 0);
  const paid = parseFloat(paidAmount || 0);
  const calculatedPending = Math.max(0, tot - paid);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUsers(true);
        // Obtener todos los usuarios para filtrar pacientes y médicos
        const res = await api.get('/api/users');
        const allUsers = res.data;

        const patientList = allUsers.filter(u => u.role === 'Paciente');
        const doctorList = allUsers.filter(u => u.role === 'Médico' || u.role === 'Master' || u.role === 'Administrador');

        setPatients(patientList);
        setDoctors(doctorList);

        if (!appointmentToEdit) {
          if (initialPatientId) {
            const selected = patientList.find(p => p.id === parseInt(initialPatientId, 10));
            if (selected && selected.sedeAtencion) {
              setSedeAtencion(selected.sedeAtencion);
            }
          } else if (patientList.length > 0) {
            setPatientId(patientList[0].id);
            if (patientList[0].sedeAtencion) {
              setSedeAtencion(patientList[0].sedeAtencion);
            }
          }

          if (doctorList.length > 0) {
            setDoctorId(doctorList[0].id);
          }
        }
      } catch (err) {
        console.error('Error al obtener lista de usuarios para citas:', err);
        setErrorMsg('Error al cargar la lista de pacientes y médicos.');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchData();

    // Configurar fecha de la cita
    if (appointmentToEdit && appointmentToEdit.appointmentDate) {
      const d = new Date(appointmentToEdit.appointmentDate);
      const localIso = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setAppointmentDate(localIso);
    } else {
      const now = new Date();
      const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setAppointmentDate(localIso);
    }
  }, [initialPatientId, appointmentToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!patientId) {
      setErrorMsg('Debe seleccionar un paciente.');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg('Debe seleccionar una fecha y hora para la cita.');
      return;
    }

    try {
      setSaving(true);
      
      // Auto-determinar el estado de pago si no es personalizado
      let autoPayStatus = paymentStatus;
      if (paid >= tot && tot > 0) autoPayStatus = 'Pagado';
      else if (paid > 0) autoPayStatus = 'Parcial';
      else autoPayStatus = 'Pendiente';

      const payload = {
        patientId: parseInt(patientId, 10),
        doctorId: doctorId ? parseInt(doctorId, 10) : null,
        sedeAtencion,
        appointmentDate: new Date(appointmentDate).toISOString(),
        reason,
        status,
        notes,
        totalAmount: tot,
        paidAmount: paid,
        paymentMethod,
        paymentStatus: autoPayStatus
      };

      let res;
      if (appointmentToEdit) {
        res = await api.put(`/api/appointments/${appointmentToEdit.id}`, payload);
        setSuccessMsg(res.data.message || 'Cita actualizada exitosamente.');
      } else {
        res = await api.post('/api/appointments', payload);
        setSuccessMsg(res.data.message || 'Cita agendada exitosamente.');
      }
      
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data.appointment);
        onClose();
      }, 1200);

    } catch (err) {
      console.error('Error al guardar cita:', err);
      setErrorMsg(err.response?.data?.error || 'Error al guardar la cita médica.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModal = async () => {
    if (!appointmentToEdit) return;
    if (!window.confirm('¿Está seguro de que desea eliminar permanentemente esta cita médica?')) return;
    
    try {
      setSaving(true);
      await api.delete(`/api/appointments/${appointmentToEdit.id}`);
      setSuccessMsg('Cita eliminada correctamente.');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error al eliminar cita:', err);
      setErrorMsg(err.response?.data?.error || 'Error al eliminar la cita médica.');
      setSaving(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '650px', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18), 0 0 40px rgba(255, 255, 255, 0.6) inset'
        }}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)' }}>
            {appointmentToEdit ? `Editar Cita Médica #${appointmentToEdit.id}` : 'Agendar Nueva Cita Médica'}
          </h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(0, 0, 0, 0.05)', 
              border: 'none', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer', 
              color: 'var(--color-text-main)',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
              Cargando información...
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {successMsg && (
                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={18} /> {successMsg}
                </div>
              )}

              {errorMsg && (
                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-alert)', fontWeight: '600' }}>
                  {errorMsg}
                </div>
              )}

              {/* Selección de Paciente */}
              <div className="input-group">
                <label className="input-label">Paciente *</label>
                <select 
                  className="input-field"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  required
                  style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <option value="" disabled>-- Seleccione un Paciente --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.username} {p.identificationNumber ? `(C.I: ${p.identificationNumber})` : ''} - Sede: {p.sedeAtencion || 'CENTRAL'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Médico Tratante y Sede */}
              <div className="responsive-grid-1-1">
                <div className="input-group">
                  <label className="input-label">Médico Asignado</label>
                  <select 
                    className="input-field"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <option value="">Por Asignar / Guardia</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name || d.username} {d.specialty ? `[${d.specialty}]` : `(${d.role})`} {d.mppsNumber ? `MPPS: ${d.mppsNumber}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Sede de Atención *</label>
                  <select 
                    className="input-field"
                    value={sedeAtencion}
                    onChange={(e) => setSedeAtencion(e.target.value)}
                    style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <option value="CENTRAL">CENTRAL</option>
                    <option value="GMSP">GMSP</option>
                    <option value="CCMLA">CCMLA</option>
                    <option value="PLA">PLA</option>
                  </select>
                </div>
              </div>

              {/* Fecha/Hora y Estado */}
              <div className="responsive-grid-1-1">
                <Input 
                  label="Fecha y Hora de la Cita *"
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />

                <div className="input-group">
                  <label className="input-label">Estado de la Cita</label>
                  <select 
                    className="input-field"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                  >
                    <option value="Confirmada">Confirmada</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Completada">Completada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Motivo de la Cita con Autocompletado */}
              <div className="input-group">
                <label className="input-label">Motivo de Consulta / Observaciones de Agendamiento</label>
                <input 
                  className="input-field"
                  list="appointment-reasons-list"
                  type="text"
                  placeholder="Ej. Chequeo post-operatorio, Evaluación Coloproctológica..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                />
                <datalist id="appointment-reasons-list">
                  <option value="Consulta Especializada Coloproctología" />
                  <option value="Consulta de Gastroenterología" />
                  <option value="Chequeo Médico Preventivo General" />
                  <option value="Evaluación Post-operatoria" />
                  <option value="Control Ginecológico de Rutina" />
                  <option value="Seguimiento de Tratamiento Oncológico" />
                  <option value="Evaluación Cardiovascular / HTA" />
                </datalist>
              </div>

              {/* SECCIÓN DE PAGOS Y CONTROL FINANCIERO */}
              <div style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(42, 183, 202, 0.06)',
                border: '1px dashed rgba(42, 183, 202, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  💳 Registro Financiero y Control de Pagos
                </h4>

                <div className="responsive-grid-1-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <Input 
                    label="Monto Total Cita ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />

                  <Input 
                    label="Monto Cancelado / Abonado ($)"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />

                  <div className="input-group">
                    <label className="input-label">Saldo Pendiente ($)</label>
                    <div style={{
                      height: '42px',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: calculatedPending > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: calculatedPending > 0 ? 'var(--color-alert)' : 'var(--color-success)',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      ${calculatedPending.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="responsive-grid-1-1">
                  <div className="input-group">
                    <label className="input-label">Método de Pago</label>
                    <select 
                      className="input-field"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: '#fff' }}
                    >
                      <option value="Efectivo (USD)">Efectivo (USD)</option>
                      <option value="Efectivo (VES)">Efectivo (VES)</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Pago Móvil">Pago Móvil</option>
                      <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                      <option value="Tarjeta de Débito / Crédito">Tarjeta de Débito / Crédito</option>
                      <option value="Seguro Médico">Seguro Médico / Póliza</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Estado Financiero</label>
                    <select 
                      className="input-field"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      style={{ height: '42px', padding: '0.5rem 1rem', backgroundColor: '#fff' }}
                    >
                      <option value="Pendiente">Pendiente (No pagado)</option>
                      <option value="Parcial">Parcial (Abonado)</option>
                      <option value="Pagado">Pagado Totalmente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notas Adicionales */}
              <div className="input-group">
                <label className="input-label">Notas Adicionales (Internas)</label>
                <textarea 
                  className="input-field"
                  rows="2"
                  placeholder="Detalles sobre seguro, confirmación telefónica..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ padding: '0.75rem', fontFamily: 'inherit', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  {appointmentToEdit && (
                    <Button 
                      type="button" 
                      onClick={handleDeleteModal} 
                      disabled={saving}
                      style={{ 
                        backgroundColor: 'rgba(239, 68, 68, 0.15)', 
                        color: 'var(--color-alert)', 
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <Trash2 size={16} /> Eliminar Cita
                    </Button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Guardando Cita...' : (appointmentToEdit ? 'Guardar Cambios de Cita' : 'Agendar Cita Médica')}
                  </Button>
                </div>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

