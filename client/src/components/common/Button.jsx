import React from 'react';

function Button({ children, onClick, type = 'button', variant = 'publish', style }) {
  const className = variant === 'save' ? 'gf-btn gf-btn-save' : 'gf-btn gf-btn-publish';
  
  return (
    <button type={type} onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
}

export default Button;
