import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, LogOut, User, X, CalendarPlus } from 'lucide-react';
import { portalApi } from '../../services/api';
import { Button } from '../../components/Button';
import './PortalPacienteSidebar.css';

export function PortalPacienteSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const userStr = localStorage.getItem('portal_user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_user');
    setIsMobileMenuOpen(false);
    navigate('/users/login');
  };

  const [showRequestModal, setShowRequestModal] = React.useState(false);
  const [requestForm, setRequestForm] = React.useState({ reason: '', priority: 'Normal' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await portalApi.post(`/api/patients/${user.id}/request-appointment`, requestForm);
      alert('Solicitud enviada con éxito. El médico será notificado y la agendará pronto.');
      setShowRequestModal(false);
      setRequestForm({ reason: '', priority: 'Normal' });
    } catch (err) {
      console.error(err);
      alert('Error al enviar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        className="portal-mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={isMobileMenuOpen ? "Cerrar Menú" : "Abrir Menú"}
      >
        {isMobileMenuOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
      </button>
      <div
        className={`portal-sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <aside className={`portal-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="portal-sidebar-header">
          <NavLink to="/users/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ textDecoration: 'none' }}>
            <div className="portal-sidebar-logo">
              <Activity size={24} className="portal-sidebar-logo-icon" />
              <h2>SARA</h2>
            </div>
          </NavLink>
          <p className="portal-sidebar-subtitle">Portal del Paciente</p>
        </div>

        <div className="portal-sidebar-user-info">
          <div className="portal-sidebar-user-avatar">
            <User size={20} />
          </div>
          <div className="portal-sidebar-user-details">
            <span className="portal-sidebar-user-name">{user?.name || 'Paciente'}</span>
            <span className="portal-sidebar-user-role">{user?.role || 'Paciente'}</span>
          </div>
        </div>

        <nav className="portal-sidebar-nav">
          <ul>
            <li>
              <NavLink
                to="/users/historia-medica"
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Activity size={20} />
                <span>Historia Médica</span>
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="portal-sidebar-footer">
          <button 
            onClick={() => setShowRequestModal(true)} 
            className="portal-sidebar-logout-btn" 
            style={{ backgroundColor: 'var(--color-primary)', color: 'white', marginBottom: '1rem' }}
          >
            <CalendarPlus size={20} />
            <span>Solicitar Consulta</span>
          </button>
          <button onClick={handleLogout} className="portal-sidebar-logout-btn">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* MODAL DE SOLICITUD DE CONSULTA */}
      {showRequestModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Solicitar Consulta</h2>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="form-group">
                <label>Motivo de Consulta (Breve)</label>
                <textarea 
                  required
                  rows={3}
                  className="hm-textarea"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                  value={requestForm.reason}
                  onChange={e => setRequestForm({...requestForm, reason: e.target.value})}
                  placeholder="Ej: Dolor de cabeza frecuente..."
                ></textarea>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Nivel de Prioridad</label>
                <select 
                  className="hm-input"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                  value={requestForm.priority}
                  onChange={e => setRequestForm({...requestForm, priority: e.target.value})}
                >
                  <option value="Baja">Baja (Chequeo Rutina)</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Emergencia">Emergencia</option>
                </select>
              </div>
              <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Button variant="outline" type="button" onClick={() => setShowRequestModal(false)}>Cancelar</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

