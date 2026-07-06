import React from 'react';

export const Esculapio = ({ size = 32, className = '', style = {} }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={style}
  >
    {/* Vara de Esculapio */}
    <path d="M12 2v20" strokeWidth="2.5" />
    
    {/* Cuerpo de la serpiente enrollada */}
    <path d="M 9.5 6 C 15 3, 16.5 9, 12 11 C 7.5 13, 9 19, 14 18" strokeWidth="2" />
    
    {/* Cabeza de la serpiente */}
    <circle cx="8" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
