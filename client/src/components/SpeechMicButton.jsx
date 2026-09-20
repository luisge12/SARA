import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle, X, HelpCircle } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

/**
 * Botón con microinteracción visual para dictado por voz directo al sistema SARA
 * Incluye diagnóstico de micrófono en tiempo real y soporte alternativo con tecla Win + H.
 */
export function SpeechMicButton({ onAppendText, title = "Dictar por voz" }) {
  const [showWinTip, setShowWinTip] = useState(false);

  const {
    isSupported,
    isListening,
    interimText,
    errorMessage,
    toggleListening,
    clearError
  } = useSpeechToText({
    onTranscript: (spokenText) => {
      if (onAppendText && spokenText) {
        onAppendText(spokenText);
      }
    }
  });

  useEffect(() => {
    let timer;
    if (isListening && !interimText) {
      timer = setTimeout(() => {
        setShowWinTip(true);
      }, 3000);
    } else {
      setShowWinTip(false);
    }
    return () => clearTimeout(timer);
  }, [isListening, interimText]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', position: 'relative' }}>
      <button
        type="button"
        onClick={toggleListening}
        title={
          isListening
            ? "Detener dictado por voz (Escuchando...)"
            : `${title} (o presiona tecla Windows + H)`
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: isListening ? '2px solid #ef4444' : errorMessage ? '2px solid #f59e0b' : '1px solid #94a3b8',
          backgroundColor: isListening ? '#fef2f2' : '#ffffff',
          color: isListening ? '#ef4444' : errorMessage ? '#b45309' : '#0f172a',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isListening ? '0 0 14px rgba(239, 68, 68, 0.45)' : '0 1px 2px rgba(0,0,0,0.05)',
          position: 'relative'
        }}
      >
        {isListening ? <MicOff size={17} /> : <Mic size={17} />}
        {isListening && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '9px',
              height: '9px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 6px #ef4444'
            }}
          />
        )}
      </button>

      {/* ESTADO ESCUCHANDO */}
      {isListening && (
        <span
          style={{
            fontSize: '0.8rem',
            color: '#991b1b',
            fontWeight: 600,
            maxWidth: '320px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: '#fee2e2',
            padding: '4px 10px',
            borderRadius: '12px',
            border: '1px solid #fca5a5',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title={interimText || "Escuchando... Puedes hablar ahora o pausar cuando termines"}
        >
          {interimText ? (
            <span>🗣️ <i>"{interimText}"</i></span>
          ) : (
            <span>🎙️ {showWinTip ? "Habla ahora (o usa Win + H)" : "Escuchando micrófono..."}</span>
          )}
        </span>
      )}

      {/* MENSAJE DE ERROR O DIAGNÓSTICO */}
      {errorMessage && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            color: '#92400e',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            padding: '3px 8px',
            borderRadius: '8px',
            maxWidth: '420px',
            lineHeight: 1.3
          }}
        >
          <AlertCircle size={14} style={{ flexShrink: 0, color: '#d97706' }} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button
            type="button"
            onClick={clearError}
            title="Cerrar aviso"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#78350f',
              padding: 0,
              display: 'inline-flex'
            }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* BADGE DE ATAJO WINDOWS + H (SUPER ÚTIL EN CASO DE FALLO DEL NAVEGADOR) */}
      <span
        title="Dictado nativo de Windows: Haz clic en el cuadro de texto y presiona la tecla Windows + H en tu teclado para dictar con la máxima precisión."
        style={{
          fontSize: '0.73rem',
          color: '#475569',
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          padding: '2px 7px',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: 'help',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          userSelect: 'none'
        }}
      >
        <kbd style={{ fontFamily: 'inherit', background: '#ffffff', padding: '1px 4px', borderRadius: '3px', border: '1px solid #cbd5e1', fontSize: '0.7rem' }}>Win</kbd> + <kbd style={{ fontFamily: 'inherit', background: '#ffffff', padding: '1px 4px', borderRadius: '3px', border: '1px solid #cbd5e1', fontSize: '0.7rem' }}>H</kbd>
      </span>
    </div>
  );
}
