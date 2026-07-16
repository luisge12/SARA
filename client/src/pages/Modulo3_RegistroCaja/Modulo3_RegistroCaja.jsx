import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import api from '../../services/api';
import { Wallet, Receipt, Calculator, Download, DollarSign, TrendingUp, HeartPulse, FileText, RefreshCw } from 'lucide-react';

function Modulo3_GestionAdministrativa() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const hasAccess = ['Master', 'Administrador', 'Recepcionista'].includes(currentUser.role);
  const isMaster = currentUser.role === 'Master';
  const isRecepcionista = currentUser.role === 'Recepcionista';

  // Form states
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [sedeAtencion, setSedeAtencion] = useState('CENTRAL');
  const [serviceType, setServiceType] = useState('Servicios prestados en consultorio');
  const [totalAmountUSD, setTotalAmountUSD] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [unimecoPercentage, setUnimecoPercentage] = useState('30');
  const [doctorPercentage, setDoctorPercentage] = useState('70');
  const [operativeCosts, setOperativeCosts] = useState('0');
  const [incentives, setIncentives] = useState('0');

  // Computed states
  const totalLocal = (parseFloat(totalAmountUSD) || 0) * (parseFloat(exchangeRate) || 0);
  const grossUSD = parseFloat(totalAmountUSD) || 0;
  const unimecoAmount = grossUSD * ((parseFloat(unimecoPercentage) || 0) / 100);
  const doctorAmount = grossUSD * ((parseFloat(doctorPercentage) || 0) / 100);
  const netUnimecoAmount = unimecoAmount - (parseFloat(operativeCosts) || 0) - (parseFloat(incentives) || 0);

  // Data states
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingRate, setLoadingRate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBCVRate = async () => {
    try {
      setLoadingRate(true);
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (res.ok) {
        const data = await res.json();
        if (data && data.promedio) {
          setExchangeRate(data.promedio.toString());
        }
      }
    } catch (err) {
      console.error('Error fetching BCV rate:', err);
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
      setDoctors(allUsers.filter(u => u.role === 'Médico'));
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

    try {
      const payload = {
        patientId,
        doctorId,
        sedeAtencion,
        serviceType,
        totalAmountUSD: grossUSD,
        exchangeRate: parseFloat(exchangeRate) || 0,
        totalAmountLocal: totalLocal,
        unimecoPercentage: parseFloat(unimecoPercentage) || 0,
        doctorPercentage: parseFloat(doctorPercentage) || 0,
        unimecoAmount,
        doctorAmount,
        operativeCosts: parseFloat(operativeCosts) || 0,
        incentives: parseFloat(incentives) || 0,
        netAmount: netUnimecoAmount
      };

      await api.post('/api/billing/transactions', payload);
      setSuccessMsg('Pago registrado exitosamente.');
      
      // Reset form
      setPatientId('');
      setDoctorId('');
      setTotalAmountUSD('');
      setExchangeRate('');
      setOperativeCosts('0');
      setIncentives('0');

      fetchInitialData();
    } catch (err) {
      console.error('Error:', err);
      setErrorMsg(err.response?.data?.error || 'Error al procesar el pago.');
    }
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Fecha,Sede,Paciente,Medico,Servicio,Total USD,Tasa,Total Local,UNIMECO USD,Medico USD,Costos USD,Neto UNIMECO USD\n";
    
    transactions.forEach(t => {
      const date = new Date(t.createdAt).toLocaleDateString();
      const row = `${t.id},${date},${t.sedeAtencion},${t.patient?.name},${t.doctor?.name},${t.serviceType},${t.totalAmountUSD},${t.exchangeRate},${t.totalAmountLocal},${t.unimecoAmount},${t.doctorAmount},${t.operativeCosts},${t.netAmount}`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_flujo_caja.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Acceso Restringido</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        <header style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-primary)' }}>Gestión Administrativa (Caja)</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Panel de control financiero, registro de pagos y auditoría.</p>
          </div>
          <Button variant="outline" onClick={handleExportCSV} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={16} /> Exportar CSV
          </Button>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          
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
                    <option value="CENTRAL">CENTRAL</option>
                    <option value="GMSP">GMSP</option>
                    <option value="CCMLA">CCMLA</option>
                    <option value="PLA">PLA</option>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input label="Monto Total (USD) *" type="number" step="0.01" value={totalAmountUSD} onChange={(e) => setTotalAmountUSD(e.target.value)} required />
                
                <div className="input-group">
                  <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tasa BCV (Bs/USD) *</span>
                    {loadingRate ? (
                      <RefreshCw size={14} className="spin" style={{ color: 'var(--color-primary)' }} />
                    ) : (
                      <button type="button" onClick={fetchBCVRate} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-primary)' }} title="Actualizar Tasa BCV">
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </label>
                  <input className="input-field" type="number" step="0.01" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} required />
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                Equivalente Local: <strong>Bs. {totalLocal.toFixed(2)}</strong>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }}></div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-primary)' }}>Distribución y Costos</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input label="% Retención UNIMECO" type="number" value={unimecoPercentage} onChange={(e) => setUnimecoPercentage(e.target.value)} disabled={!isMaster} />
                <Input label="% Honorarios Médico" type="number" value={doctorPercentage} onChange={(e) => setDoctorPercentage(e.target.value)} disabled={!isMaster} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input label="Costos Operativos (USD)" type="number" step="0.01" value={operativeCosts} onChange={(e) => setOperativeCosts(e.target.value)} />
                <Input label="Incentivos/Bonos (USD)" type="number" step="0.01" value={incentives} onChange={(e) => setIncentives(e.target.value)} />
              </div>

              <div style={{ padding: '1rem', background: 'var(--color-secondary-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Bruto Clínica (UNIMECO):</span>
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

              <Button type="submit" fullWidth style={{ marginTop: '0.5rem' }}>
                Registrar Pago y Distribuir
              </Button>
            </form>
          </Card>

          {/* PANEL DE REPORTES DE CAJA */}
          <Card title="Historial de Transacciones" action={<FileText size={20} style={{ color: 'var(--color-primary)' }} />} className="glass-panel">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando datos financieros...</div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>No hay pagos registrados.</div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem' }}>ID</th>
                      <th style={{ padding: '0.5rem' }}>Fecha</th>
                      <th style={{ padding: '0.5rem' }}>Paciente</th>
                      <th style={{ padding: '0.5rem' }}>Médico</th>
                      <th style={{ padding: '0.5rem' }}>Total USD</th>
                      <th style={{ padding: '0.5rem' }}>UNIMECO</th>
                      <th style={{ padding: '0.5rem' }}>Neto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem 0.5rem' }}>#{t.id}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{t.patient?.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>{t.doctor?.name}</td>
                        <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>${t.totalAmountUSD}</td>
                        <td style={{ padding: '0.75rem 0.5rem' }}>${t.unimecoAmount}</td>
                        <td style={{ padding: '0.75rem 0.5rem', color: t.netAmount > 0 ? 'var(--color-success)' : 'inherit' }}>${t.netAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* RESUMEN ANUAL ANCLADO */}
        {summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
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
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Utilidad Neta (UNIMECO)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)' }}>${summary.netUnimecoUSD.toFixed(2)}</div>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Modulo3_GestionAdministrativa;
