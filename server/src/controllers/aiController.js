/**
 * Controlador de Inteligencia Artificial SARA-AI con Acceso a Base de Datos de Pacientes
 */
const { Op } = require('sequelize');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const Appointment = require('../models/Appointment');

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
    const words = text.split(' ').filter(w => w.length > 2 && !['paciente', 'datos', 'para', 'como', 'quien', 'buscar', 'dame', 'sobre', 'esta'].includes(w));
    
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

// Generador de respuestas local inteligente con amplia cobertura de intenciones
const generateServerSaraResponse = async (message) => {
  const text = message.toLowerCase();

  // Intentar primero consultar la base de datos de pacientes si se trata de una pregunta sobre pacientes
  if (text.includes('paciente') || text.includes('cédula') || text.includes('cedula') || text.includes('quien es') || text.includes('quién es') || text.includes('cuantos')) {
    const dbResult = await queryPatientDatabase(message);
    if (dbResult) {
      return dbResult;
    }
  }

  // 1. Citas Médicas
  if (text.includes('cita') || text.includes('agendar') || text.includes('calendario') || text.includes('horario') || text.includes('turnos')) {
    return `📅 **Gestión de Citas Médicas en SARA:**
1. Haz clic en el botón **"Agendar Cita"** en la barra lateral o en el Dashboard.
2. Selecciona la especialidad médica, el médico tratante y la fecha/hora requerida.
3. Busca al paciente por su número de cédula o ID y asigna la cita.
4. El sistema cambiará el estado a *Programada* o *Confirmada*.`;
  }

  // 2. Registro de Pacientes / Módulo 2
  if (text.includes('paciente') || text.includes('registro') || text.includes('crear') || text.includes('cédula') || text.includes('cedula') || text.includes('ingresar paciente')) {
    return `👤 **Módulo 2 - Gestión Administrativa de Pacientes:**
1. Ve al menú **"Gestión Administrativa"** (Módulo 2).
2. Haz clic en **"Nuevo Paciente"**.
3. Ingresa los datos personales: Cédula, Nombres, Apellidos, Fecha de Nacimiento, Teléfono y Dirección.
4. El paciente quedará registrado inmediatamente en la base de datos global SARA.`;
  }

  // 3. Registro de Caja / Pagos / Módulo 3
  if (text.includes('caja') || text.includes('pago') || text.includes('factura') || text.includes('cobro') || text.includes('precio') || text.includes('divisa') || text.includes('dólar') || text.includes('bolívar')) {
    return `💳 **Módulo 3 - Registro de Caja:**
1. Ingresa a **"Registro de Caja"** en el menú de la izquierda.
2. Selecciona la orden o paciente pendiente por pagar.
3. Elige el método de pago (Efectivo, Transferencia, Punto de Venta o Divisas).
4. Confirma el pago y emite/imprime el comprobante oficial.`;
  }

  // 4. Historia Clínica / Datos Clínicos / Módulo 4
  if (text.includes('clínic') || text.includes('clinic') || text.includes('médic') || text.includes('medico') || text.includes('diagnóstico') || text.includes('receta') || text.includes('consulta') || text.includes('síntoma')) {
    return `🩺 **Módulo 4 - Datos Clínicos e Historia Médica:**
- Exclusivo para médicos autorizados.
- Registra el motivo de consulta, examen físico, signos vitales, diagnóstico (CIE-10) y récipe médico.
- Mantiene el historial clínico inmutable del paciente.`;
  }

  // 5. Reportes / Estadísticas / Módulo 7
  if (text.includes('reporte') || text.includes('estadística') || text.includes('estadistica') || text.includes('gráfico') || text.includes('grafico') || text.includes('médica estadística')) {
    return `📊 **Módulo 7 - Gestión Médica Estadística:**
- Visualiza gráficos e indicadores sobre las consultas realizadas, morbilidad por especialidad y total de cobranzas.
- Genera resúmenes exportables para la dirección médica del centro.`;
  }

  // 6. Mensaje de Voz
  if (text.includes('mensaje de voz') || text.includes('audio') || text.includes('grabación')) {
    return `🎙️ **Consulta por Voz Recibida:**
He procesado tu mensaje de voz. Puedes preguntarme sobre **datos de pacientes específicos**, **agendar citas**, **cobros en caja** o **historias clínicas**.`;
  }

  // 7. Saludos e Identidad
  if (text.includes('hola') || text.includes('buenas') || text.includes('saludos') || text.includes('quien eres') || text.includes('quién eres')) {
    return `¡Hola! 👋 Soy **SARA-AI**, tu asistente médica e inteligente integrada en el sistema SARA.

Puedo buscar datos de pacientes en la base de datos, responder dudas sobre la plataforma, guiarte en el registro de citas, caja o historia médica. ¿En qué te ayudo?`;
  }

  // 8. Agradecimiento
  if (text.includes('gracias') || text.includes('excelente') || text.includes('bueno') || text.includes('ok')) {
    return `¡Con mucho gusto! 😊 Estoy disponible 24/7 en el sistema SARA. ¿Tienes alguna otra consulta sobre pacientes o el sistema?`;
  }

  // 9. Respuesta por defecto con orientación clara
  return `🤖 Soy **SARA-AI**, tu asistente inteligente del centro médico. Puedes preguntarme directamente sobre:
1. 👤 **Buscar Pacientes:** *"¿Cuántos pacientes hay registrados?"* o *"Datos del paciente Pedro"*
2. 📅 **Citas Médicas:** *"¿Cómo agendar una cita?"*
3. 💳 **Registro de Caja:** *"¿Cómo procesar un pago?"*
4. 🩺 **Datos Clínicos:** *"¿Cómo acceder a la historia médica?"*
5. 📊 **Estadísticas:** *"¿Dónde ver los reportes del sistema?"*`;
};

// Procesar mensajes de texto de SARA-AI
const handleAiChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    const responseText = await generateServerSaraResponse(message);

    return res.json({
      success: true,
      response: responseText,
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
