import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

/**
 * Botón con microinteracción visual para dictado por voz directo al sistema SARA
 */
export function SpeechMicButton({ onAppendText, title = "Dictar por voz" }) {
  const [showWinTip, setShowWinTip] = useState(false);

  const { isSupported, isListening, interimText, toggleListening } = useSpeechToText({
    onTranscript: (spokenText) => {
      if (onAppendText && spokenText) {
        onAppendText(spokenText);
      }
    }
  });

  React.useEffect(() => {
    let timer;
    if (isListening && !interimText) {
      timer = setTimeout(() => {
        setShowWinTip(true);
      }, 3500);
    } else {
      setShowWinTip(false);
    }
    return () => clearTimeout(timer);
  }, [isListening, interimText]);

  if (!isSupported) {
    return null; // Ocultar limpiamente en navegadores sin soporte nativo
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <button
        type="button"
        onClick={toggleListening}
        title={isListening ? "Detener dictado por voz (Escuchando...)" : `${title} (o presiona tecla Windows + H)`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: isListening ? '2px solid #ef4444' : '1px solid #cbd5e1',
          backgroundColor: isListening ? '#fef2f2' : '#ffffff',
          color: isListening ? '#ef4444' : '#64748b',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.45)' : 'none',
          position: 'relative'
        }}
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        {isListening && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              animation: 'pulse 1s infinite'
            }}
          />
        )}
      </button>

      {isListening && (
        <span
          style={{
            fontSize: '0.78rem',
            color: '#dc2626',
            fontWeight: 600,
            maxWidth: '300px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            background: '#fef2f2',
            padding: '2px 8px',
            borderRadius: '12px',
            border: '1px solid #fecaca'
          }}
          title={interimText || (showWinTip ? "Tip: También puedes usar Windows + H para dictar directamente" : "Escuchando voz...")}
        >
          {interimText 
            ? `"${interimText}"` 
            : (showWinTip ? "🎙️ Habla o usa tecla Win + H" : "🎙️ Escuchando...")
          }
        </span>
      )}
    </div>
  );
}
