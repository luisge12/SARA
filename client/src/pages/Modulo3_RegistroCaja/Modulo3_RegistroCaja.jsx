import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { Wallet, Receipt, Calculator, Download, DollarSign, TrendingUp, HeartPulse, FileText, RefreshCw, Printer, Filter, Calendar, User, Users } from 'lucide-react';
import { MedicalDocumentModal } from '../../components/MedicalDocumentModal';
import { getClinicSettings, getClinicSedes } from '../../services/clinicSettings';

function Modulo3_GestionAdministrativa() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasAccess = ['Master', 'Administrador', 'Recepcionista'].includes(currentUser.role);
  const isMaster = currentUser.role === 'Master';
  const isRecepcionista = currentUser.role === 'Recepcionista';
  const clinicSettings = getClinicSettings();
  const clinicName = clinicSettings.name || 'Clínica';

  // Form states
  const clinicSedes = getClinicSedes();
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [sedeAtencion, setSedeAtencion] = useState(clinicSedes[0] || 'CENTRAL');
  const availableSedes = Array.from(new Set([...clinicSedes, ...(sedeAtencion ? [sedeAtencion] : [])]));
  const [serviceType, setServiceType] = useState('Servicios prestados en consultorio');
  const [totalAmountUSD, setTotalAmountUSD] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [unimecoPercentage, setUnimecoPercentage] = useState('30');
  const [doctorPercentage, setDoctorPercentage] = useState('70');
  const [operativeCosts, setOperativeCosts] = useState('0');
  const [incentives, setIncentives] = useState('0');

  // Helper seguro para parsear números con coma o punto
  const parseNum = (val, def = 0) => {
    if (val === undefined || val === null || val === '') return def;
    const str = String(val).replace(',', '.');
    const num = parseFloat(str);
    return isNaN(num) ? def : num;
  };

  // Computed states
  const totalLocal = parseNum(totalAmountUSD) * parseNum(exchangeRate);
  const grossUSD = parseNum(totalAmountUSD);
  const unimecoAmount = grossUSD * (parseNum(unimecoPercentage) / 100);
  const doctorAmount = grossUSD * (parseNum(doctorPercentage) / 100);
  const netUnimecoAmount = unimecoAmount - parseNum(operativeCosts) - parseNum(incentives);

  // Data states
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRate, setLoadingRate] = useState(false);
  const [bcvDateInfo, setBcvDateInfo] = useState('');
  const [selectedTransactionForPrint, setSelectedTransactionForPrint] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtros de Historial (Médico y Período)
  const [filterDoctorId, setFilterDoctorId] = useState('Todos');
  const [filterPeriod, setFilterPeriod] = useState('este_mes');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [activeViewTab, setActiveViewTab] = useState('detallado');

  const getPeriodBounds = (period) => {
    const now = new Date();
    let start = null;
    let end = null;

    if (period === 'esta_semana') {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'semana_anterior') {
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day - 7;
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (period === 'este_mes') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'mes_anterior') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (period === 'personalizado') {
      if (filterStartDate) start = new Date(filterStartDate + 'T00:00:00');
      if (filterEndDate) end = new Date(filterEndDate + 'T23:59:59.999');
    }
    return { start, end };
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterDoctorId !== 'Todos' && String(t.doctorId) !== String(filterDoctorId)) {
      return false;
    }
    if (filterPeriod !== 'todos') {
      const { start, end } = getPeriodBounds(filterPeriod);
      const tDate = new Date(t.createdAt);
      if (start && tDate < start) return false;
      if (end && tDate > end) return false;
    }
    return true;
  });

  const filteredTotals = filteredTransactions.reduce((acc, t) => {
    acc.grossUSD += parseFloat(t.totalAmountUSD) || 0;
    acc.doctorUSD += parseFloat(t.doctorAmount) || 0;
    acc.clinicNetUSD += parseFloat(t.netAmount) || 0;
    acc.costsUSD += (parseFloat(t.operativeCosts) || 0) + (parseFloat(t.incentives) || 0);
    acc.totalLocal += parseFloat(t.totalAmountLocal) || 0;
    acc.count += 1;
    return acc;
  }, { grossUSD: 0, doctorUSD: 0, clinicNetUSD: 0, costsUSD: 0, totalLocal: 0, count: 0 });

  const doctorSummaries = Object.values(filteredTransactions.reduce((acc, t) => {
    const docId = t.doctorId || 'unassigned';
    const docName = t.doctor?.name || t.doctor?.username || 'Médico Sin Asignar';
    if (!acc[docId]) {
      acc[docId] = {
        id: docId,
        name: docName,
        count: 0,
        grossUSD: 0,
        doctorUSD: 0,
        clinicNetUSD: 0
      };
    }
    acc[docId].count += 1;
    acc[docId].grossUSD += parseFloat(t.totalAmountUSD) || 0;
    acc[docId].doctorUSD += parseFloat(t.doctorAmount) || 0;
    acc[docId].clinicNetUSD += parseFloat(t.netAmount) || 0;
    return acc;
  }, {}));

  const fetchBCVRate = async (force = false) => {
    try {
      setLoadingRate(true);
      const url = force ? '/api/billing/bcv-rate?refresh=true' : '/api/billing/bcv-rate';
      const res = await api.get(url);
      if (res.data && res.data.rate) {
        setExchangeRate(res.data.rate.toString());
        setBcvDateInfo(res.data.fechaValor || '');
      }
    } catch (err) {
      console.warn('Backend BCV falló, probando fallback DolarAPI:', err);
      try {
        const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        if (res.ok) {
          const data = await res.json();
          if (data && data.promedio) {
            setExchangeRate(data.promedio.toString());
            setBcvDateInfo('BCV Oficial');
          }
        }
      } catch (fallbackErr) {
        console.error('Error fetching BCV rate fallback:', fallbackErr);
      }
    } finally {
      setLoadingRate(false);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, transRes, summaryRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/billing/transactions'),
        api.get('/api/billing/summary')
      ]);

      const allUsers = usersRes.data;
      setPatients(allUsers.filter(u => u.role === 'Paciente'));
      setDoctors(allUsers.filter(u => u.role === 'Médico' || u.role === 'Master'));
      setTransactions(transRes.data);
      setSummary(summaryRes.data);
      
    } catch (err) {
      console.error('Error al cargar datos financieros:', err);
      setErrorMsg('Error al cargar datos. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) {
      fetchInitialData();
      fetchBCVRate();
    }
  }, [hasAccess]);

  const handleRegisterPayment = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!patientId) {
      setErrorMsg('Por favor seleccione un paciente.');
      return;
    }
    if (!doctorId) {
      setErrorMsg('Por favor seleccione un médico tratante.');
      return;
    }
    if (grossUSD <= 0) {
      setErrorMsg('El monto total debe ser mayor a 0 USD.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        patientId,
        doctorId,
        sedeAtencion,
        serviceType,
        totalAmountUSD: grossUSD,
        exchangeRate: parseNum(exchangeRate),
        totalAmountLocal: totalLocal,
        unimecoPercentage: parseNum(unimecoPercentage),
        doctorPercentage: parseNum(doctorPercentage),
        unimecoAmount,
        doctorAmount,
        operativeCosts: parseNum(operativeCosts),
        incentives: parseNum(incentives),
        netAmount: netUnimecoAmount
      };

      await api.post('/api/billing/transactions', payload);
      setSuccessMsg('Pago registrado y distribuido exitosamente.');
      
      // Reset form
      setPatientId('');
      setDoctorId('');
      setTotalAmountUSD('');
      setOperativeCosts('0');
      setIncentives('0');

      fetchInitialData();
    } catch (err) {
      console.error('Error:', err);
      setErrorMsg(err.response?.data?.error || 'Error al procesar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Fecha,Sede,Paciente,Medico,Servicio,Total USD,Tasa,Total Local,UNIMECO USD,Medico USD,Costos USD,Neto UNIMECO USD\n";
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.createdAt).toLocaleDateString();
      const row = `${t.id},${date},${t.sedeAtencion},${t.patient?.name || t.patient?.username || ''},${t.doctor?.name || t.doctor?.username || ''},${t.serviceType},${t.totalAmountUSD},${t.exchangeRate},${t.totalAmountLocal},${t.unimecoAmount},${t.doctorAmount},${t.operativeCosts},${t.netAmount}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_caja_${filterPeriod}_${filterDoctorId !== 'Todos' ? 'medico_' + filterDoctorId : 'todos'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <p className="text-red-500 font-medium">No tienes permisos para acceder a Finanzas y Caja.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <header className="dashboard-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Gestión Administrativa (Caja)</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Panel de control financiero, registro de pagos y auditoría.</p>
          </div>
          <div className="dashboard-actions">
            <Button variant="outline" onClick={handleExportCSV} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Download size={16} /> Exportar CSV
            </Button>
          </div>
        </header>

        {successMsg && (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', fontWeight: '500', fontSize: '0.9rem' }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-alert)', fontWeight: '500', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <div className="responsive-grid-1-2">
          
          {/* PANEL DE REGISTRO DE INGRESOS */}
          <Card title="Control de Ingresos" action={<Wallet size={20} style={{ color: 'var(--color-accent)' }} />} className="glass-panel">
            <form onSubmit={handleRegisterPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="input-group">
                <label className="input-label">Paciente *</label>
                <select className="input-field" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                  <option value="">Seleccione Paciente...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.username})</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Médico Tratante *</label>
                <select className="input-field" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                  <option value="">Seleccione Médico...</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.username})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Sede</label>
                  <select className="input-field" value={sedeAtencion} onChange={(e) => setSedeAtencion(e.target.value)}>
                    {availableSedes.map(sede => (
                      <option key={sede} value={sede}>{sede}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Servicio</label>
                  <select className="input-field" value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                    <option value="Servicios prestados en consultorio">En consultorio</option>
                    <option value="Servicios prestados fuera del consultorio">Fuera de consultorio</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'flex-end' }}>
                <Input label="Monto Total (USD) *" type="number" step="0.01" value={totalAmountUSD} onChange={(e) => setTotalAmountUSD(e.target.value)} required />
                
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      Tasa BCV (Bs/USD) *
                      {bcvDateInfo && (
                        <small style={{ fontSize: '0.72rem', color: 'var(--color-primary)', fontWeight: '600' }}>
                          ({bcvDateInfo})
                        </small>
                      )}
                    </span>
                    {loadingRate ? (
                      <RefreshCw size={14} className="spin" style={{ color: 'var(--color-primary)' }} />
                    ) : (
                      <button type="button" onClick={() => fetchBCVRate(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }} title="Actualizar Tasa BCV (En Vivo)">
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </label>
                  <input 
                    className="input-field" 
                    type="text" 
                    inputMode="decimal" 
                    placeholder="0.00"
                    value={exchangeRate} 
                    onChange={(e) => setExchangeRate(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                Equivalente Local: <strong>Bs. {totalLocal.toFixed(2)}</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary)' }}>Distribución y Costos</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'flex-end' }}>
                <Input label={`% Retención ${clinicName}`} type="number" value={unimecoPercentage} onChange={(e) => setUnimecoPercentage(e.target.value)} disabled={!isMaster} />
                <Input label="% Honorarios Médico" type="number" value={doctorPercentage} onChange={(e) => setDoctorPercentage(e.target.value)} disabled={!isMaster} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'flex-end' }}>
                <Input label="Costos Operativos (USD)" type="number" step="0.01" value={operativeCosts} onChange={(e) => setOperativeCosts(e.target.value)} />
                <Input label="Incentivos/Bonos (USD)" type="number" step="0.01" value={incentives} onChange={(e) => setIncentives(e.target.value)} />
              </div>

              <div style={{ padding: '1rem', background: 'var(--color-secondary-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Bruto Clínica ({clinicName}):</span>
                  <strong>${unimecoAmount.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Honorarios Médico:</span>
                  <strong>${doctorAmount.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                  <span>NETO CLÍNICA (Menos costos):</span>
                  <strong style={{ color: netUnimecoAmount > 0 ? 'var(--color-success)' : 'var(--color-alert)' }}>${netUnimecoAmount.toFixed(2)}</strong>
                </div>
              </div>

              <Button type="submit" fullWidth disabled={submitting} style={{ marginTop: '0.5rem' }}>
                {submitting ? 'Procesando Pago...' : 'Registrar Pago y Distribuir'}
              </Button>
            </form>
          </Card>

          {/* PANEL DE REPORTES DE CAJA */}
          <Card 
            title="Historial y Liquidación de Caja" 
            action={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button variant="outline" size="sm" onClick={handleExportCSV} style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                  <Download size={14} /> Exportar CSV
                </Button>
              </div>
            } 
            className="glass-panel"
          >
            {/* Barra de Filtros de Período y Médico */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: '1 1 200px' }}>
                <User size={16} color="var(--color-primary)" />
                <select 
                  className="input-field" 
                  value={filterDoctorId} 
                  onChange={(e) => setFilterDoctorId(e.target.value)}
                  style={{ height: '38px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="Todos">Todos los Médicos ({doctors.length})</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>Dr(a). {d.name} ({d.username})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: '1 1 180px' }}>
                <Calendar size={16} color="var(--color-primary)" />
                <select 
                  className="input-field" 
                  value={filterPeriod} 
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  style={{ height: '38px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="este_mes">Este Mes en Curso</option>
                  <option value="esta_semana">Esta Semana (Lun-Dom)</option>
                  <option value="semana_anterior">Semana Anterior</option>
                  <option value="mes_anterior">Mes Anterior</option>
                  <option value="todos">Todo el Historial</option>
                  <option value="personalizado">Rango Personalizado...</option>
                </select>
              </div>

              {filterPeriod === 'personalizado' && (
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={filterStartDate} 
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    style={{ height: '38px', padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
                    title="Fecha Desde"
                  />
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>a</span>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={filterEndDate} 
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    style={{ height: '38px', padding: '0.35rem 0.5rem', fontSize: '0.82rem' }}
                    title="Fecha Hasta"
                  />
                </div>
              )}

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('detallado')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: activeViewTab === 'detallado' ? 'var(--color-primary)' : '#e2e8f0',
                    color: activeViewTab === 'detallado' ? 'white' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  Detalle ({filteredTransactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('liquidacion')}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: activeViewTab === 'liquidacion' ? 'var(--color-primary)' : '#e2e8f0',
                    color: activeViewTab === 'liquidacion' ? 'white' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  Resumen por Médico ({doctorSummaries.length})
                </button>
              </div>
            </div>

            {/* Tarjetas de Totales Dinámicos del Filtro */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>TOTAL COBRADO</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>${filteredTotals.grossUSD.toFixed(2)}</span>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {filteredTotals.count} consulta{filteredTotals.count !== 1 ? 's' : ''} {filteredTotals.totalLocal > 0 ? `• Bs. ${filteredTotals.totalLocal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
                </span>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.25)' }}>
                <span style={{ fontSize: '0.72rem', color: '#1d4ed8', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>
                  {filterDoctorId !== 'Todos' 
                    ? `A PAGAR AL DR(A). ${(doctors.find(d => String(d.id) === String(filterDoctorId))?.name || 'MÉDICO').toUpperCase()}` 
                    : 'HONORARIOS MÉDICOS TOTALES'}
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1d4ed8' }}>${filteredTotals.doctorUSD.toFixed(2)}</span>
                <span style={{ fontSize: '0.72rem', color: '#2563eb', display: 'block', marginTop: '2px' }}>Liquidación calculada</span>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <span style={{ fontSize: '0.72rem', color: '#047857', display: 'block', fontWeight: '700', textTransform: 'uppercase' }}>NETO {clinicName.toUpperCase()}</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#047857' }}>${filteredTotals.clinicNetUSD.toFixed(2)}</span>
                <span style={{ fontSize: '0.72rem', color: '#059669', display: 'block', marginTop: '2px' }}>
                  {filteredTotals.costsUSD > 0 ? `Deducidos $${filteredTotals.costsUSD.toFixed(2)} en costos` : 'Sin costos descontados'}
                </span>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos financieros...</div>
            ) : filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--color-text-muted)' }}>
                <p style={{ fontSize: '1rem', fontWeight: '500' }}>No se encontraron transacciones en este período o para el médico seleccionado.</p>
                <button
                  type="button"
                  onClick={() => { setFilterDoctorId('Todos'); setFilterPeriod('todos'); }}
                  style={{ marginTop: '0.5rem', padding: '0.4rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >
                  Ver Todo el Historial
                </button>
              </div>
            ) : activeViewTab === 'liquidacion' ? (
              /* TABLA RESUMEN DE LIQUIDACIÓN AGRUPADA POR MÉDICO */
              <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Médico Tratante</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Nº Consultas</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Total Facturado</th>
                      <th style={{ padding: '0.6rem 0.5rem', color: '#2563eb' }}>Honorarios a Pagar al Médico</th>
                      <th style={{ padding: '0.6rem 0.5rem', color: '#059669' }}>Retención para {clinicName}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorSummaries.map(doc => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                          Dr(a). {doc.name}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                          <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '700', color: '#475569' }}>
                            {doc.count}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>
                          ${doc.grossUSD.toFixed(2)}
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '0.95rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                            ${doc.doctorUSD.toFixed(2)}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>
                          <span style={{ fontWeight: '700', color: '#047857' }}>
                            ${doc.clinicNetUSD.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* TABLA DETALLADA DE TRANSACCIONES */
              <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      <th style={{ padding: '0.6rem 0.5rem' }}>ID</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Fecha</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Paciente</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Médico Tratante</th>
                      <th style={{ padding: '0.6rem 0.5rem' }}>Total Cobrado</th>
                      <th style={{ padding: '0.6rem 0.5rem', color: '#2563eb' }}>Honorarios Médico</th>
                      <th style={{ padding: '0.6rem 0.5rem', color: '#059669' }}>Neto {clinicName}</th>
                      <th style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(t => {
                      const totalUSD = parseFloat(t.totalAmountUSD) || 0;
                      const docAmt = parseFloat(t.doctorAmount) || 0;
                      const netAmt = parseFloat(t.netAmount) || 0;
                      const costs = (parseFloat(t.operativeCosts) || 0) + (parseFloat(t.incentives) || 0);
                      const docPerc = Number(parseFloat(t.doctorPercentage || 70).toFixed(2));
                      const clinPerc = Number(parseFloat(t.unimecoPercentage || 30).toFixed(2));
                      const doctorName = t.doctor?.name || t.doctor?.username || 'Médico';

                      return (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: 'var(--color-text-muted)' }}>#{t.id}</td>
                          <td style={{ padding: '0.75rem 0.5rem', whiteSpace: 'nowrap' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{t.patient?.name || t.patient?.username || 'Paciente'}</td>
                          <td style={{ padding: '0.75rem 0.5rem' }}>Dr(a). {doctorName}</td>
                          
                          {/* Total Cobrado */}
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ fontWeight: '700', color: 'var(--color-text-main)', fontSize: '0.92rem' }}>${totalUSD.toFixed(2)}</div>
                            {t.totalAmountLocal && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                Bs. {parseFloat(t.totalAmountLocal).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </td>

                          {/* Cuánto le queda al Médico */}
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ 
                              display: 'inline-flex', 
                              flexDirection: 'column',
                              backgroundColor: 'rgba(37, 99, 235, 0.08)', 
                              border: '1px solid rgba(37, 99, 235, 0.25)', 
                              borderRadius: '6px', 
                              padding: '0.3rem 0.55rem',
                              minWidth: '110px'
                            }}>
                              <span style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '0.92rem' }}>
                                ${docAmt.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: '600' }}>
                                A {doctorName} ({docPerc}%)
                              </span>
                            </div>
                          </td>

                          {/* Cuánto le queda a la Clínica */}
                          <td style={{ padding: '0.75rem 0.5rem' }}>
                            <div style={{ 
                              display: 'inline-flex', 
                              flexDirection: 'column',
                              backgroundColor: netAmt >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', 
                              border: `1px solid ${netAmt >= 0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`, 
                              borderRadius: '6px', 
                              padding: '0.3rem 0.55rem',
                              minWidth: '110px'
                            }}>
                              <span style={{ fontWeight: '800', color: netAmt >= 0 ? '#047857' : '#b91c1c', fontSize: '0.92rem' }}>
                                ${netAmt.toFixed(2)}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: netAmt >= 0 ? '#059669' : '#dc2626', fontWeight: '600' }}>
                                A {clinicName} ({clinPerc}%{costs > 0 ? ` - $${costs.toFixed(2)}` : ''})
                              </span>
                            </div>
                          </td>

                          {/* Comprobante / Recibo */}
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTransactionForPrint(t)}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              title="Imprimir Comprobante Oficial"
                            >
                              <Printer size={13} /> Recibo
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RESUMEN ANUAL ANCLADO */}
        {summary && (
          <div className="responsive-grid-4" style={{ marginTop: '1rem' }}>
            <Card className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Ingreso Bruto Anual ({summary.year})</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>${summary.totalGrossUSD.toFixed(2)}</div>
            </Card>
            <Card className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Honorarios Médicos Acumulados</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-accent)' }}>${summary.totalDoctorUSD.toFixed(2)}</div>
            </Card>
            <Card className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Total Costos Operativos</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-alert)' }}>${summary.totalCostsUSD.toFixed(2)}</div>
            </Card>
            <Card className="glass-panel" style={{ padding: '1.25rem' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Utilidad Neta ({clinicName})</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)' }}>${summary.netUnimecoUSD.toFixed(2)}</div>
            </Card>
          </div>
        )}

        {/* MODAL DE COMPROBANTE OFICIAL DE PAGO */}
        <MedicalDocumentModal
          isOpen={Boolean(selectedTransactionForPrint)}
          onClose={() => setSelectedTransactionForPrint(null)}
          type="billing_receipt"
          data={{
            serviceType: selectedTransactionForPrint?.serviceType,
            patient: selectedTransactionForPrint?.patient,
            doctor: selectedTransactionForPrint?.doctor,
            creatorName: selectedTransactionForPrint?.creator?.name || currentUser.name,
            totalAmountUSD: selectedTransactionForPrint?.totalAmountUSD,
            exchangeRate: selectedTransactionForPrint?.exchangeRate,
            totalAmountLocal: selectedTransactionForPrint?.totalAmountLocal,
            date: selectedTransactionForPrint ? new Date(selectedTransactionForPrint.createdAt).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }) : '',
            sede: selectedTransactionForPrint?.sedeAtencion || 'CENTRAL'
          }}
        />

      </div>
    </DashboardLayout>
  );
}

export default Modulo3_GestionAdministrativa;
