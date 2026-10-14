import type { ProviderRecord } from '../../data/providers/records';
import { areaLine, categoryLabel, primaryContact, providerPath } from '../../data/providers/selectors';
import { Icon } from '../icons/Icon';
import { CategoryIcon } from './CategoryIcon';

type Props = {
  provider: ProviderRecord;
  variant?: 'default' | 'compact';
  headingLevel?: 2 | 3;
};

export function ProviderCard({ provider, variant = 'default', headingLevel = 2 }: Props) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const href = providerPath(provider);
  const contact = primaryContact(provider);
  const image = provider.images?.[0];
  const highlights = provider.highlights.slice(0, variant === 'compact' ? 2 : 3);

  return (
    <article className={`provider-card provider-card--${variant}`} data-categories={provider.categories.join(' ')}>
      <div className="provider-card__top">
        {image ? (
          <img className="provider-card__thumb" src={image.src} width={image.width} height={image.height} alt={image.alt} loading="lazy" decoding="async" />
        ) : (
          <CategoryIcon category={provider.categories[0]} size={variant === 'compact' ? 'sm' : 'md'} />
        )}
        <p className="provider-card__category">{provider.categories.map(categoryLabel).join(' · ')}</p>
      </div>
      <Heading className="provider-card__name">
        <a href={href}>{provider.name}</a>
      </Heading>
      <p className="provider-card__area">
        <Icon name="map" />
        <span>{areaLine(provider)}</span>
      </p>
      <p className="provider-card__summary">{provider.summary}</p>
      {highlights.length > 0 ? (
        <ul className="provider-card__facts" aria-label="Datos destacados">
          {highlights.map((item) => (
            <li key={item}>
              <Icon name="check" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="provider-card__actions">
        <a className="button button-primary" href={href}>
          Ver detalles<span className="visually-hidden"> de {provider.name}</span>
        </a>
        {contact ? (
          <a
            className="button button-secondary"
            href={contact.href}
            {...(contact.external ? { rel: 'noopener' } : {})}
            data-analytics="provider_contact_clicked"
            data-provider-id={provider.id}
          >
            <Icon name={contact.type === 'whatsapp' ? 'message' : 'phone'} />
            {contact.label}
            <span className="visually-hidden"> a {provider.name}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
