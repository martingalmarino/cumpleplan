import { useState } from 'react';
import { track } from '../../lib/analytics';
import { getShareableUrl } from '../../lib/sharing';
import type { Plan } from '../../lib/planner/types';

type Props = {
  plan: Plan;
};

export function SharePlan({ plan }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function copyShareLink() {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    const shareUrl = getShareableUrl(plan, baseUrl);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setCopyError(false);
      track('plan_shared', { method: 'link' });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopyError(true);
      setTimeout(() => setCopyError(false), 3000);
    }
  }

  return (
    <div className="stack">
      <h3>Compartir plan completo</h3>
      <p className="hint">
        El link incluye todo tu plan comprimido. Podés abrirlo en otro dispositivo o compartirlo. 
        No se guarda en ningún servidor.
      </p>
      <div className="inline-actions">
        <button 
          type="button" 
          className="button button-secondary" 
          onClick={() => void copyShareLink()}
          data-share-action="copy-plan-link"
        >
          {copied ? '✓ Link copiado' : 'Copiar link del plan'}
        </button>
      </div>
      {copyError ? (
        <p className="field-error">No se pudo copiar. Intentá desde otro navegador.</p>
      ) : null}
    </div>
  );
}
