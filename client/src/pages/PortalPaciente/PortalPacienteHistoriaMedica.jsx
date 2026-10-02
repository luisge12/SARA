import React, { useState, useEffect } from 'react';
import './PortalPacienteHistoriaMedica.css';
import { User, Activity, Heart, Weight, Printer } from 'lucide-react';
import { portalApi } from '../../services/api';
import { Button } from '../../components/Button';
import { MedicalDocumentModal } from '../../components/MedicalDocumentModal';

export function PortalPacienteHistoriaMedica() {
  const userStr = localStorage.getItem('portal_user');
  const user = userStr ? JSON.parse(userStr) : {};
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const p = res.data?.patientProfile || {};
        setFormData({
          ocupacion: p.ocupacion || '',
          estadoCivil: p.customFields?.estadoCivil || '',
          nacionalidad: p.customFields?.nacionalidad || '',
          residencia: p.customFields?.residencia || '',
          escolaridad: p.customFields?.escolaridad || '',
          religion: p.customFields?.religion || '',
          heredofamiliares: p.customFields?.heredofamiliares || {
            padres: { vivos: '', fallecidos: '', causas: '' },
            hermanos: { vivos: '', fallecidos: '', causas: '' },
            hijos: { vivos: '', fallecidos: '', causas: '' },
            enfermedades: { diabetes: false, hipertension: false, tuberculosis: false, cancer: false, otras: '', otrasDetalle: '' }
          },
          noPatologicos: p.customFields?.noPatologicos || {
            toxicos: { alcohol: '', tabaco: '', drogas: '' },
            fisiologicos: { alimentacion: '', dipsia: '', diuresis: '', catarsis: '', somnia: '', otros: '' }
          },
          patologicos: p.customFields?.patologicos || {
            infancia: '', adulto: '',
            enfermedades: { diabetes: false, hipertension: false, tuberculosis: false, cancer: false, otras: '', otrasDetalle: '' },
            quirurgicos: '', traumatologicos: '', alergicos: '', otros: ''
          },
          gineco: p.customFields?.gineco || {
            fum: '', fpp: '', edadGestacional: '',
            menarca: '', rm: '', irs: '', numParejas: '', flujoGenital: '',
            gestas: '', partos: '', cesareas: '', abortos: '',
            anticonceptivos: false, antiTipo: '', antiTiempo: '', antiUltima: '',
            cirugias: '', otros: ''
          },
          padecimientoActual: p.customFields?.padecimientoActual || '',
          aparatosSistemas: p.customFields?.aparatosSistemas || {
            respiratorio: '', digestivo: '', cardiovascular: '', renal: '', genital: '',
            endocrino: '', hematopoyetico: '', piel: '', musculo: '', nervioso: '',
            sentidos: '', generales: ''
          }
        });
      } catch (err) {
        console.error('Error al cargar perfil del paciente:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setFormData(prev => {
      const newSection = { ...prev[section] };
      if (subsection) {
        newSection[subsection] = { ...newSection[subsection], [field]: value };
      } else {
        newSection[field] = value;
      }
      return { ...prev, [section]: newSection };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ocupacion: formData.ocupacion,
        customFields: {
          estadoCivil: formData.estadoCivil,
          nacionalidad: formData.nacionalidad,
          residencia: formData.residencia,
          escolaridad: formData.escolaridad,
          religion: formData.religion,
          heredofamiliares: formData.heredofamiliares,
          noPatologicos: formData.noPatologicos,
          patologicos: formData.patologicos,
          gineco: formData.gineco,
          padecimientoActual: formData.padecimientoActual,
          aparatosSistemas: formData.aparatosSistemas
        }
      };
      await portalApi.put(`/api/patients/${user.id}/profile`, dataToSave);
      setIsEditing(false);
      // Recargar datos
      const res = await portalApi.get(`/api/patients/${user.id}/profile`);
      setProfileData(res.data);
      alert('Historia médica actualizada correctamente.');
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Hubo un error al guardar los datos.');
    } finally {
      setSaving(false);
    }
  };

  const pProfile = profileData?.patientProfile || {};

  // Calcular Edad automáticamente
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    if (isNaN(nacimiento.getTime())) return '';
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad > 0 ? `(${edad} años)` : '';
  };

  // Calcular IMC
  const calcularIMC = (peso, tallaCm) => {
    if (!peso || !tallaCm || parseFloat(tallaCm) === 0) return '-';
    const tallaM = parseFloat(tallaCm) / 100;
    return (parseFloat(peso) / (tallaM * tallaM)).toFixed(1);
  };

  const nombre = profileData?.name || user.name || '-';
  const identificacion = profileData?.identificationNumber || user.identificationNumber || '-';
  const genero = pProfile.gender || '-';
  const fechaNacimiento = pProfile.dateOfBirth ? `${pProfile.dateOfBirth} ${calcularEdad(pProfile.dateOfBirth)}` : '-';
  const telefono = pProfile.phone || '-';
  const email = pProfile.email || user.username || '-';
  const sedeAtencion = profileData?.sedeAtencion || user.sedeAtencion || '-';
  const medicoTratante = pProfile.treatingDoctor || '-';
  const referente = pProfile.referringEntity || '-';
  const proximaCita = pProfile.nextAppointment ? new Date(pProfile.nextAppointment).toLocaleString('es-ES') : '-';
  const direccion = pProfile.address || '-';

  const fc = pProfile.heartRate ? `${pProfile.heartRate}` : '-';
  const fr = pProfile.respiratoryRate ? `${pProfile.respiratoryRate}` : '-';
  const ta = pProfile.bloodPressure || '-';
  const sato2 = pProfile.oxygenSaturation ? `${pProfile.oxygenSaturation}` : '-';
  const talla = pProfile.heightCm ? `${pProfile.heightCm}` : '-';
  const peso = pProfile.weightKg ? `${pProfile.weightKg}` : '-';

  return (
    <div className="historia-medica-container">
      <div className="historia-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Historia Médica</h1>
          <p>Resumen de tu información clínica y datos personales. Puedes actualizar tus antecedentes y anamnesis.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar Cambios'}</Button>
            </>
          ) : (
            <>
              <Button variant="primary" onClick={() => setIsEditing(true)}>Actualizar mi Historia</Button>
              <Button 
                variant="outline" 
                onClick={() => setShowPrintModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> Imprimir Resumen
              </Button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Cargando datos clínicos...
        </div>
      ) : (
        <div className="historia-grid">
          {/* Sección 1: Datos del Paciente */}
          <section className="hm-section glass-panel">
            <div className="hm-section-header">
              <User className="hm-icon" size={24} />
              <h2>1. Datos del Cliente / Paciente</h2>
            </div>
            
            <div className="hm-data-grid">
              <div className="hm-data-item">
                <label>Nombre y Apellido</label>
                <span>{nombre}</span>
              </div>
              <div className="hm-data-item">
                <label>Número de Identificación</label>
                <span>{identificacion}</span>
              </div>
              <div className="hm-data-item">
                <label>Género</label>
                <span>{genero}</span>
              </div>
              <div className="hm-data-item">
                <label>Fecha de Nacimiento y Edad</label>
                <span>{fechaNacimiento}</span>
              </div>
              <div className="hm-data-item">
                <label>Teléfono</label>
                <span>{telefono}</span>
              </div>
              <div className="hm-data-item">
                <label>Email</label>
                <span>{email}</span>
              </div>
              <div className="hm-data-item">
                <label>Sede de Atención</label>
                <span>{sedeAtencion}</span>
              </div>
              <div className="hm-data-item">
                <label>Médico Tratante</label>
                <span>{medicoTratante}</span>
              </div>
              <div className="hm-data-item">
                <label>Referente</label>
                <span>{referente}</span>
              </div>
              <div className="hm-data-item">
                <label>Próxima Cita / Control</label>
                <span className="hm-highlight">{proximaCita}</span>
              </div>
              <div className="hm-data-item hm-col-span-2">
                <label>Dirección</label>
                <span>{direccion}</span>
              </div>
            </div>
            
            <div className="hm-data-grid" style={{ marginTop: '1rem' }}>
              <div className="hm-data-item">
                <label>Ocupación</label>
                {isEditing ? <input type="text" name="ocupacion" className="hm-input" value={formData.ocupacion} onChange={handleInputChange} /> : <span>{pProfile.ocupacion || '-'}</span>}
              </div>
              <div className="hm-data-item">
                <label>Estado Civil</label>
                {isEditing ? <input type="text" name="estadoCivil" className="hm-input" value={formData.estadoCivil} onChange={handleInputChange} /> : <span>{pProfile.customFields?.estadoCivil || '-'}</span>}
              </div>
              <div className="hm-data-item">
                <label>Nacionalidad</label>
                {isEditing ? <input type="text" name="nacionalidad" className="hm-input" value={formData.nacionalidad} onChange={handleInputChange} /> : <span>{pProfile.customFields?.nacionalidad || '-'}</span>}
              </div>
              <div className="hm-data-item">
                <label>Residencia</label>
                {isEditing ? <input type="text" name="residencia" className="hm-input" value={formData.residencia} onChange={handleInputChange} /> : <span>{pProfile.customFields?.residencia || '-'}</span>}
              </div>
              <div className="hm-data-item">
                <label>Escolaridad</label>
                {isEditing ? <input type="text" name="escolaridad" className="hm-input" value={formData.escolaridad} onChange={handleInputChange} /> : <span>{pProfile.customFields?.escolaridad || '-'}</span>}
              </div>
              <div className="hm-data-item">
                <label>Religión</label>
                {isEditing ? <input type="text" name="religion" className="hm-input" value={formData.religion} onChange={handleInputChange} /> : <span>{pProfile.customFields?.religion || '-'}</span>}
              </div>
            </div>
          </section>

          {/* Sección de Anamnesis / Historia Médica llenada por el paciente */}
          <section className="hm-section glass-panel">
            <div className="hm-section-header">
              <Activity className="hm-icon" size={24} />
              <h2>Historia Clínica (Llenado por el Paciente)</h2>
            </div>
            
            <div className="hm-data-grid hm-1-col" style={{ gap: '1.5rem' }}>
              
              {/* ANTECEDENTES HEREDOFAMILIARES */}
              <div className="hm-form-group">
                <h3>ANTECEDENTES HEREDOFAMILIARES</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {['padres', 'hermanos', 'hijos'].map(rel => (
                    <div key={rel} className="hm-data-item">
                      <label style={{ textTransform: 'capitalize' }}>{rel}</label>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input type="text" placeholder="Vivos" className="hm-input" value={formData.heredofamiliares[rel].vivos} onChange={e => handleNestedChange('heredofamiliares', rel, 'vivos', e.target.value)} />
                          <input type="text" placeholder="Fallecidos" className="hm-input" value={formData.heredofamiliares[rel].fallecidos} onChange={e => handleNestedChange('heredofamiliares', rel, 'fallecidos', e.target.value)} />
                          <input type="text" placeholder="Causas" className="hm-input" value={formData.heredofamiliares[rel].causas} onChange={e => handleNestedChange('heredofamiliares', rel, 'causas', e.target.value)} />
                        </div>
                      ) : (
                        <p>Vivos: {formData.heredofamiliares?.[rel]?.vivos || '-'} | Fallecidos: {formData.heredofamiliares?.[rel]?.fallecidos || '-'} <br/> Causas: {formData.heredofamiliares?.[rel]?.causas || '-'}</p>
                      )}
                    </div>
                  ))}
                </div>
                <label>Enfermedades Familiares:</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {['diabetes', 'hipertension', 'tuberculosis', 'cancer', 'otras'].map(enf => (
                      <label key={enf} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'capitalize' }}>
                        <input type="checkbox" checked={formData.heredofamiliares.enfermedades[enf]} onChange={e => handleNestedChange('heredofamiliares', 'enfermedades', enf, e.target.checked)} />
                        {enf}
                      </label>
                    ))}
                    {formData.heredofamiliares.enfermedades.otras && (
                      <input type="text" placeholder="Especificar..." className="hm-input" value={formData.heredofamiliares.enfermedades.otrasDetalle} onChange={e => handleNestedChange('heredofamiliares', 'enfermedades', 'otrasDetalle', e.target.value)} />
                    )}
                  </div>
                ) : (
                  <p>
                    {['diabetes', 'hipertension', 'tuberculosis', 'cancer'].filter(e => formData.heredofamiliares?.enfermedades?.[e]).join(', ') || 'Ninguna'}
                    {formData.heredofamiliares?.enfermedades?.otras && ` - Otras: ${formData.heredofamiliares.enfermedades.otrasDetalle}`}
                  </p>
                )}
              </div>

              {/* ANTECEDENTES PERSONALES NO PATOLOGICOS */}
              <div className="hm-form-group">
                <h3>ANTECEDENTES PERSONALES NO PATOLOGICOS</h3>
                <h4>1) Hábitos Tóxicos:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {['alcohol', 'tabaco', 'drogas'].map(hab => (
                    <div key={hab} className="hm-data-item">
                      <label style={{ textTransform: 'capitalize' }}>{hab}</label>
                      {isEditing ? <input type="text" className="hm-input" value={formData.noPatologicos.toxicos[hab]} onChange={e => handleNestedChange('noPatologicos', 'toxicos', hab, e.target.value)} /> : <p>{formData.noPatologicos?.toxicos?.[hab] || '-'}</p>}
                    </div>
                  ))}
                </div>
                <h4>2) Fisiológicos:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {['alimentacion', 'dipsia', 'diuresis', 'catarsis', 'somnia', 'otros'].map(fis => (
                    <div key={fis} className="hm-data-item">
                      <label style={{ textTransform: 'capitalize' }}>{fis}</label>
                      {isEditing ? <input type="text" className="hm-input" value={formData.noPatologicos.fisiologicos[fis]} onChange={e => handleNestedChange('noPatologicos', 'fisiologicos', fis, e.target.value)} /> : <p>{formData.noPatologicos?.fisiologicos?.[fis] || '-'}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* ANTECEDENTES PERSONALES PATOLOGICOS */}
              <div className="hm-form-group">
                <h3>ANTECEDENTES PERSONALES PATOLOGICOS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="hm-data-item">
                    <label>Infancia</label>
                    {isEditing ? <input type="text" className="hm-input" value={formData.patologicos.infancia} onChange={e => handleNestedChange('patologicos', null, 'infancia', e.target.value)} /> : <p>{formData.patologicos?.infancia || '-'}</p>}
                  </div>
                  <div className="hm-data-item">
                    <label>Adulto</label>
                    {isEditing ? <input type="text" className="hm-input" value={formData.patologicos.adulto} onChange={e => handleNestedChange('patologicos', null, 'adulto', e.target.value)} /> : <p>{formData.patologicos?.adulto || '-'}</p>}
                  </div>
                </div>
                <label>Enfermedades Padecidas:</label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {['diabetes', 'hipertension', 'tuberculosis', 'cancer', 'otras'].map(enf => (
                      <label key={enf} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textTransform: 'capitalize' }}>
                        <input type="checkbox" checked={formData.patologicos.enfermedades[enf]} onChange={e => handleNestedChange('patologicos', 'enfermedades', enf, e.target.checked)} />
                        {enf}
                      </label>
                    ))}
                    {formData.patologicos.enfermedades.otras && (
                      <input type="text" placeholder="Especificar..." className="hm-input" value={formData.patologicos.enfermedades.otrasDetalle} onChange={e => handleNestedChange('patologicos', 'enfermedades', 'otrasDetalle', e.target.value)} />
                    )}
                  </div>
                ) : (
                  <p style={{ marginBottom: '1rem' }}>
                    {['diabetes', 'hipertension', 'tuberculosis', 'cancer'].filter(e => formData.patologicos?.enfermedades?.[e]).join(', ') || 'Ninguna'}
                    {formData.patologicos?.enfermedades?.otras && ` - Otras: ${formData.patologicos.enfermedades.otrasDetalle}`}
                  </p>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {['quirurgicos', 'traumatologicos', 'alergicos', 'otros'].map(pat => (
                    <div key={pat} className="hm-data-item">
                      <label style={{ textTransform: 'capitalize' }}>{pat}</label>
                      {isEditing ? <input type="text" className="hm-input" value={formData.patologicos[pat]} onChange={e => handleNestedChange('patologicos', null, pat, e.target.value)} /> : <p>{formData.patologicos?.[pat] || '-'}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* GINECO-OBSTÉTRICOS */}
              {(genero === 'Femenino' || genero === 'F') && (
                <div className="hm-form-group">
                  <h3>GINECO-OBSTÉTRICOS</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    {['fum', 'fpp', 'edadGestacional', 'menarca', 'rm', 'irs', 'numParejas', 'flujoGenital'].map(f => (
                      <div key={f} className="hm-data-item">
                        <label style={{ textTransform: 'capitalize' }}>{f.replace(/([A-Z])/g, ' $1').trim()}</label>
                        {isEditing ? <input type="text" className="hm-input" value={formData.gineco[f]} onChange={e => handleNestedChange('gineco', null, f, e.target.value)} /> : <p>{formData.gineco?.[f] || '-'}</p>}
                      </div>
                    ))}
                    {['gestas', 'partos', 'cesareas', 'abortos'].map(f => (
                      <div key={f} className="hm-data-item">
                        <label style={{ textTransform: 'capitalize' }}>{f}</label>
                        {isEditing ? <input type="number" className="hm-input" value={formData.gineco[f]} onChange={e => handleNestedChange('gineco', null, f, e.target.value)} /> : <p>{formData.gineco?.[f] || '-'}</p>}
                      </div>
                    ))}
                  </div>
                  <div className="hm-data-item" style={{ marginBottom: '1rem' }}>
                    <label>Anticonceptivos</label>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <label><input type="checkbox" checked={formData.gineco.anticonceptivos} onChange={e => handleNestedChange('gineco', null, 'anticonceptivos', e.target.checked)} /> Usa</label>
                        {formData.gineco.anticonceptivos && (
                          <>
                            <input type="text" placeholder="Tipo" className="hm-input" value={formData.gineco.antiTipo} onChange={e => handleNestedChange('gineco', null, 'antiTipo', e.target.value)} />
                            <input type="text" placeholder="Tiempo" className="hm-input" value={formData.gineco.antiTiempo} onChange={e => handleNestedChange('gineco', null, 'antiTiempo', e.target.value)} />
                            <input type="text" placeholder="Última toma" className="hm-input" value={formData.gineco.antiUltima} onChange={e => handleNestedChange('gineco', null, 'antiUltima', e.target.value)} />
                          </>
                        )}
                      </div>
                    ) : (
                      <p>{formData.gineco?.anticonceptivos ? `Sí - Tipo: ${formData.gineco.antiTipo}, Tiempo: ${formData.gineco.antiTiempo}, Última: ${formData.gineco.antiUltima}` : 'No'}</p>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="hm-data-item">
                      <label>Cirugías Ginecológicas</label>
                      {isEditing ? <input type="text" className="hm-input" value={formData.gineco.cirugias} onChange={e => handleNestedChange('gineco', null, 'cirugias', e.target.value)} /> : <p>{formData.gineco?.cirugias || '-'}</p>}
                    </div>
                    <div className="hm-data-item">
                      <label>Otros</label>
                      {isEditing ? <input type="text" className="hm-input" value={formData.gineco.otros} onChange={e => handleNestedChange('gineco', null, 'otros', e.target.value)} /> : <p>{formData.gineco?.otros || '-'}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* PADECIMIENTO ACTUAL */}
              <div className="hm-form-group">
                <h3>PADECIMIENTO ACTUAL</h3>
                <div className="hm-data-item">
                  {isEditing ? (
                    <textarea className="hm-textarea" rows="4" value={formData.padecimientoActual} onChange={e => handleInputChange({ target: { name: 'padecimientoActual', value: e.target.value }})} placeholder="Describa el motivo de consulta y enfermedad actual..."></textarea>
                  ) : (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{formData.padecimientoActual || '-'}</p>
                  )}
                </div>
              </div>

              {/* INTERROGATORIO POR APARATOS Y SISTEMAS */}
              <div className="hm-form-group">
                <h3>INTERROGATORIO POR APARATOS Y SISTEMAS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {[
                    { id: 'respiratorio', label: 'Aparato Respiratorio' },
                    { id: 'digestivo', label: 'Aparato Digestivo' },
                    { id: 'cardiovascular', label: 'Aparato Cardiovascular' },
                    { id: 'renal', label: 'Aparato Renal y Urinario' },
                    { id: 'genital', label: 'Aparato Genital' },
                    { id: 'endocrino', label: 'Sistema Endocrino' },
                    { id: 'hematopoyetico', label: 'Sistema Hematopoyético y Linfático' },
                    { id: 'piel', label: 'Piel y Anexos' },
                    { id: 'musculo', label: 'Músculo Esquelético' },
                    { id: 'nervioso', label: 'Sistema Nervioso' },
                    { id: 'sentidos', label: 'Órganos de los Sentidos' },
                    { id: 'generales', label: 'Síntomas Generales' }
                  ].map(sys => (
                    <div key={sys.id} className="hm-data-item">
                      <label>{sys.label}</label>
                      {isEditing ? (
                        <input type="text" className="hm-input" value={formData.aparatosSistemas[sys.id]} onChange={e => handleNestedChange('aparatosSistemas', null, sys.id, e.target.value)} />
                      ) : (
                        <p>{formData.aparatosSistemas?.[sys.id] || '-'}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* Sección 2: Parámetros Generales */}
          <section className="hm-section glass-panel">
            <div className="hm-section-header">
              <Activity className="hm-icon" size={24} />
              <h2>2. Parámetros Generales (Última Consulta)</h2>
            </div>
            
            <div className="hm-data-grid">
              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)'}}>
                  <Heart size={20} color="#ef4444" />
                </div>
                <div className="param-info">
                  <label>Frecuencia Cardíaca (FC)</label>
                  <div className="param-value">{fc} {fc !== '-' && <span>ppm</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)'}}>
                  <Activity size={20} color="#3b82f6" />
                </div>
                <div className="param-info">
                  <label>Frecuencia Respiratoria (FR)</label>
                  <div className="param-value">{fr} {fr !== '-' && <span>rpm</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(139, 92, 246, 0.1)'}}>
                  <Activity size={20} color="#8b5cf6" />
                </div>
                <div className="param-info">
                  <label>Tensión Arterial (TA)</label>
                  <div className="param-value">{ta} {ta !== '-' && <span>mmHg</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(16, 185, 129, 0.1)'}}>
                  <Activity size={20} color="#10b981" />
                </div>
                <div className="param-info">
                  <label>Saturación de Oxígeno (SatO2)</label>
                  <div className="param-value">{sato2} {sato2 !== '-' && <span>%</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                  <Activity size={20} color="#f59e0b" />
                </div>
                <div className="param-info">
                  <label>Talla</label>
                  <div className="param-value">{talla} {talla !== '-' && <span>cm</span>}</div>
                </div>
              </div>

              <div className="hm-param-card">
                <div className="param-icon-box" style={{backgroundColor: 'rgba(245, 158, 11, 0.1)'}}>
                  <Weight size={20} color="#f59e0b" />
                </div>
                <div className="param-info">
                  <label>Peso</label>
                  <div className="param-value">{peso} {peso !== '-' && <span>Kg</span>}</div>
                </div>
              </div>

              <div className="hm-param-card hm-col-span-2" style={{backgroundColor: 'rgba(42, 183, 202, 0.05)', border: '1px solid var(--color-accent)'}}>
                <div className="param-info" style={{alignItems: 'center', textAlign: 'center', width: '100%'}}>
                  <label style={{color: 'var(--color-primary)'}}>Índice de Masa Corporal (IMC)</label>
                  <div className="param-value" style={{fontSize: '2rem', color: 'var(--color-accent)'}}>
                    {calcularIMC(pProfile.weightKg, pProfile.heightCm)}
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      )}

      {/* MODAL DE IMPRESIÓN OFICIAL DEL PACIENTE */}
      <MedicalDocumentModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        type="clinical_report"
        data={{
          patient: {
            name: nombre,
            identificationNumber: identificacion,
            sedeAtencion: sedeAtencion
          },
          doctor: {
            name: medicoTratante !== '-' ? medicoTratante : 'Especialista UNIMECO'
          },
          reasonForVisit: `Paciente con control clínico registrado en sede ${sedeAtencion}.`,
          physicalExam: `Signos Vitales: FC: ${fc} ppm, FR: ${fr} rpm, TA: ${ta} mmHg, SatO2: ${sato2}%, Talla: ${talla} cm, Peso: ${peso} Kg, IMC: ${calcularIMC(pProfile.weightKg, pProfile.heightCm)} kg/m².`,
          diagnoses: 'Control Clínico y Seguimiento Preventivo de Salud.',
          evolutionaryReport: `Próximo control programado: ${proximaCita}. Dirección del paciente: ${direccion}.`,
          sede: sedeAtencion
        }}
      />
    </div>
  );
}
