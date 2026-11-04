import React, { useState, useEffect } from 'react';
import { 
  Download, Shield, Lock, Laptop, HardDrive, CheckCircle2, 
  ExternalLink, Users, Activity, LogIn
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import licenseService from '../../services/licenseService';
import './SaraWebPortal.css';

export default function SaraWebPortal() {
  const navigate = useNavigate();

  // Estados de Descarga & Software
  const [downloadInfo, setDownloadInfo] = useState({
    version: '2.4.0',
    build: '2026.10-PROD',
    releaseDate: 'Octubre 2026',
    appName: 'SARA Desktop - Sistema Automatizado de Registro Asistencial',
    architecture: 'Windows x64 (64-bit)',
    minOs: 'Windows 10 / Windows 11',
    fileSize: '84.6 MB',
    sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
  });
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadingType, setDownloadingType] = useState('exe');

  // Cargar información de descarga al montar
  useEffect(() => {
    licenseService.getDownloadInfo()
      .then(info => {
        if (info) setDownloadInfo(info);
      })
      .catch(() => {});
  }, []);

  // Iniciar descarga del instalador o versión portable
  const handleStartDownload = (type = 'exe') => {
    setDownloadingType(type);
    setShowDownloadModal(true);

    // Disparar la descarga real del archivo con cache buster
    let downloadUrl = `/api/licenses/download/setup?t=${Date.now()}`;
    let filename = 'SARA_Setup_v2.4.0.exe';

    if (type === 'portable') {
      downloadUrl = `/api/licenses/download/setup?type=portable&t=${Date.now()}`;
      filename = 'SARA_Portable_v2.4.0.zip';
    } else if (type === 'direct') {
      downloadUrl = `/api/licenses/download/setup?type=direct&t=${Date.now()}`;
      filename = 'SARA.exe';
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="sara-web-wrapper">
      {/* Efectos ambientales de fondo */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* ====================================================================
          NAVBAR PRINCIPAL
          ==================================================================== */}
      <nav className="portal-navbar">
        <a href="#inicio" className="portal-brand">
          <div className="portal-logo-icon">
            <Shield size={24} />
          </div>
          <div className="portal-brand-text">
            <h1>SARA MED</h1>
            <span>Sistema Asistencial de Registro Automatizado</span>
          </div>
        </a>


        <div className="portal-nav-actions">
          <button 
            className="btn-portal-secondary"
            onClick={() => navigate('/users/login')}
            title="Acceso para Pacientes a su Historia Médica"
          >
            <Users size={16} /> Portal Pacientes
          </button>

          <button 
            className="btn-portal-secondary"
            onClick={() => navigate('/login')}
            style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
            title="Iniciar sesión en la Clínica"
          >
            <LogIn size={16} /> Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* ====================================================================
          HERO SECTION & DESCARGA RÁPIDA
          ==================================================================== */}
      <header className="portal-hero" id="inicio">
        <div className="hero-pill-badge">
          <span className="pulse-dot-green"></span>
          <span>Versión Oficial {downloadInfo.version} Disponible &bull; Build 2026</span>
        </div>

        <h1 className="hero-main-title">
          Inteligencia Médica &amp; Control Clínico<br />
          <span className="gradient-text-teal">Directo en tu Estación de Trabajo</span>
        </h1>

        <p className="hero-subtitle">
          SARA combina gestión administrativa, historias clínicas avanzadas, caja multimoneda
          y diagnóstico asistido con Inteligencia Artificial en una aplicación nativa de alto rendimiento.
        </p>

        {/* Botonera de Acción Primaria */}
        <div className="hero-cta-group">
          <button 
            className="btn-hero-download"
            onClick={() => handleStartDownload('exe')}
          >
            <Download size={20} />
            <span>Descargar para Windows</span>
          </button>

          <button 
            className="btn-hero-web"
            onClick={() => navigate('/login')}
          >
            <span>Acceder a la Versión Web</span>
            <ExternalLink size={18} />
          </button>
        </div>

        </header>

      {/* ====================================================================
          SECCIÓN: CENTRO DE DESCARGAS DEL SOFTWARE
          ==================================================================== */}
      <section className="portal-section" id="descargas">
        <div className="section-header-center">
          <span className="section-tag">Zona de Descarga Oficial</span>
          <h2>Elige tu Formato de Instalación</h2>
          <p>Instala SARA en tus estaciones médicas de trabajo o accede al instante vía web.</p>
        </div>

        <div className="downloads-grid">
          {/* Tarjeta 1: Instalador Windows Completo */}
          <div className="download-card featured">
            <span className="featured-ribbon">Recomendado</span>
            
            <div className="card-os-icon">
              <Laptop size={32} />
            </div>

            <div className="card-title-group">
              <h3>SARA para Windows (.exe)</h3>
              <div className="card-meta-row">
                <span>Versión {downloadInfo.version}</span>
                <span>&bull;</span>
                <span>{downloadInfo.fileSize}</span>
                <span>&bull;</span>
                <span>64-bit</span>
              </div>
            </div>

            <ul className="card-features-list">
              <li><CheckCircle2 size={16} /> Asistente de instalación guiado paso a paso</li>
              <li><CheckCircle2 size={16} /> Icono y acceso directo en el Escritorio</li>
              <li><CheckCircle2 size={16} /> Modo sin conexión y sincronización local</li>
              <li><CheckCircle2 size={16} /> Máxima velocidad y aceleración por GPU</li>
            </ul>

            <button 
              className="btn-card-download primary"
              onClick={() => handleStartDownload('exe')}
            >
              <Download size={18} />
              <span>Descargar Instalador (.exe)</span>
            </button>
          </div>

          {/* Tarjeta 2: Versión Portable / ZIP */}
          <div className="download-card">
            <div className="card-os-icon">
              <HardDrive size={32} color="#38bdf8" />
            </div>

            <div className="card-title-group">
              <h3>SARA Versión Portable (.zip)</h3>
              <div className="card-meta-row">
                <span>Versión {downloadInfo.version}</span>
                <span>&bull;</span>
                <span>Sin Instalación</span>
              </div>
            </div>

            <ul className="card-features-list">
              <li><CheckCircle2 size={16} /> Ejecuta directamente sin permisos de administrador</li>
              <li><CheckCircle2 size={16} /> Ideal para pendrives y consultorios móviles</li>
              <li><CheckCircle2 size={16} /> No modifica el registro de Windows</li>
              <li><CheckCircle2 size={16} /> Compatible con terminales restringidas</li>
            </ul>

            <button 
              className="btn-card-download secondary"
              onClick={() => handleStartDownload('portable')}
            >
              <Download size={18} />
              <span>Descargar Paquete ZIP</span>
            </button>
          </div>

          {/* Tarjeta 3: SARA Cloud Web App (PWA) */}
          <div className="download-card">
            <div className="card-os-icon">
              <Activity size={32} color="#fbbf24" />
            </div>

            <div className="card-title-group">
              <h3>SARA Cloud Web (PWA)</h3>
              <div className="card-meta-row">
                <span>Acceso Inmediato</span>
                <span>&bull;</span>
                <span>Multiplataforma</span>
              </div>
            </div>

            <ul className="card-features-list">
              <li><CheckCircle2 size={16} /> Compatible con Tablets, iPads y laptops</li>
              <li><CheckCircle2 size={16} /> Sin descargar archivos pesados</li>
              <li><CheckCircle2 size={16} /> Acceso seguro con certificado SSL/HTTPS</li>
              <li><CheckCircle2 size={16} /> Opción de anclar a la barra de tareas</li>
            </ul>

            <button 
              className="btn-card-download secondary"
              onClick={() => navigate('/login')}
            >
              <ExternalLink size={18} />
              <span>Abrir SARA en el Navegador</span>
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          GUÍA RÁPIDA DE INSTALACIÓN EN 3 PASOS
          ==================================================================== */}
      <section className="portal-section" id="guia" style={{ paddingTop: 0 }}>
        <div className="section-header-center">
          <span className="section-tag">Fácil y Rápido</span>
          <h2>Cómo Empezar a Usar SARA</h2>
          <p>Tu clínica lista para operar en menos de 3 minutos.</p>
        </div>

        <div className="steps-container">
          <div className="step-box">
            <div className="step-number">1</div>
            <h4>Descarga el Instalador</h4>
            <p>Haz clic en el botón de descarga para obtener el paquete de instalación oficial para Windows (64-bit).</p>
          </div>

          <div className="step-box">
            <div className="step-number">2</div>
            <h4>Ejecuta el Asistente</h4>
            <p>Abre el archivo descargado. Si Windows SmartScreen muestra aviso de protección por ser una app médica nueva, pulsa <strong>"Más información"</strong> y luego <strong>"Ejecutar de todas formas"</strong>.</p>
          </div>

          <div className="step-box">
            <div className="step-number">3</div>
            <h4>Inicia Sesión y Activa</h4>
            <p>Ingresa con tu usuario y contraseña institucional, o canjea la clave criptográfica proporcionada por tu distribuidor autorizado.</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MÓDULOS DE SARA
          ==================================================================== */}
      <section className="portal-section" id="caracteristicas">
        <div className="section-header-center">
          <span className="section-tag">Capacidades del Sistema</span>
          <h2>7 Módulos de Grado Hospitalario</h2>
          <p>Una arquitectura diseñada para cubrir todas las áreas de la práctica médica moderna.</p>
        </div>

        <div className="downloads-grid">
          <div className="step-box">
            <h4>1. Control de Acceso &amp; Roles</h4>
            <p>Separación estricta de perfiles: Administrador, Médico, Recepcionista y Paciente con auditoría forense.</p>
          </div>

          <div className="step-box">
            <h4>2. Recepción &amp; Pacientes</h4>
            <p>Registro demográfico, control de primera vez vs reconsulta, apertura rápida y carnet digital.</p>
          </div>

          <div className="step-box">
            <h4>3. Caja &amp; Facturación Multimoneda</h4>
            <p>Soporte de tasas BCV y Paralelo en vivo, cobros en USD/VES, arqueo de caja e impresión de facturas.</p>
          </div>

          <div className="step-box">
            <h4>4. Estación Clínica &amp; Asistente IA</h4>
            <p>Signos vitales, HCE, catálogo farmacológico, plantillas personalizadas y síntesis clínica con Google Gemini.</p>
          </div>

          <div className="step-box">
            <h4>5. Citas &amp; Sala de Espera</h4>
            <p>Calendario dinámico por sede médica, gestión de turnos y sincronización con el portal del paciente.</p>
          </div>

          <div className="step-box">
            <h4>6. Estudios &amp; Procedimientos</h4>
            <p>Rayos X, Ultrasonido, Laboratorio, Endoscopias, toma de biopsias e informes descargables en PDF.</p>
          </div>

          <div className="step-box">
            <h4>7. Gestión Médica Estadística</h4>
            <p>Métricas de productividad, reportes de morbilidad, resúmenes contables y exportación ejecutiva.</p>
          </div>
        </div>
      </section>

      {/* ====================================================================
          MODAL DE DIÁLOGO: DESCARGA INICIADA
          ==================================================================== */}
      {showDownloadModal && (
        <div className="download-dialog-overlay" onClick={() => setShowDownloadModal(false)}>
          <div className="download-dialog-card" onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#34d399' }}>
              <Download size={28} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem', color: '#fff', fontSize: '1.4rem' }}>
              ¡Tu Descarga Ha Comenzado!
            </h3>
            <p style={{ color: 'var(--portal-text-muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              {downloadingType === 'portable' 
                ? <>El paquete <strong>SARA_Portable_v2.4.0.zip</strong> se está guardando en tu carpeta de Descargas. Solo debes descomprimirlo y ejecutar <code>SARA.exe</code>.</>
                : downloadingType === 'direct'
                ? <>El ejecutable nativo <strong>SARA.exe</strong> se está guardando en tu carpeta de Descargas. Puedes ejecutarlo directamente sin instalar nada.</>
                : <>El instalador <strong>SARA_Setup_v2.4.0.exe</strong> se está guardando en tu carpeta de Descargas.</>
              }
            </p>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1rem', borderRadius: '10px', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <span style={{ display: 'block', fontWeight: 700, color: '#38bdf8', marginBottom: '0.4rem' }}>
                💡 Instrucciones si Windows SmartScreen muestra un aviso:
              </span>
              <p style={{ margin: 0, color: 'var(--portal-text-muted)' }}>
                1. Haz clic en <strong>"Más información"</strong> en la ventana emergente.<br />
                2. Luego haz clic en <strong>"Ejecutar de todas formas"</strong> para iniciar SARA de manera segura.
              </p>
            </div>

            <button 
              className="btn-card-download primary"
              onClick={() => setShowDownloadModal(false)}
            >
              <span>Entendido, Cerrar</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          FOOTER
          ==================================================================== */}
      <footer className="portal-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <h4 style={{ margin: 0, color: '#fff' }}>SARA Medical Systems</h4>
            <p>&copy; {new Date().getFullYear()} SARA. Todos los derechos reservados. Diseñado para centros médicos de excelencia.</p>
          </div>

          <div className="footer-right">
            <button className="portal-nav-link" onClick={() => navigate('/login')}>
              Acceso Clínico
            </button>
            <button className="portal-nav-link" onClick={() => navigate('/users/login')}>
              Portal Pacientes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
