import { plannerLimits } from '../../config/calculator';
import { settingLabels } from '../../lib/planner/labels';
import { updatePlan } from '../../lib/planner/store';
import type { Plan, Setting } from '../../lib/planner/types';
import { IntegerField, MoneyField, TextField } from './fields';

export function EventForm({ plan }: { plan: Plan }) {
  const event = plan.event;
  return (
    <div className="stack">
      <h2>El cumple</h2>
      <p className="hint">No hace falta el nombre del niño, la fecha de nacimiento, el colegio ni los datos de los invitados. La fecha es la del festejo.</p>
      <div className="field-grid">
        <TextField
          label="Nombre del plan"
          value={event.label}
          hint="Si lo dejás vacío, vuelve a “Mi cumple”."
          onText={(label) => updatePlan((current) => ({ ...current, event: { ...current.event, label: label.slice(0, 80) || ' ' } }))}
          onBlur={() =>
            updatePlan((current) => ({
              ...current,
              event: { ...current.event, label: current.event.label.trim() || 'Mi cumple' },
            }))
          }
        />
        <div className="field">
          <label htmlFor="event-date">Fecha del festejo</label>
          <input
            id="event-date"
            type="date"
            value={event.date ?? ''}
            onChange={(input) =>
              updatePlan((current) => ({
                ...current,
                event: { ...current.event, date: input.target.value || null },
              }))
            }
          />
          <p className="hint">Opcional. Si no la cargás, el checklist muestra “4 semanas antes” y no una fecha corrida.</p>
        </div>
        <div className="field">
          <label htmlFor="event-age">Edad que se festeja</label>
          <input
            id="event-age"
            inputMode="numeric"
            defaultValue={event.age ?? ''}
            key={event.age ?? 'sin-edad'}
            aria-describedby="event-age-hint"
            onBlur={(input) => {
              const raw = input.target.value.trim();
              if (raw === '') {
                updatePlan((current) => ({ ...current, event: { ...current.event, age: null } }));
                return;
              }
              if (!/^\d+$/.test(raw)) return;
              const age = Number(raw);
              if (age < plannerLimits.minAge || age > plannerLimits.maxAge) return;
              updatePlan((current) => ({ ...current, event: { ...current.event, age } }));
            }}
          />
          <p id="event-age-hint" className="hint">Opcional, de {plannerLimits.minAge} a {plannerLimits.maxAge}. No pedimos fecha de nacimiento.</p>
        </div>
        <div className="field">
          <label htmlFor="event-setting">Lugar</label>
          <select
            id="event-setting"
            value={event.setting}
            onChange={(input) =>
              updatePlan((current) => ({
                ...current,
                event: { ...current.event, setting: input.target.value as Setting },
              }))
            }
          >
            {(Object.keys(settingLabels) as Setting[]).map((setting) => (
              <option key={setting} value={setting}>{settingLabels[setting]}</option>
            ))}
          </select>
        </div>
        <IntegerField
          label="Duración en horas"
          hint="Entre 1 y 8. En este modelo la duración solo cambia las bebidas."
          value={event.durationHours}
          min={plannerLimits.minDuration}
          max={plannerLimits.maxDuration}
          onCommit={(durationHours) =>
            updatePlan((current) => ({ ...current, event: { ...current.event, durationHours } }))
          }
        />
        <IntegerField
          label="Chicos"
          value={event.childrenCount}
          min={0}
          max={plannerLimits.maxPerGroup}
          onCommit={(childrenCount) => {
            if (childrenCount + event.adultsCount > plannerLimits.maxTotalPeople) return;
            updatePlan((current) => ({ ...current, event: { ...current.event, childrenCount } }));
          }}
        />
        <IntegerField
          label="Adultos"
          value={event.adultsCount}
          min={0}
          max={plannerLimits.maxPerGroup}
          onCommit={(adultsCount) => {
            if (adultsCount + event.childrenCount > plannerLimits.maxTotalPeople) return;
            updatePlan((current) => ({ ...current, event: { ...current.event, adultsCount } }));
          }}
        />
        <MoneyField
          label="Objetivo de presupuesto"
          hint="Opcional, en pesos. No inventamos precios de mercado."
          value={event.budgetTargetCentavos}
          placeholder="Ingresá tu objetivo"
          onCommit={(budgetTargetCentavos) =>
            updatePlan((current) => ({ ...current, event: { ...current.event, budgetTargetCentavos } }))
          }
        />
      </div>
      {event.childrenCount + event.adultsCount > plannerLimits.maxTotalPeople ? (
        <p className="field-error">El total no puede pasar de {plannerLimits.maxTotalPeople} personas.</p>
      ) : null}
    </div>
  );
}
