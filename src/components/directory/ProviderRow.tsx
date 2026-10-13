import { categoryLabel, contactActions, formatVerifiedDate, type ProviderRecord } from '../../data/providers/records';
import { Icon } from '../icons/Icon';
import { CategoryIcon } from './CategoryIcon';
import { ContactLink } from './ContactActions';

export function providerPath(provider: ProviderRecord): string {
  return `/cumpleanos-infantiles-cordoba/proveedores/${provider.slug}/`;
}

export function ProviderRow({ provider, headingLevel = 2 }: { provider: ProviderRecord; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const actions = contactActions(provider);
  const primary = actions.find((action) => action.type === 'whatsapp') ?? actions.find((action) => action.type === 'phone');
  const website = actions.find((action) => action.type === 'website');
  const place = provider.address
    ? `${provider.address}${provider.neighborhood ? `, ${provider.neighborhood}` : ''}`
    : provider.coverage ?? provider.locality;
  const href = providerPath(provider);

  return (
    <article className="provider-row">
      <div className="provider-row__id">
        <CategoryIcon category={provider.categories[0]} />
        <div>
          <p className="provider-row__category">{provider.categories.map(categoryLabel).join(' · ')}</p>
          <Heading className="provider-row__name">
            <a href={href}>{provider.name}</a>
          </Heading>
          <p className="provider-row__area">{provider.neighborhood ?? provider.locality}</p>
        </div>
      </div>
      <div className="provider-row__body">
        <p className="provider-row__summary">{provider.summary ?? provider.description}</p>
        <p className="provider-row__place">
          <Icon name="map" />
          <span>{place}</span>
        </p>
        {provider.services && provider.services.length > 0 ? (
          <ul className="tag-list" aria-label="Servicios publicados">
            {provider.services.slice(0, 3).map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="provider-row__actions">
        {primary ? <ContactLink action={primary} providerId={provider.id} primary /> : null}
        {website ? (
          <a className="provider-row__link" href={website.href} rel="noopener" data-analytics="provider_contact_clicked" data-provider-id={provider.id}>
            Sitio oficial
          </a>
        ) : null}
        <a className="provider-row__link" href={href}>
          Ver ficha <span className="visually-hidden">de {provider.name}</span>
          <Icon name="arrow" />
        </a>
      </div>
      <p className="provider-row__footer">Datos tomados de su sitio oficial y revisados el {formatVerifiedDate(provider.verifiedAt)}.</p>
    </article>
  );
}
