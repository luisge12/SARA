import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

/**
 * Botón con microinteracción visual para dictado por voz directo al sistema SARA
 */
export function SpeechMicButton({ onAppendText, title = "Dictar por voz" }) {
  const { isSupported, isListening, toggleListening } = useSpeechToText({
    onTranscript: (spokenText) => {
      if (onAppendText && spokenText) {
        onAppendText(spokenText);
      }
    }
  });

  if (!isSupported) {
    return null; // Ocultar limpiamente en navegadores sin soporte nativo
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? "Detener dictado por voz (Escuchando...)" : title}
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
  );
}
