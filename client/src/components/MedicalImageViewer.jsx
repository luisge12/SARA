import React, { useRef, useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Contrast, Sun } from 'lucide-react';
import './MedicalImageViewer.css';

export default function MedicalImageViewer({ imageUrl }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      draw();
    };

    image.src = imageUrl;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `contrast(${contrast}%) brightness(${brightness}%)`;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(image, -image.width / 2, -image.height / 2);
      ctx.restore();
    };

    if (image.complete) draw();
  }, [imageUrl, contrast, brightness, rotation]);

  const handleZoom = (amount) => {
    setScale((prev) => Math.max(0.1, prev + amount));
  };

  const handleRotate = (degrees) => {
    setRotation((prev) => (prev + degrees) % 360);
  };

  return (
    <div className="medical-viewer-container">
      <div className="viewer-toolbar">
        <button onClick={() => handleZoom(0.1)} title="Zoom In"><ZoomIn size={18} /></button>
        <button onClick={() => handleZoom(-0.1)} title="Zoom Out"><ZoomOut size={18} /></button>
        <div className="toolbar-separator"></div>
        <button onClick={() => handleRotate(-90)} title="Rotar Izquierda"><RotateCcw size={18} /></button>
        <button onClick={() => handleRotate(90)} title="Rotar Derecha"><RotateCw size={18} /></button>
        <div className="toolbar-separator"></div>
        
        <div className="slider-group">
          <Contrast size={18} />
          <input 
            type="range" 
            min="0" max="200" 
            value={contrast} 
            onChange={(e) => setContrast(e.target.value)}
            title="Contraste"
          />
        </div>
        
        <div className="slider-group">
          <Sun size={18} />
          <input 
            type="range" 
            min="0" max="200" 
            value={brightness} 
            onChange={(e) => setBrightness(e.target.value)}
            title="Brillo"
          />
        </div>
      </div>
      
      <div className="canvas-wrapper" ref={containerRef}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease'
          }} 
        />
      </div>
      <div className="viewer-footer">
        Nota: El soporte completo de archivos DICOM nativos requeriría un servidor o librería WADO (ej. cornerstone.js). Para esta demostración, usamos renderizado en Canvas.
      </div>
    </div>
  );
}
