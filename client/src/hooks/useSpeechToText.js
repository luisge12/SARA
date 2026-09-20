import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook de dictado por voz de grado médico mediante Web Speech API.
 * Con reconexión automática en pausas, gestión de instancias y mensajes claros de diagnóstico.
 */
export function useSpeechToText({ onTranscript, lang = 'es-ES' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const isListeningRef = useRef(false);
  const pendingInterimRef = useRef('');
  const restartTimerRef = useRef(null);
  const hasFatalErrorRef = useRef(false);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    hasFatalErrorRef.current = false;
    setIsListening(false);

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (pendingInterimRef.current.trim() && onTranscriptRef.current) {
      onTranscriptRef.current(pendingInterimRef.current.trim());
      pendingInterimRef.current = '';
    }
    setInterimText('');
  }, []);

  const createAndStartRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMessage('Tu navegador actual no tiene soporte para la API de reconocimiento de voz. Usa Chrome o Edge, o presiona Win + H.');
      return;
    }

    // Limpiar instancia previa si existe
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      // Preferir es-ES o dialecto de español del sistema
      const systemLang = navigator.language || 'es-ES';
      recognition.lang = systemLang.startsWith('es') ? systemLang : (lang || 'es-ES');

      recognition.onstart = () => {
        setIsListening(true);
        hasFatalErrorRef.current = false;
        setErrorMessage(null);
      };

      recognition.onresult = (event) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalChunk += text + ' ';
          } else {
            interimChunk += text;
          }
        }

        if (finalChunk.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(finalChunk.trim());
          pendingInterimRef.current = '';
          setInterimText('');
        } else if (interimChunk) {
          pendingInterimRef.current = interimChunk;
          setInterimText(interimChunk);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);

        if (event.error === 'no-speech') {
          // Silencio detectado momentáneamente; no es error fatal
          return;
        }

        if (event.error === 'aborted') {
          return;
        }

        hasFatalErrorRef.current = true;
        isListeningRef.current = false;
        setIsListening(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage('Permiso de micrófono bloqueado. Haz clic en el ícono del candado 🔒 junto a la dirección web y habilita el micrófono.');
        } else if (event.error === 'audio-capture') {
          setErrorMessage('No se detectó señal de micrófono. Revisa que el micrófono esté conectado y no esté silenciado en Windows.');
        } else if (event.error === 'network') {
          setErrorMessage('El servicio de voz de Google no respondió (error de red). Puedes usar el atajo nativo de Windows: Win + H.');
        } else {
          setErrorMessage(`Error de voz (${event.error}). Puedes usar la tecla Win + H para dictar directamente.`);
        }
      };

      recognition.onend = () => {
        if (pendingInterimRef.current.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(pendingInterimRef.current.trim());
          pendingInterimRef.current = '';
        }
        setInterimText('');

        // Si el usuario aún desea seguir escuchando y no hubo error fatal, crear una instancia fresca
        if (isListeningRef.current && !hasFatalErrorRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && !hasFatalErrorRef.current) {
              createAndStartRecognition();
            }
          }, 150);
        } else {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Error al instanciar SpeechRecognition:', e);
      hasFatalErrorRef.current = true;
      isListeningRef.current = false;
      setIsListening(false);
      setErrorMessage('No se pudo iniciar el micrófono en este navegador. Presiona Win + H para dictar con Windows.');
    }
  }, [lang]);

  const startListening = useCallback(async () => {
    setErrorMessage(null);
    hasFatalErrorRef.current = false;
    isListeningRef.current = true;
    setIsListening(true);
    pendingInterimRef.current = '';
    setInterimText('');

    // Solicitar permiso de micrófono si el navegador lo permite
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Liberar el stream inmediatamente, solo queríamos confirmar permiso
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          hasFatalErrorRef.current = true;
          isListeningRef.current = false;
          setIsListening(false);
          setErrorMessage('Permiso de micrófono denegado. Permite el acceso al micrófono en la barra de direcciones del navegador.');
          return;
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          hasFatalErrorRef.current = true;
          isListeningRef.current = false;
          setIsListening(false);
          setErrorMessage('No se encontró ningún micrófono conectado a tu equipo.');
          return;
        }
        // Otros errores no fatales continúan a recognition
      }
    }

    if (!isListeningRef.current) return;
    createAndStartRecognition();
  }, [createAndStartRecognition]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSupported,
    isListening,
    interimText,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setErrorMessage(null)
  };
}
