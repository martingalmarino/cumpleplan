import { useState } from 'react';
import { taskTitleToRubro } from '../../lib/directory';
import { track } from '../../lib/analytics';
import { checklistProgress } from '../../lib/planner/checklist';
import { presentTask, relativeTiming } from '../../lib/planner/dates';
import { createId } from '../../lib/planner/ids';
import { updatePlan } from '../../lib/planner/store';
import type { Plan, Task } from '../../lib/planner/types';
import { DirectoryCTA } from './DirectoryCTA';

export function ChecklistPlanner({ plan }: { plan: Plan }) {
  const [title, setTitle] = useState('');
  const [offset, setOffset] = useState('-7');
  const [error, setError] = useState<string | null>(null);
  const progress = checklistProgress(plan.tasks);
  const groups = new Map<number, Task[]>();
  for (const task of [...plan.tasks].sort((a, b) => a.offsetDays - b.offsetDays)) {
    const list = groups.get(task.offsetDays) ?? [];
    list.push(task);
    groups.set(task.offsetDays, list);
  }

  return (
    <div className="stack">
      <h2>Checklist</h2>
      <p className="hint">Las fechas se calculan desde el día del festejo, en el calendario de Argentina. Si cambiás esa fecha, se mueven las tareas relativas y se mantienen las que marcaste o las fechas que hayas puesto a mano.</p>
      <p>
        <strong>{progress.done} de {progress.total}</strong> hechas
      </p>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Tareas hechas">
        <span style={{ width: `${progress.ratio * 100}%` }} />
      </div>
      {[...groups.entries()].map(([offsetDays, tasks]) => (
        <section key={offsetDays}>
          <h3 className="group-label">{relativeTiming(offsetDays)}</h3>
          {tasks.map((task) => {
            const view = presentTask(task, plan.event.date);
            return (
              <article className="check-row" key={task.id}>
                <input
                  id={`task-${task.id}`}
                  type="checkbox"
                  checked={task.done}
                  onChange={(input) => {
                    track('checklist_used', { tool: 'checklist' });
                    updatePlan((current) => ({
                      ...current,
                      tasks: current.tasks.map((item) => item.id === task.id ? { ...item, done: input.target.checked } : item),
                    }));
                  }}
                />
                <div>
                  <label htmlFor={`task-${task.id}`}><strong>{task.title}</strong></label>
                  <p className="hint">
                    {view.status}
                    {view.dateLabel ? ` · ${view.dateLabel}` : ' · sin fecha de calendario'}
                    {view.manualDate ? ' · fecha definida por vos' : ''}
                  </p>
                  <div className="field">
                    <label htmlFor={`note-${task.id}`}>Nota</label>
                    <input
                      id={`note-${task.id}`}
                      value={task.note}
                      onChange={(input) =>
                        updatePlan((current) => ({
                          ...current,
                          tasks: current.tasks.map((item) => item.id === task.id ? { ...item, note: input.target.value.slice(0, 500) } : item),
                        }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`due-${task.id}`}>Fecha manual</label>
                    <input
                      id={`due-${task.id}`}
                      type="date"
                      value={task.dueOverride ?? ''}
                      onChange={(input) =>
                        updatePlan((current) => ({
                          ...current,
                          tasks: current.tasks.map((item) => item.id === task.id ? { ...item, dueOverride: input.target.value || null } : item),
                        }))
                      }
                    />
                  </div>
                  <div className="inline-actions">
                    {taskTitleToRubro(task.title) ? (
                      <DirectoryCTA 
                        rubro={taskTitleToRubro(task.title)!}
                        province={plan.event.province}
                        dataAction={`checklist-${task.id}`}
                      />
                    ) : null}
                    <button
                      type="button"
                      className="button-danger"
                      onClick={() => {
                        if (window.confirm('¿Querés borrar esta tarea?')) {
                          updatePlan((current) => ({ ...current, tasks: current.tasks.filter((item) => item.id !== task.id) }));
                        }
                      }}
                    >
                      Borrar tarea
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ))}

      <form
        className="stack"
        onSubmit={(formEvent) => {
          formEvent.preventDefault();
          const clean = title.trim();
          const parsed = Number(offset);
          if (!clean) {
            setError('Escribí la tarea.');
            return;
          }
          if (!Number.isInteger(parsed) || parsed < -365 || parsed > 30) {
            setError('La anticipación tiene que ser un número de días entre -365 y 30.');
            return;
          }
          setError(null);
          setTitle('');
          updatePlan((current) => ({
            ...current,
            tasks: [...current.tasks, { id: createId('task'), title: clean, note: '', offsetDays: parsed, dueOverride: null, done: false, origin: 'custom' }],
          }));
          track('checklist_used', { tool: 'checklist' });
        }}
      >
        <h3>Agregar una tarea</h3>
        <div className="field">
          <label htmlFor="new-task">Tarea</label>
          <input id="new-task" value={title} onChange={(input) => setTitle(input.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="new-offset">Días respecto del cumple</label>
          <input id="new-offset" inputMode="numeric" value={offset} onChange={(input) => setOffset(input.target.value)} />
          <p className="hint">Usá un número negativo para los días anteriores. Por ejemplo, -7 es una semana antes.</p>
        </div>
        {error ? <p className="field-error" role="alert">{error}</p> : null}
        <button type="submit" className="button button-primary">Agregar tarea</button>
      </form>
    </div>
  );
}
