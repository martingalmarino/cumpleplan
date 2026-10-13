import type { ProviderCategory } from '../../data/providers/records';
import { Icon, type IconName } from '../icons/Icon';

const icons: Record<ProviderCategory, IconName> = {
  salones: 'home',
  animacion: 'sparkle',
  'tortas-catering': 'cake',
  decoracion: 'balloon',
};

export function CategoryIcon({ category, size = 'md' }: { category: ProviderCategory; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span className={`category-icon category-icon--${category} category-icon--${size}`} aria-hidden="true">
      <Icon name={icons[category]} />
    </span>
  );
}
