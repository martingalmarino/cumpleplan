import { useState, useEffect } from 'react';
import { track } from '../../lib/analytics';
import { getSharedPlanFromUrl, clearUrlHash, hasSharedPlanInUrl } from '../../lib/sharing';
import { previewPlan } from '../../lib/planner/schema';
import { backupKindMessage } from '../../lib/planner/storage';
import { updatePlan } from '../../lib/planner/store';
import type { Plan } from '../../lib/planner/types';

type Props = {
  hasExistingPlan: boolean;
};

export function ImportSharedPlan({ hasExistingPlan }: Props) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof previewPlan> | null>(null);

  useEffect(() => {
    if (!hasSharedPlanInUrl()) return;

    const result = getSharedPlanFromUrl();
    if (!result) return;

    if (!result.ok) {
      setError(backupKindMessage(result));
      setImporting(true);
      return;
    }

    setPreview(previewPlan(result.plan));
    setImporting(true);
  }, []);

  if (!importing) return null;

  function handleImport(sharedPlan: Plan) {
    updatePlan(() => sharedPlan);
    clearUrlHash();
    setImporting(false);
    track('plan_imported', { had_existing: hasExistingPlan });
  }

  function handleCancel() {
    clearUrlHash();
    setImporting(false);
  }

  const sharedPlan = getSharedPlanFromUrl();

  return (
    <div className="confirm-box" role="alertdialog" aria-labelledby="import-title">
      <h3 id="import-title">Plan compartido detectado</h3>

      {error ? (
        <>
          <p className="field-error">{error}</p>
          <button type="button" className="button-quiet" onClick={handleCancel}>
            Cerrar
          </button>
        </>
      ) : preview && sharedPlan?.ok ? (
        <>
          <p>
            <strong>{preview.label}</strong>
          </p>
          <ul>
            <li>
              {preview.children} chicos y {preview.adults} adultos
            </li>
            {preview.date ? <li>Fecha: {new Date(preview.date).toLocaleDateString('es-AR')}</li> : null}
            <li>{preview.budgetLines} líneas de presupuesto</li>
            <li>
              {preview.tasks} tareas ({preview.doneTasks} hechas)
            </li>
            <li>{preview.shoppingItems} items de compras</li>
          </ul>

          {hasExistingPlan ? (
            <>
              <p className="banner warning">
                <strong>Atención:</strong> Tenés un plan guardado en este dispositivo. Si importás el plan compartido, 
                se va a reemplazar. Exportá tu plan actual antes si querés guardarlo.
              </p>
              <div className="inline-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleImport(sharedPlan.plan)}
                  data-import-action="replace-existing"
                >
                  Reemplazar mi plan actual
                </button>
                <button type="button" className="button-quiet" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <p>¿Querés cargar este plan?</p>
              <div className="inline-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => handleImport(sharedPlan.plan)}
                  data-import-action="import-new"
                >
                  Cargar plan
                </button>
                <button type="button" className="button-quiet" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </>
          )}
        </>
      ) : null}
    </div>
  );
}
