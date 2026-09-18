// Servicio y persistencia de Configuración y Marca de la Clínica para SARA

export const DEFAULT_CLINIC_SETTINGS = {
  name: 'UNIMECO',
  subtitle: 'Unidad Médica Quirúrgica Especializada',
  rif: 'J-50123456-7',
  phone: '+58 (0212) 555-0199',
  address: 'Caracas, Venezuela',
  logoUrl: '',
  primaryColor: '#22505d'
};

export const getClinicSettings = () => {
  try {
    const saved = localStorage.getItem('sara_clinic_settings');
    if (saved) {
      return { ...DEFAULT_CLINIC_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Error al leer configuración de clínica de localStorage:', e);
  }
  return DEFAULT_CLINIC_SETTINGS;
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
