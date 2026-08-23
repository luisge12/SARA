import React from 'react';
import './Input.css';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  icon,
  className = '', 
  type,
  onKeyDown,
  onWheel,
  ...props 
}, ref) => {
  const handleKeyDown = (e) => {
    if (type === 'number' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
    }
    if (onKeyDown) onKeyDown(e);
  };

  const handleWheel = (e) => {
    if (type === 'number') {
      e.target.blur();
    }
    if (onWheel) onWheel(e);
  };

  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input 
          ref={ref}
          type={type}
          onKeyDown={handleKeyDown}
          onWheel={handleWheel}
          className={`input-field ${icon ? 'has-icon' : ''} ${error ? 'input-error' : ''}`} 
          {...props} 
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
