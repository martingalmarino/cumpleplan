import { discardDamagedStorage, acceptConflict, keepLocalPlan, type PlannerSnapshot } from '../../lib/planner/store';

export function Notices({ snapshot }: { snapshot: PlannerSnapshot }) {
  return (
    <>
      <p className="hint">
        Exportá tu plan para abrirlo en otro dispositivo. Si borrás los datos del navegador, se pierde.
      </p>
      {snapshot.saveState === 'saved' && snapshot.saveMessage ? (
        <p className="save-status" role="status">{snapshot.saveMessage}</p>
      ) : null}
      {snapshot.saveState === 'pending' ? <p className="save-status" role="status">Guardando…</p> : null}
      {snapshot.saveState === 'unavailable' && snapshot.saveMessage ? (
        <div className="banner warning" role="status">
          <strong>No se pudo guardar.</strong>
          <p>{snapshot.saveMessage}</p>
        </div>
      ) : null}
      {snapshot.loadIssue?.kind === 'corrupt' || snapshot.loadIssue?.kind === 'invalid' ? (
        <div className="banner error" role="alert">
          <strong>No pudimos leer el plan guardado.</strong>
          <p>{snapshot.loadIssue.message} El dato dañado sigue en el navegador hasta que decidas reemplazarlo. Lo que ves ahora no se está guardando encima.</p>
          <div className="inline-actions">
            <button type="button" className="button-danger" onClick={discardDamagedStorage}>
              Descartar el dato dañado y empezar de nuevo
            </button>
          </div>
        </div>
      ) : null}
      {snapshot.loadIssue?.kind === 'future' ? (
        <div className="banner warning" role="alert">
          <strong>Este navegador tiene un plan de una versión más nueva.</strong>
          <p>{snapshot.loadIssue.message} No lo pisamos con esta versión.</p>
        </div>
      ) : null}
      {snapshot.loadIssue?.kind === 'unavailable' ? (
        <div className="banner warning" role="status">
          <strong>El guardado de este navegador no está disponible.</strong>
          <p>{snapshot.loadIssue.message}</p>
        </div>
      ) : null}
      {snapshot.conflict ? (
        <div className="banner warning" role="alert">
          <strong>El plan cambió en otra pestaña.</strong>
          <p>
            Esa versión se llama “{snapshot.conflict.event.label}” y tiene {snapshot.conflict.event.childrenCount} chicos y {snapshot.conflict.event.adultsCount} adultos. Elegí cuál conservar. No mezclamos las dos en silencio.
          </p>
          <div className="inline-actions">
            <button type="button" className="button button-primary" onClick={acceptConflict}>Traer la otra pestaña</button>
            <button type="button" className="button-quiet" onClick={keepLocalPlan}>Mantener esta pestaña</button>
          </div>
        </div>
      ) : null}
      {snapshot.externalClear ? (
        <div className="banner warning" role="alert">
          <strong>Otra pestaña borró el plan guardado.</strong>
          <p>Esta pestaña todavía lo tiene en memoria.</p>
          <div className="inline-actions">
            <button type="button" className="button button-primary" onClick={keepLocalPlan}>Volver a guardarlo</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
