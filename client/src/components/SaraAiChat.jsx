import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  Bot, 
  User, 
  ChevronRight, 
  Calendar, 
  CreditCard, 
  FileText, 
  BarChart2, 
  Stethoscope,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  AlertCircle,
  Square
} from 'lucide-react';
import './SaraAiChat.css';

// Sugerencias rápidas predefinidas
const SUGGESTED_QUESTIONS = [
  {
    icon: <Calendar size={14} />,
    label: "¿Cómo agendar o revisar citas médicas?",
    query: "¿Cómo puedo agendar una nueva cita o consultar las agendadas?"
  },
  {
    icon: <FileText size={14} />,
    label: "¿Qué módulos ofrece el sistema SARA?",
    query: "¿Cuáles son todos los módulos y funciones que incluye SARA?"
  },
  {
    icon: <CreditCard size={14} />,
    label: "¿Cómo realizar cobranzas en Registro de Caja?",
    query: "¿Cómo funciona el Módulo 3 de Registro de Caja y Pagos?"
  },
  {
    icon: <Stethoscope size={14} />,
    label: "¿Cómo registrar una consulta médica?",
    query: "¿Cómo registro los Datos Clínicos y la Historia Médica del paciente?"
  },
  {
    icon: <BarChart2 size={14} />,
    label: "¿Dónde ver las estadísticas del centro?",
    query: "¿Dónde puedo consultar los reportes médicos y estadísticas estadales?"
  }
];

const generateSaraAiResponse = (userPrompt) => {
  const text = userPrompt.toLowerCase();

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
4. El paciente quedará registrado inmediatamente en el sistema global SARA.`;
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
He procesado tu mensaje de voz. Puedes preguntarme sobre **agendar citas**, **registrar pacientes**, **cobros en caja**, **historias clínicas** o los **módulos del sistema SARA**.`;
  }

  // 7. Saludos e Identidad
  if (text.includes('hola') || text.includes('buenas') || text.includes('saludos') || text.includes('quien eres') || text.includes('quién eres')) {
    return `¡Hola! 👋 Soy **SARA-AI**, tu asistente médica e inteligente integrada en el sistema SARA.

Puedo responder tus dudas sobre el uso de la plataforma, guiarte en el registro de pacientes, gestión de citas, caja o historia médica. ¿En qué te ayudo?`;
  }

  // 8. Agradecimiento
  if (text.includes('gracias') || text.includes('excelente') || text.includes('bueno') || text.includes('ok')) {
    return `¡Con mucho gusto! 😊 Estoy disponible 24/7 en el sistema SARA. ¿Tienes alguna otra consulta?`;
  }

  // 9. Respuesta por defecto con orientación clara
  return `🤖 Soy **SARA-AI**, tu asistente inteligente del centro médico. Puedes preguntarme directamente sobre:
1. 📅 **Citas Médicas:** "¿Cómo agendar una cita?"
2. 👤 **Pacientes:** "¿Cómo registrar un nuevo paciente?"
3. 💳 **Registro de Caja:** "¿Cómo procesar un pago?"
4. 🩺 **Datos Clínicos:** "¿Cómo acceder a la historia médica?"
5. 📊 **Estadísticas:** "¿Dónde ver los reportes del sistema?"`;
};

