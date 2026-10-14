import { useState } from 'react';
import { resetPlan } from '../../lib/planner/store';

export function ResetPlan() {
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="stack">
      <h2>Empezar de nuevo</h2>
      <p>Si ya pasó el cumple o querés organizar otro, podés borrar este plan y arrancar uno en blanco.</p>
      {confirmReset ? (
        <div className="confirm-box" role="alertdialog" aria-labelledby="reset-title">
          <h3 id="reset-title">¿Borrar el plan de este navegador?</h3>
          <p>Se pierden los datos del festejo, los gastos, la checklist y la lista de compras. No se puede deshacer.</p>
          <div className="inline-actions">
            <button type="button" className="button-danger" onClick={() => { resetPlan(); setConfirmReset(false); }}>Borrar plan</button>
            <button type="button" className="button-quiet" onClick={() => setConfirmReset(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="inline-actions">
          <button type="button" className="button-danger" onClick={() => setConfirmReset(true)}>Borrar plan</button>
        </div>
      )}
    </div>
  );
}
