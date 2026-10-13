import React from 'react';
import './DynamicFormRenderer.css';

export function DynamicFormRenderer({ fields = [], values = {}, onChange, readOnly = false }) {
  if (!fields || fields.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '10px' }}>
        Esta plantilla no posee campos definidos.
      </div>
    );
  }

  const handleChange = (fieldId, val) => {
    if (readOnly || !onChange) return;
    onChange(fieldId, val);
  };

  return (
    <div className="dynamic-form-grid">
      {fields.map((field, idx) => {
        const fieldKey = field.id || `field_${idx}`;
        const val = values[fieldKey] !== undefined ? values[fieldKey] : (field.defaultValue || '');
        const isHalf = field.width === 'half';

        return (
          <div key={fieldKey} className={`dynamic-form-field ${isHalf ? 'half' : 'full'}`}>
            {field.type !== 'checkbox' && (
              <label className="dynamic-form-label">
                {field.label}
                {field.required && <span className="dynamic-form-required">*</span>}
              </label>
            )}

            {/* Input según tipo */}
            {field.type === 'textarea' ? (
              <textarea
                className="dynamic-form-textarea"
                rows={3}
                placeholder={field.placeholder || ''}
                value={val}
                disabled={readOnly}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <select
                className="dynamic-form-select"
                value={val}
                disabled={readOnly}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
              >
                <option value="">-- Seleccionar --</option>
                {(field.options || []).map((opt, oIdx) => (
                  <option key={oIdx} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <label className="dynamic-form-checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(val)}
                  disabled={readOnly}
                  onChange={(e) => handleChange(fieldKey, e.target.checked)}
                />
                <span>
                  {field.label}
                  {field.required && <span className="dynamic-form-required">*</span>}
                </span>
              </label>
            ) : (
              <input
                type={field.type || 'text'}
                className="dynamic-form-input"
                placeholder={field.placeholder || ''}
                value={val}
                disabled={readOnly}
                onChange={(e) => handleChange(fieldKey, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DynamicFormRenderer;