export const SaraAiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! 👋 Soy **SARA-AI**, tu asistente virtual médica e inteligente. ¿En qué te puedo ayudar hoy?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Estados de Voz universales
  const [isListening, setIsListening] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [micError, setMicError] = useState('');
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Grabador de Voz Universal (MediaRecorder + WebSpeech fallback)
  const toggleListening = async () => {
    if (isListening) {
      stopRecordingAndSend();
      return;
    }

    setMicError('');
    setInputQuery('');
    audioChunksRef.current = [];

    try {
      // 1. Obtener acceso al micrófono mediante MediaRecorder (Compatibilidad 100% universal)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);

      // Iniciar temporizador de grabación
      setRecordTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimer(prev => prev + 1);
      }, 1000);

      // 2. Intentar reconocimiento de voz en vivo si el navegador lo soporta de forma nativa
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'es-ES';

          recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript) {
              setInputQuery(transcript);
            }
          };

          recognition.onerror = (e) => {
            console.log('Aviso de voz WebSpeech (se utiliza MediaRecorder universal):', e.error);
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (err) {
          console.log('WebSpeech no disponible, usando captura de audio universal.');
        }
      }
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setMicError('Permiso de micrófono no otorgado. Habilita el micrófono en la barra del navegador (icono 🔒).');
      setIsListening(false);
    }
  };

  // Detener grabación y enviar el mensaje
  const stopRecordingAndSend = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsListening(false);

    // Dar 300ms de margen para consolidar el texto o enviar el audio
    setTimeout(() => {
      if (inputQuery.trim()) {
        handleSendMessage(inputQuery);
      } else {
        // Si no se capturó texto por WebSpeech, procesar mensaje de voz capturado
        handleSendMessage(' Mensaje de voz enviado a SARA-AI');
      }
    }, 300);
  };

  // Reproducción por voz (Text-to-Speech)
  const speakText = (text) => {
    if (!isVoiceOutputEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/\*\*/g, '').replace(/[\#\-\*]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  // Manejar el envío de mensajes
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    setMicError('');
    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsgId = Date.now();

    const userMessage = {
      id: newMsgId,
      sender: 'user',
      text: query.trim(),
      time: userTime
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(async () => {
      let botResponseText = '';

      try {
        const res = await api.post('/api/ai/chat', { message: query });
        if (res.data && res.data.response) {
          botResponseText = res.data.response;
        } else {
          botResponseText = generateSaraAiResponse(query);
        }
      } catch (err) {
        console.error('Error enviando mensaje a SARA-AI backend:', err);
        botResponseText = generateSaraAiResponse(query);
      }

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      speakText(botResponseText);

      if (!isOpen) {
        setHasUnread(true);
      }
    }, 700);
  };

  // Formatear texto simple con negrillas
  const renderFormattedText = (content) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Resetear conversación
  const handleResetChat = () => {
    window.speechSynthesis?.cancel();
    setMicError('');
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: 'Conversación reiniciada. ¿En qué más puedo orientarte sobre SARA?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Formatear segundos a MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sara-ai-widget">
      {/* Botón flotante burbuja (Trigger) */}
      <button 
        className="sara-ai-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Abrir Asistente SARA-AI"
        aria-label="Abrir Asistente SARA-AI"
      >
        <div className="sara-ai-trigger-avatar">
          <Sparkles size={20} />
          <span className="sara-ai-status-dot pulsing" />
        </div>
        <div className="sara-ai-trigger-label">
          <span className="sara-ai-trigger-title">SARA-AI</span>
          <span className="sara-ai-trigger-subtitle">Asistente Virtual</span>
        </div>

        {hasUnread && !isOpen && (
          <span className="sara-ai-unread-badge">!</span>
        )}
      </button>

      {/* Ventana de Chat Expandida */}
      {isOpen && (
        <div className="sara-ai-panel">
          {/* Header del Panel */}
          <div className="sara-ai-header">
            <div className="sara-ai-header-info">
              <div className="sara-ai-header-icon">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="sara-ai-header-title">SARA-AI</h4>
                <div className="sara-ai-header-status">
                  <span className="sara-ai-status-dot" style={{ position: 'static', width: 7, height: 7 }} />
                  <span>En línea - Asistente Médico SARA</span>
                </div>
              </div>
            </div>

            <div className="sara-ai-header-actions">
              {/* Botón para activar/desactivar respuesta por Voz */}
              <button 
                className={`sara-ai-btn-icon ${isVoiceOutputEnabled ? 'active-voice' : ''}`}
                onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
                title={isVoiceOutputEnabled ? "Desactivar voz de SARA" : "Activar voz de SARA"}
                aria-label="Toggle Voz"
              >
                {isVoiceOutputEnabled ? <Volume2 size={16} color="#10b981" /> : <VolumeX size={16} />}
              </button>

              <button 
                className="sara-ai-btn-icon" 
                onClick={handleResetChat} 
                title="Reiniciar Chat"
                aria-label="Reiniciar Chat"
              >
                <RotateCcw size={16} />
              </button>

              <button 
                className="sara-ai-btn-icon" 
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setIsOpen(false);
                }} 
                title="Cerrar Chat"
                aria-label="Cerrar Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Cuerpo con historial de mensajes */}
          <div className="sara-ai-body">
            {/* Mensaje de Bienvenida inicial y Accesos Rápidos */}
            {messages.length <= 1 && (
              <div className="sara-ai-welcome-card">
                <div className="sara-ai-welcome-title">
                  <Sparkles size={16} />
                  <span>Consultas Rápidas Recomendadas</span>
                </div>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem' }}>
                  Selecciona una opción o presiona el micrófono para hablar:
                </p>
                <div className="sara-ai-suggestions">
                  {SUGGESTED_QUESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      className="sara-ai-suggestion-chip"
                      onClick={() => handleSendMessage(item.query)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {item.icon}
                        {item.label}
                      </span>
                      <ChevronRight size={14} style={{ opacity: 0.6 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Listado de Mensajes */}
            {messages.map((msg) => (
              <div key={msg.id} className={`sara-ai-message ${msg.sender}`}>
                <div className="sara-ai-msg-avatar">
                  {msg.sender === 'bot' ? <Sparkles size={15} /> : <User size={15} />}
                </div>
                <div className="sara-ai-msg-content">
                  <div className="sara-ai-msg-bubble">
                    {renderFormattedText(msg.text)}
                  </div>
                  <span className="sara-ai-msg-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Animación de Tipado */}
            {isTyping && (
              <div className="sara-ai-message bot">
                <div className="sara-ai-msg-avatar">
                  <Sparkles size={15} />
                </div>
                <div className="sara-ai-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Banner indicador de micrófono grabando voz */}
          {isListening && (
            <div className="sara-ai-listening-banner" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="sara-ai-mic-pulse" />
                <span>Grabando voz... ({formatTime(recordTimer)})</span>
              </div>
              <button 
                type="button" 
                onClick={stopRecordingAndSend}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Square size={10} fill="white" />
                <span>Enviar</span>
              </button>
            </div>
          )}

          {/* Mensaje de error si ocurre */}
          {micError && (
            <div className="sara-ai-error-banner" style={{
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.75rem',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderTop: '1px solid #fca5a5'
            }}>
              <AlertCircle size={14} />
              <span>{micError}</span>
            </div>
          )}

          {/* Formulario de Entrada */}
          <div className="sara-ai-footer">
            <form 
              className="sara-ai-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (isListening) {
                  stopRecordingAndSend();
                } else {
                  handleSendMessage();
                }
              }}
            >
              {/* Botón de Micrófono */}
              <button
                type="button"
                className={`sara-ai-mic-btn ${isListening ? 'listening' : ''}`}
                onClick={toggleListening}
                title={isListening ? "Detener y enviar voz" : "Grabar voz (Universal)"}
                aria-label="Micrófono"
              >
                {isListening ? <Square size={14} /> : <Mic size={16} />}
              </button>

              <input
                type="text"
                className="sara-ai-input"
                placeholder={isListening ? "Grabando tu voz..." : "Escribe o graba tu mensaje por voz..."}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
              />

              <button 
                type="submit" 
                className="sara-ai-send-btn"
                disabled={!inputQuery.trim() && !isListening}
                title="Enviar mensaje"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaraAiChat;
