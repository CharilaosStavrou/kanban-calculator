import { useState } from 'react';
import { validateNumber } from '../lib/validation.js';

// Text input for numbers (inputMode="decimal" instead of type="number").
// While focused it keeps the raw text as a draft; valid values are committed immediately,
// invalid text shows an error and is reverted to the last valid value on blur.
export default function NumericInput({ value, rule, onCommit, label, className = '' }) {
  const [draft, setDraft] = useState(null);
  const text = draft ?? String(value);
  const { error } = validateNumber(text, rule);

  function handleChange(event) {
    const nextText = event.target.value;
    setDraft(nextText);
    const result = validateNumber(nextText, rule);
    if (!result.error) onCommit(result.value);
  }

  return (
    <span className={`numeric-input ${className}`}>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        aria-label={label}
        aria-invalid={Boolean(error)}
        className={error ? 'input-invalid' : ''}
        onFocus={() => setDraft(String(value))}
        onChange={handleChange}
        onBlur={() => setDraft(null)}
      />
      {error && <span className="input-error">{error}</span>}
    </span>
  );
}
