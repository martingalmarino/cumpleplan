import { site } from '../config/site';

export const analyticsEvents = [
  'calculator_completed',
  'budget_updated',
  'checklist_used',
  'shopping_list_generated',
  'print_clicked',
  'provider_contact_clicked',
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];

export type AnalyticsProps = {
  tool?: string;
  providerId?: string;
};

export function sanitizeAnalytics(props: Record<string, unknown> | undefined): AnalyticsProps {
  const safe: AnalyticsProps = {};
  if (!props) return safe;
  if (typeof props.tool === 'string' && props.tool.length > 0) safe.tool = props.tool.slice(0, 40);
  if (typeof props.providerId === 'string' && /^[a-z0-9-]{1,80}$/.test(props.providerId)) {
    safe.providerId = props.providerId;
  }
  return safe;
}

export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (!site.analyticsEnabled || typeof window === 'undefined') return;
  const safe = sanitizeAnalytics(props);
  const payload = { event, ...safe };
  window.dispatchEvent(new CustomEvent('cumple-en-orden:analytics', { detail: payload }));
}
