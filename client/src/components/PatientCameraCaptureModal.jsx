import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Upload } from 'lucide-react';
import { Button } from './Button';

/**
 * Modal para captura directa de fotografía/selfie del paciente mediante la cámara web
 * o subida de archivo para validación de identidad e historial visual.
 */
export function PatientCameraCaptureModal({ isOpen, onClose, onCapturePhoto }) {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador no soporta acceso directo a cámara web.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Error al acceder a la cámara:', err);
      setCameraError('No se pudo activar la cámara web. Puede subir una foto desde su equipo.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (capturedImage && onCapturePhoto) {
      onCapturePhoto(capturedImage);
    }
    stopCamera();
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Cabecera */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={20} style={{ color: '#0d9488' }} />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>
              Captura Visual del Paciente
            </h3>
          </div>
          <button
            type="button"
            onClick={() => { stopCamera(); onClose(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Visor de Cámara o Imagen */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#0f172a',
          minHeight: '340px',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {capturedImage ? (
            <img
              src={capturedImage}
              alt="Foto del paciente"
              style={{
                width: '320px',
                height: '320px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '4px solid #14b8a6',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
              }}
            />
          ) : cameraError ? (
            <div style={{ color: '#f87171', textAlign: 'center', padding: '1.5rem', maxWidth: '300px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{cameraError}</p>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '320px', height: '320px' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '3px dashed #0d9488'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '260px',
                height: '260px',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
            </div>
          )}
        </div>

        {/* Controles de Acción */}
        <div style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Upload size={15} /> Subir Archivo
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {capturedImage ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={15} /> Repetir
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#0d9488' }}
                >
                  <Check size={16} /> Aceptar Foto
                </Button>
              </>
            ) : (
              <Button
                type="button"
                onClick={handleSnap}
                disabled={!!cameraError}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#0d9488',
                  padding: '0.5rem 1.5rem'
                }}
              >
                <Camera size={18} /> Capturar Foto
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
