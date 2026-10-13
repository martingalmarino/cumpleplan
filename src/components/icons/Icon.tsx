import type { SVGProps } from 'react';

export type IconName =
  | 'menu'
  | 'utensils'
  | 'wallet'
  | 'check'
  | 'bag'
  | 'calendar'
  | 'users'
  | 'printer'
  | 'download'
  | 'upload'
  | 'plus'
  | 'trash'
  | 'info'
  | 'alert'
  | 'arrow'
  | 'map'
  | 'copy'
  | 'home';

const paths: Record<IconName, string> = {
  menu: 'M4 7h16M4 12h16M4 17h16',
  utensils: 'M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 3c-1.5 3-1.5 6 0 8v10M16 3c1.5 3 1.5 6 0 8',
  wallet: 'M4 8h16v10H4zM4 8l2-3h10l2 3M16 13h2',
  check: 'M5 12.5 9.2 17 19 7',
  bag: 'M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 0 1 6 0v2',
  calendar: 'M5 6h14v13H5zM5 10h14M8 4v4M16 4v4',
  users: 'M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 19c.5-2.5 2.4-4 5-4s4.5 1.5 5 4M16 11a2.5 2.5 0 1 0 0-5M17 15c1.8.2 3.2 1.3 3.7 4',
  printer: 'M7 8V3h10v5M6 16H4V8h16v8h-2M7 13h10v8H7z',
  download: 'M12 4v10M8 10l4 4 4-4M5 19h14',
  upload: 'M12 16V6M8 10l4-4 4 4M5 19h14',
  plus: 'M12 5v14M5 12h14',
  trash: 'M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13',
  info: 'M12 11v6M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  alert: 'M12 4 3 19h18L12 4zM12 10v4M12 16.5h.01',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  map: 'M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10zM12 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  copy: 'M8 8h10v12H8zM6 16H5V4h10v1',
  home: 'M4 11.5 12 5l8 6.5V20H4zM10 20v-6h4v6',
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name]} />
    </svg>
  );
}
