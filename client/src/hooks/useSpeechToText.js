import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook reutilizable para dictado por voz directo al sistema mediante Web Speech API nativa.
 * Compatible con Google Chrome, Edge, Safari y navegadores Chromium sin costo adicional.
 */
export function useSpeechToText({ onTranscript, lang = 'es-ES' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const isListeningRef = useRef(false);
  const pendingInterimRef = useRef('');

  // Mantener la referencia del callback siempre actualizada
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
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    // Si quedó texto provisional pendiente al detener el micrófono, vaciarlo
    if (pendingInterimRef.current.trim() && onTranscriptRef.current) {
      onTranscriptRef.current(pendingInterimRef.current.trim());
      pendingInterimRef.current = '';
    }
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Detener y limpiar cualquier sesión previa activa
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    isListeningRef.current = true;
    setIsListening(true);
    pendingInterimRef.current = '';
    setInterimText('');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang || (navigator.language ? navigator.language : 'es-ES');

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
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
        // Silencios momentáneos no deben apagar la escucha activa
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'aborted') {
          if (!isListeningRef.current) {
            setIsListening(false);
          }
          return;
        }
        if (event.error === 'not-allowed') {
          isListeningRef.current = false;
          setIsListening(false);
          alert('Permiso de micrófono no otorgado. Habilita el acceso en el candado 🔒 de tu navegador.');
          return;
        }
        console.warn('Aviso de reconocimiento de voz:', event.error);
      };

      recognition.onend = () => {
        if (pendingInterimRef.current.trim() && onTranscriptRef.current) {
          onTranscriptRef.current(pendingInterimRef.current.trim());
          pendingInterimRef.current = '';
        }
        setInterimText('');

        // Si el usuario aún no presionó el botón de detener, mantener viva la escucha continuamente
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch (err) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try { recognition.start(); } catch (e) {}
              }
            }, 100);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Error al iniciar reconocimiento de voz:', e);
      setInterimText('');
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [lang]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  return {
    isSupported,
    isListening,
    interimText,
    startListening,
    stopListening,
    toggleListening
  };
}
