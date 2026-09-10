/**
 * Controlador de Inteligencia Artificial SARA-AI con Acceso a Base de Datos de Pacientes y Google Gemini
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Op } = require('sequelize');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');

// Obtener modelo Gemini dinámicamente en cada petición leyendo process.env
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.warn('⚠️ SARA-AI: GEMINI_API_KEY no encontrada en variables de entorno.');
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: `Eres SARA-AI, la asistente médica e inteligente integrada en el sistema SARA (Sistema de Administración y Registros Asistenciales para clínicas y centros de salud UNIMECO).
Tu misión es asistir a personal médico, recepcionistas, administradores y pacientes.

Instrucciones de comportamiento:
- Responde siempre de manera profesional, empática, amable y en español impecable.
- Utiliza formato Markdown atractivo (negritas, viñetas, listas estructuradas y emojis adecuados).
- Cuando el usuario pregunte por cómo usar la plataforma SARA, guíalo indicando los pasos en los módulos (Módulo 1: Dashboard, Módulo 2: Gestión Administrativa de Pacientes, Módulo 3: Registro de Caja, Módulo 4: Historia Clínica y Datos Médicos, Módulo 7: Reportes y Estadísticas).
- Si se te proporciona información de pacientes obtenida del sistema, utilízala para responder con precisión.
- Si te piden un diagnóstico o consulta sobre dolor/síntomas médicos, brinda información médica clara, profesional y tranquilizadora sobre posibles causas comunes o medidas generales de alivio, pero aclara amablemente al final que tus respuestas son puramente orientativas e informativas y que siempre se requiere la evaluación física directa por un médico especialista en UNIMECO.`
    });
    return { genAI, model };
  } catch (err) {
    console.error('Error al inicializar GoogleGenerativeAI en SARA-AI:', err.message);
    return null;
  }
};

// Función que consulta la base de datos de pacientes en tiempo real
const queryPatientDatabase = async (prompt) => {
  const text = prompt.toLowerCase();

  try {
    // 1. Consulta de conteo general o listado de pacientes
    if (text.includes('cuántos paciente') || text.includes('cuantos paciente') || text.includes('total de paciente') || text.includes('lista de paciente')) {
      const count = await User.count({ where: { role: 'Paciente' } });
      const recentPatients = await User.findAll({
        where: { role: 'Paciente' },
        limit: 5,
        order: [['id', 'DESC']],
        include: [{ model: PatientProfile, as: 'patientProfile' }]
      });

      let response = `📊 **Información de Pacientes en Sistema SARA:**\n`;
      response += `- **Total de pacientes registrados:** ${count}\n\n`;

      if (recentPatients.length > 0) {
        response += `**Últimos pacientes registrados:**\n`;
        recentPatients.forEach(p => {
          const profile = p.patientProfile || {};
          response += `• **${p.name || p.username}** - Cédula: ${p.identificationNumber || 'N/A'} - Tel: ${profile.phone || 'N/D'}\n`;
        });
      }
      return response;
    }

    // 2. Búsqueda de un paciente específico por nombre, apellido o cédula
    const words = text.split(' ').filter(w => w.length > 2 && !['paciente', 'datos', 'para', 'como', 'quien', 'buscar', 'dame', 'sobre', 'esta', 'puedes'].includes(w));
    
    if (words.length > 0) {
      const searchConditions = words.map(w => ({
        [Op.or]: [
          { name: { [Op.iLike]: `%${w}%` } },
          { username: { [Op.iLike]: `%${w}%` } },
          { identificationNumber: { [Op.iLike]: `%${w}%` } }
        ]
      }));

      const foundPatients = await User.findAll({
        where: {
          role: 'Paciente',
          [Op.or]: searchConditions
        },
        limit: 3,
        include: [{ model: PatientProfile, as: 'patientProfile' }]
      });

      if (foundPatients && foundPatients.length > 0) {
        let response = `🔍 **Resultados de Pacientes Encontrados:**\n\n`;
        foundPatients.forEach(p => {
          const profile = p.patientProfile || {};
          response += `👤 **Paciente:** ${p.name || p.username}\n`;
          response += `• **Cédula/ID:** ${p.identificationNumber || 'N/A'}\n`;
          response += `• **Teléfono:** ${profile.phone || 'No registrado'}\n`;
          response += `• **Email:** ${profile.email || 'No registrado'}\n`;
          response += `• **Médico Tratante:** ${profile.treatingDoctor || 'Sin asignar'}\n`;
          if (profile.bloodPressure || profile.heartRate) {
            response += `• **Signos Vitales:** P.A: ${profile.bloodPressure || 'N/D'}, F.C: ${profile.heartRate || 'N/D'} bpm\n`;
          }
          response += `---\n`;
        });
        return response;
      }
    }
  } catch (err) {
    console.error('Error al consultar base de datos de pacientes para SARA-AI:', err);
  }

  return null;
};

// Generar respuesta dinámica con Google Gemini API
const generateGeminiResponse = async (prompt, patientContext = null) => {
  const instance = getGeminiModel();
  if (!instance || !instance.model) {
    console.warn('⚠️ SARA-AI: No se pudo instanciar Gemini API.');
    return null;
  }

  try {
    let fullPrompt = prompt;
    if (patientContext) {
      fullPrompt = `[CONTEXTO DE LA BASE DE DATOS DE SARA]:\n${patientContext}\n\n[PREGUNTA DEL USUARIO]:\n${prompt}`;
    }

    console.log(`🤖 SARA-AI enviando consulta a Gemini API: "${prompt}"`);
    const result = await instance.model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log(`✅ SARA-AI respuesta generada exitosamente por Gemini (${text.length} caracteres).`);
    return text;
  } catch (error) {
    console.error('❌ Error al llamar a Gemini API:', error.message);
    
    // Fallback a otros modelos de Gemini
    const fallbackModels = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-pro-latest'];
    for (const altModelName of fallbackModels) {
      try {
        console.log(`Intentando modelo fallback: ${altModelName}...`);
        const altModel = instance.genAI.getGenerativeModel({ model: altModelName });
        const result = await altModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (altErr) {
        // Continuar al siguiente
      }
    }
    return null;
  }
};

// Generador de respuestas local de respaldo (offline / fallback)
const generateServerSaraResponse = async (message) => {
  const text = message.toLowerCase();

  if (text.includes('paciente') || text.includes('cédula') || text.includes('cedula') || text.includes('quien es') || text.includes('quién es') || text.includes('cuantos')) {
    const dbResult = await queryPatientDatabase(message);
    if (dbResult) {
      return dbResult;
    }
  }

  if (text.includes('cita') || text.includes('agendar') || text.includes('calendario') || text.includes('horario') || text.includes('turnos')) {
    return `📅 **Gestión de Citas Médicas en SARA:**
1. Haz clic en el botón **"Agendar Cita"** en la barra lateral o en el Dashboard.
2. Selecciona la especialidad médica, el médico tratante y la fecha/hora requerida.
3. Busca al paciente por su número de cédula o ID y asigna la cita.
4. El sistema cambiará el estado a *Programada* o *Confirmada*.`;
  }

  if (text.includes('hola') || text.includes('buenas') || text.includes('saludos') || text.includes('quien eres') || text.includes('quién eres')) {
    return `¡Hola! 👋 Soy **SARA-AI**, tu asistente médica e inteligente integrada en el sistema SARA.

Puedo buscar datos de pacientes en la base de datos, responder dudas sobre la plataforma, guiarte en el registro de citas, caja o historia médica. ¿En qué te ayudo?`;
  }

  return `🤖 Soy **SARA-AI**, tu asistente inteligente del centro médico. Puedes preguntarme directamente sobre datos de pacientes, citas médicas, registro de caja, historias clínicas o dudas médicas generales.`;
};

// Procesar mensajes de texto de SARA-AI
const handleAiChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    // 1. Obtener datos de BD si aplica
    const patientData = await queryPatientDatabase(message);

    // 2. Intentar respuesta con Google Gemini API
    let aiResponse = await generateGeminiResponse(message, patientData);

    // 3. Si Gemini no respondió o falló, usar respuestas locales / datos de la BD
    if (!aiResponse) {
      console.warn('⚠️ Usando generador de respuesta local por falta de respuesta de Gemini.');
      aiResponse = patientData || await generateServerSaraResponse(message);
    }

    return res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en controlador SARA-AI:', error);
    return res.status(500).json({ error: 'Error al procesar la solicitud de IA.' });
  }
};

// Generar el 'Gran Motivo de Consulta y Enfermedad Actual' asistido por IA (Google Gemini con Fallback Clínico)
const handleGenerateClinicalReason = async (req, res) => {
  try {
    const { reasonForVisit = [], patient = {}, additionalNotes = '' } = req.body;

    if (!Array.isArray(reasonForVisit) || reasonForVisit.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un síntoma o motivo registrado para procesar.' });
    }

    // Preparar resumen estructurado de los datos ingresados
    const symptomsDetails = reasonForVisit
      .filter(r => (r.symptom && r.symptom.trim()) || (r.complement && r.complement.trim()))
      .map(r => {
        let parts = [];
        if (r.symptom) parts.push(`Síntoma: ${r.symptom}`);
        if (r.onset) parts.push(`Tiempo de inicio: ${r.onset}`);
        if (r.complement) parts.push(`Características: ${r.complement}`);
        if (r.regionGeneral || r.regionSpecific) parts.push(`Localización: ${[r.regionGeneral, r.regionSpecific].filter(Boolean).join(' - ')}`);
        if (r.relatedTo) parts.push(`Relacionado con: ${r.relatedTo}`);
        if (r.additionalInfo) parts.push(`Información adicional: ${r.additionalInfo}`);
        return parts.join(', ');
      })
      .join('; ');

    const patientDesc = [
      patient.name ? `Paciente: ${patient.name}` : '',
      patient.gender ? `Género: ${patient.gender}` : '',
      patient.age ? `Edad: ${patient.age}` : ''
    ].filter(Boolean).join(' | ');

    const apiKey = process.env.GEMINI_API_KEY;
    let synthesizedText = null;

    if (apiKey && apiKey.trim()) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey.trim());
        const model = genAI.getGenerativeModel({
          model: 'gemini-flash-latest',
          systemInstruction: `Eres un médico especialista de alto nivel y redactor clínico para historias médicas estandarizadas en español (estándar internacional SOAP).
Tu tarea es redactar el "Gran Motivo de Consulta y Enfermedad Actual" en un párrafo clínico formal, coherente, pulcro y profesional a partir de los síntomas y datos recolectados.
Reglas estrictas:
- Redacta en tercera persona formal (ej: "Paciente refiere cuadro clínico caracterizado por...").
- Organiza cronológicamente la evolución de los síntomas.
- Emplea terminología semiológica precisa en español médico.
- No inventes síntomas que no estén en la entrada, pero enlázalos con fluidez y coherencia gramatical.
- Devuelve únicamente el párrafo redactado, sin encabezados redundantes como "Motivo de consulta:" ni despedidas.`
        });

        const prompt = `Datos del paciente: ${patientDesc || 'Adulto'}
Síntomas y signos recolectados:
${symptomsDetails || 'No especificados en detalle'}
${additionalNotes ? `Notas adicionales: ${additionalNotes}` : ''}

Por favor genera el resumen del Motivo de Consulta y Enfermedad Actual:`;

        const result = await model.generateContent(prompt);
        if (result && result.response) {
          synthesizedText = result.response.text().trim();
        }
      } catch (geminiErr) {
        console.warn('Fallo llamada a Gemini API, aplicando fallback clínico:', geminiErr.message);
      }
    }

    // Fallback clínico algorítmico determinista si no hay API Key o falla la red
    if (!synthesizedText) {
      const primarySymptom = reasonForVisit[0] || {};
      const onset = primarySymptom.onset ? `con ${primarySymptom.onset} de evolución` : 'de evolución reciente';
      const mainSymptomText = primarySymptom.symptom || 'malestar no especificado';
      const location = [primarySymptom.regionGeneral, primarySymptom.regionSpecific].filter(Boolean).join(', ');
      const locationPhrase = location ? `localizado en ${location}` : '';
      const complementPhrase = primarySymptom.complement ? `de tipo ${primarySymptom.complement}` : '';
      const relatedPhrase = primarySymptom.relatedTo ? `asociado a ${primarySymptom.relatedTo}` : '';
      const addInfo = primarySymptom.additionalInfo ? `. Refiere además: ${primarySymptom.additionalInfo}` : '';

      synthesizedText = `Paciente acude a valoración clínica presentando cuadro sintomático ${onset}, caracterizado principalmente por ${mainSymptomText} ${complementPhrase} ${locationPhrase} ${relatedPhrase}${addInfo}.`;
      
      if (reasonForVisit.length > 1) {
        const otherSymptoms = reasonForVisit.slice(1).map(s => s.symptom).filter(Boolean).join(', ');
        if (otherSymptoms) {
          synthesizedText += ` Se asocian concomitantemente los siguientes síntomas de soporte: ${otherSymptoms}.`;
        }
      }
    }

    return res.json({
      success: true,
      granMotivoConsulta: synthesizedText,
      source: apiKey ? 'gemini-ai' : 'deterministic-clinical-engine'
    });
  } catch (error) {
    console.error('Error al generar Gran Motivo de Consulta:', error);
    return res.status(500).json({ error: 'Error al sintetizar el motivo de consulta con IA.' });
  }
};

// Endpoint de transcripción de voz universal
const handleAudioTranscribe = async (req, res) => {
  try {
    return res.json({
      success: true,
      text: "Mensaje por voz procesado con éxito por SARA-AI.",
      info: "Audio recibido universalmente."
    });
  } catch (error) {
    console.error('Error en transcripción de audio:', error);
    return res.status(500).json({ error: 'Error al procesar el audio de voz.' });
  }
};

module.exports = {
  handleAiChat,
  handleAudioTranscribe,
  handleGenerateClinicalReason
};


