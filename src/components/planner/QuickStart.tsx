import { plannerLimits } from '../../config/calculator';
import { updatePlan } from '../../lib/planner/store';
import { IntegerField } from './fields';
import { usePlanner } from './usePlanner';

export default function QuickStart() {
  const snapshot = usePlanner();
  if (!snapshot.ready) {
    return <p role="status">Cargando el plan de este navegador…</p>;
  }
  const event = snapshot.plan.event;
  return (
    <form className="quick-start" onSubmit={(input) => input.preventDefault()}>
      <div>
        <h2>¿Cuántos se suman al cumple?</h2>
        <p className="hint">Podés seguir con tu plan guardado.</p>
      </div>
      <div className="quick-fields">
        <IntegerField
          label="Chicos"
          value={event.childrenCount}
          min={0}
          max={plannerLimits.maxPerGroup}
          onCommit={(childrenCount) => updatePlan((current) => ({ ...current, event: { ...current.event, childrenCount } }))}
        />
        <IntegerField
          label="Adultos"
          value={event.adultsCount}
          min={0}
          max={plannerLimits.maxPerGroup}
          onCommit={(adultsCount) => updatePlan((current) => ({ ...current, event: { ...current.event, adultsCount } }))}
        />
        <IntegerField
          label="Horas"
          value={event.durationHours}
          min={1}
          max={8}
          onCommit={(durationHours) => updatePlan((current) => ({ ...current, event: { ...current.event, durationHours } }))}
        />
      </div>
      <a className="button button-primary" href="/calculadora-comida-cumpleanos/">Calcular cantidades</a>
    </form>
  );
}
