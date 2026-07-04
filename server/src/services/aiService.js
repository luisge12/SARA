// Servicio de Inteligencia Artificial (Google Gemini) para SARA

// TODO: Configurar conexión con API de Gemini para la generación de resúmenes.
module.exports = {
  generateClinicalSummary: async (symptomsData) => {
    return `Resumen de IA descriptivo de los síntomas: ${symptomsData.join(', ')}`;
  },
  generateDashboardInsights: async (data, request) => {
    return { chartType: "bar", description: "Análisis IA estadístico" };
  }
};
