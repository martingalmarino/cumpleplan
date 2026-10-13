import { contactActions, type ContactAction, type ProviderRecord } from '../../data/providers/records';
import { Icon, type IconName } from '../icons/Icon';

const icons: Record<ContactAction['type'], IconName> = {
  whatsapp: 'message',
  phone: 'phone',
  website: 'globe',
  social: 'camera',
  map: 'map',
};

export function ContactLink({ action, providerId, primary = false }: { action: ContactAction; providerId: string; primary?: boolean }) {
  const tracked = action.type !== 'map';
  return (
    <a
      className={`contact-action ${primary ? 'button button-primary' : 'button button-secondary'}`}
      href={action.href}
      {...(action.external ? { rel: 'noopener' } : {})}
      {...(tracked ? { 'data-analytics': 'provider_contact_clicked', 'data-provider-id': providerId } : {})}
    >
      <Icon name={icons[action.type]} />
      <span>
        {action.label}
        {action.detail ? <span className="contact-action__detail">{action.detail}</span> : null}
      </span>
    </a>
  );
}

export function ContactActions({ provider }: { provider: ProviderRecord }) {
  const actions = contactActions(provider);
  if (actions.length === 0) return null;
  return (
    <ul className="contact-actions" aria-label={`Contacto publicado por ${provider.name}`}>
      {actions.map((action, index) => (
        <li key={action.href}>
          <ContactLink action={action} providerId={provider.id} primary={index === 0} />
        </li>
      ))}
    </ul>
  );
}
