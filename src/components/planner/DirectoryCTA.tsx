import type { ProviderCategory } from '../../data/providers/records';
import { getDirectoryUrl, getDirectoryCTA } from '../../lib/directory';

type Props = {
  rubro: ProviderCategory;
  province?: string;
  variant?: 'primary' | 'secondary';
  dataAction?: string;
};

export function DirectoryCTA({ rubro, province, variant = 'secondary', dataAction }: Props) {
  const url = getDirectoryUrl(rubro, province);
  const text = getDirectoryCTA(rubro);
  const className = variant === 'primary' ? 'button button-primary' : 'button-quiet';
  
  return (
    <a 
      href={url} 
      className={className}
      data-directory-cta={rubro}
      data-action={dataAction}
    >
      {text}
    </a>
  );
}
