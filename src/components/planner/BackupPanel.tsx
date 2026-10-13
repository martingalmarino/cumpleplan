import { useState } from 'react';
import { track } from '../../lib/analytics';
import { formatCalendarDate } from '../../lib/planner/dates';
import { parseBackup, serializePlan, type BackupPreview } from '../../lib/planner/schema';
import { replacePlan, resetPlan } from '../../lib/planner/store';
import type { Plan } from '../../lib/planner/types';

export function BackupPanel({ plan }: { plan: Plan }) {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ plan: Plan; summary: BackupPreview } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [paste, setPaste] = useState('');

  function review(text: string) {
    const result = parseBackup(text);
    if (!result.ok) {
      setPreview(null);
      setError(result.error);
      return;
    }
    setError(null);
    setPreview({ plan: result.plan, summary: result.preview });
  }

  function exportPlan() {
    const blob = new Blob([serializePlan(plan)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cumple-en-orden-plan.json';
    link.click();
    URL.revokeObjectURL(url);
    track('backup_exported', { tool: 'respaldo' });
  }

  return (
    <div className="stack">
      <h2>Respaldo</h2>
      <p>Exportá tu plan para abrirlo en otro dispositivo. El archivo reemplaza el plan de ese navegador cuando lo importás. No hay cuenta ni copia en un servidor.</p>
      <div className="inline-actions">
        <button type="button" className="button button-primary" onClick={exportPlan}>Exportar JSON</button>
        <button type="button" className="button-danger" onClick={() => setConfirmReset(true)}>Borrar plan</button>
      </div>
      {confirmReset ? (
        <div className="confirm-box" role="alertdialog" aria-labelledby="reset-title">
          <h3 id="reset-title">¿Borrar el plan de este navegador?</h3>
          <p>Se pierden los gastos, la checklist y la lista de este navegador. Si lo querés conservar, exportalo antes.</p>
          <div className="inline-actions">
            <button type="button" className="button-danger" onClick={() => { resetPlan(); setConfirmReset(false); }}>Borrar plan</button>
            <button type="button" className="button-quiet" onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="import-file">Importar un archivo</label>
        <input
          id="import-file"
          type="file"
          accept="application/json,.json"
          onChange={(input) => {
            const file = input.target.files?.[0];
            if (!file) return;
            if (file.size > 350_000) {
              setError('El archivo es demasiado grande.');
              return;
            }
            const reader = new FileReader();
            reader.onload = () => review(String(reader.result ?? ''));
            reader.readAsText(file);
          }}
        />
      </div>
      <div className="field">
        <label htmlFor="import-paste">O pegá el JSON</label>
        <textarea id="import-paste" value={paste} onChange={(input) => setPaste(input.target.value)} />
      </div>
      <button type="button" className="button-quiet" onClick={() => review(paste)}>Revisar texto</button>
      {error ? <p className="field-error" role="alert">{error} Tu plan actual sigue igual.</p> : null}
      {preview ? (
        <div className="confirm-box" role="region" aria-label="Vista previa del respaldo">
          <h3>Vista previa</h3>
          <ul>
            <li>Nombre: {preview.summary.label}</li>
            <li>Fecha: {preview.summary.date ? formatCalendarDate(preview.summary.date) : 'sin fecha'}</li>
            <li>{preview.summary.children} chicos y {preview.summary.adults} adultos</li>
            <li>{preview.summary.budgetLines} gastos, {preview.summary.quotes} alternativas, {preview.summary.tasks} tareas ({preview.summary.doneTasks} hechas), {preview.summary.shoppingItems} compras</li>
          </ul>
          <p>Si confirmás, este archivo reemplaza el plan de este navegador.</p>
          <div className="inline-actions">
            <button type="button" className="button button-primary" onClick={() => { replacePlan(preview.plan); setPreview(null); }}>
              Reemplazar mi plan
            </button>
            <button type="button" className="button-quiet" onClick={() => setPreview(null)}>Cancelar</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
