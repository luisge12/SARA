// Servicio y persistencia de Configuración y Marca de la Clínica para SARA

export const DEFAULT_CLINIC_SETTINGS = {
  name: 'UNIMECO',
  subtitle: 'Unidad Médica Quirúrgica Especializada',
  rif: 'J-50123456-7',
  phone: '+58 (0212) 555-0199',
  address: 'Caracas, Venezuela',
  logoUrl: '',
  primaryColor: '#22505d',
  sedes: ['CENTRAL']
};

export const getClinicSettings = () => {
  try {
    const saved = localStorage.getItem('sara_clinic_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const sedes = Array.isArray(parsed.sedes) && parsed.sedes.length > 0 
        ? parsed.sedes 
        : DEFAULT_CLINIC_SETTINGS.sedes;
      return { ...DEFAULT_CLINIC_SETTINGS, ...parsed, sedes };
    }
  } catch (e) {
    console.warn('Error al leer configuración de clínica de localStorage:', e);
  }
  return DEFAULT_CLINIC_SETTINGS;
};

export const getClinicSedes = () => {
  const settings = getClinicSettings();
  if (Array.isArray(settings.sedes) && settings.sedes.length > 0) {
    return settings.sedes;
  }
  return ['CENTRAL'];
};

export const saveClinicSettings = (settings) => {
  try {
    localStorage.setItem('sara_clinic_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('clinicSettingsChanged'));
    return true;
  } catch (e) {
    console.error('Error al guardar configuración de clínica:', e);
    return false;
  }
};
