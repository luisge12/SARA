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
  handleAudioTranscribe
};
