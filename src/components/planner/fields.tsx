import { useEffect, useId, useRef, useState } from 'react';
import { formatEditableArs, parseArsToCentavos } from '../../lib/planner/money';

type BaseProps = {
  label: string;
  hint?: string;
  value: string;
  onText: (value: string) => void;
  onBlur?: () => void;
  inputMode?: 'text' | 'numeric' | 'decimal';
  placeholder?: string;
};

export function TextField({ label, hint, value, onText, onBlur, inputMode = 'text', placeholder }: BaseProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-describedby={hintId}
        onChange={(event) => onText(event.target.value)}
        onBlur={onBlur}
      />
      {hint ? <p id={hintId} className="hint">{hint}</p> : null}
    </div>
  );
}

export function IntegerField({
  label,
  hint,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}) {
  const id = useId();
  const focused = useRef(false);
  const [text, setText] = useState(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="numeric"
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
        }}
        onBlur={() => {
          focused.current = false;
          if (text.trim() === '') {
            setError('Ingresá un número. El campo puede quedar vacío mientras escribís.');
            return;
          }
          if (!/^\d+$/.test(text.trim())) {
            setError('Usá un número entero, sin decimales.');
            return;
          }
          const parsed = Number(text.trim());
          if (parsed < min || parsed > max) {
            setError(`Tiene que estar entre ${min} y ${max}.`);
            return;
          }
          setError(null);
          onCommit(parsed);
        }}
      />
      {hint ? <p id={`${id}-hint`} className="hint">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : null}
    </div>
  );
}

export function DecimalField({
  label,
  hint,
  value,
  min,
  max,
  onCommit,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
}) {
  const id = useId();
  const focused = useRef(false);
  const [text, setText] = useState(String(value).replace('.', ','));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focused.current) setText(String(value).replace('.', ','));
  }, [value]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        value={text}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
        }}
        onBlur={() => {
          focused.current = false;
          const normalized = text.trim().replace(',', '.');
          if (!normalized) {
            setError('Ingresá un número.');
            return;
          }
          if (!/^\d+(\.\d+)?$/.test(normalized)) {
            setError('Usá coma para los decimales. Ejemplo: 0,6.');
            return;
          }
          const parsed = Number(normalized);
          if (parsed < min || parsed > max) {
            setError(`Tiene que estar entre ${min} y ${max}.`);
            return;
          }
          setError(null);
          onCommit(parsed);
        }}
      />
      {hint ? <p id={`${id}-hint`} className="hint">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : null}
    </div>
  );
}

export function MoneyField({
  label,
  hint,
  value,
  onCommit,
  placeholder = 'Ingresá tu precio',
}: {
  label: string;
  hint?: string;
  value: number | null;
  onCommit: (value: number | null) => void;
  placeholder?: string;
}) {
  const id = useId();
  const focused = useRef(false);
  const [text, setText] = useState(formatEditableArs(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!focused.current) setText(formatEditableArs(value));
  }, [value]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        onFocus={() => {
          focused.current = true;
        }}
        onChange={(event) => {
          setText(event.target.value);
          setError(null);
        }}
        onBlur={() => {
          focused.current = false;
          if (text.trim() === '') {
            setError(null);
            onCommit(null);
            return;
          }
          const parsed = parseArsToCentavos(text);
          if (!parsed.ok) {
            setError(parsed.error);
            return;
          }
          setError(null);
          onCommit(parsed.centavos);
        }}
      />
      {hint ? <p id={`${id}-hint`} className="hint">{hint}</p> : null}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : null}
    </div>
  );
}
