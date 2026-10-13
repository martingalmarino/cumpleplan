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
  | 'home'
  | 'phone'
  | 'message'
  | 'globe'
  | 'camera'
  | 'clock'
  | 'cake'
  | 'balloon'
  | 'sparkle';

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
  phone: 'M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 6a2 2 0 0 1 2-2z',
  message: 'M4 20l1.3-3.9A8 8 0 1 1 8 18.7L4 20zM9 10.5h6M9 13.5h4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z',
  camera: 'M8 4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM16.8 7.2h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  cake: 'M4 20h16M5 20v-7h14v7M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0M12 13V9M12 6.5c.8-.8 1-1.5 1-2a1 1 0 0 0-2 0c0 .5.2 1.2 1 2z',
  balloon: 'M12 15c3 0 5-2.7 5-5.5S14.8 4 12 4 7 6.2 7 9.5 9 15 12 15zM12 15l-1 1.5h2L12 15zM12 16.5c0 2-2 2.5-1 4.5',
  sparkle: 'M12 4l1.8 4.6L18.5 10l-4.7 1.6L12 16l-1.8-4.4L5.5 10l4.7-1.4L12 4zM18 16l.7 1.8 1.8.7-1.8.7L18 21l-.7-1.8-1.8-.7 1.8-.7L18 16z',
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name]} />
    </svg>
  );
}
