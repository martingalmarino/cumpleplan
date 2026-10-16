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
  | 'mail'
  | 'clock'
  | 'cake'
  | 'balloon'
  | 'sparkle';

const paths: Record<IconName, string> = {
  menu: 'M3 7h18M3 12h18M3 17h18',
  utensils: 'M6 3v7c0 1.1.9 2 2 2M8 12v9M6 3c0 3 0 6 0 7M16 3v18M16 3c-.8 1.5-1.2 3.5-1.2 5.5 0 1.1.5 2 1.2 2.5',
  wallet: 'M3 7h18v13H3zM3 10h18M7 7L8 4h8l1 3M17 13h2',
  check: 'M5 13l4 4L19 7',
  bag: 'M6 8l-.5 11c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2L18 8M9 8V6c0-1.7 1.3-3 3-3s3 1.3 3 3v2M3 8h18',
  calendar: 'M4 5h16v16H4zM4 10h16M8 3v4M16 3v4',
  users: 'M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 2.7-5 6-5s6 2 6 5M16.5 11c1.4 0 2.5-1.1 2.5-2.5S17.9 6 16.5 6M18 16c2.2 0 4 1.5 4 3.5',
  printer: 'M7 8V3h10v5M6 15H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 12h10v9H7z',
  download: 'M12 3v13M8 12l4 4 4-4M4 20h16',
  upload: 'M12 18V5M8 9l4-4 4 4M4 20h16',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M9 6V4h6v2M8 6v13c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6',
  info: 'M12 11v6M12 8h.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  alert: 'M12 3L3 20h18L12 3zM12 9v5M12 16.5h.01',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  map: 'M12 3c-3.3 0-6 2.7-6 6 0 5.2 6 12 6 12s6-6.8 6-12c0-3.3-2.7-6-6-6zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  copy: 'M8 8h13v13H8zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  home: 'M3 10l9-7 9 7v11H3zM9 21v-7h6v7',
  phone: 'M6 4h3l1.5 4.5-2.3 1.5c.8 1.5 1.8 2.8 3.3 3.5L13 11l4 1.5v3.5c0 1.1-.9 2-2 2-7.7 0-14-6.3-14-14C1 2.9 1.9 2 3 2h3z',
  message: 'M21 12a9 9 0 0 1-9 9c-1.5 0-2.9-.4-4.1-1L3 21l1.1-4.9A9 9 0 1 1 21 12zM9 11h6M9 14h4',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.2 2.2 3.2 5.2 3.2 9s-1 6.8-3.2 9c-2.2-2.2-3.2-5.2-3.2-9s1-6.8 3.2-9z',
  camera: 'M2 6h20v14H2zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM7 6l1-2h8l1 2',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 6v6l3.5 2',
  cake: 'M4 13h16v8H4zM4 13c1.5 1.5 3 1.5 5 0s3.5-1.5 5 0 3.5 1.5 5 0M12 13V9M12 6.5c.6-.6.9-1.2.9-1.8 0-.8-.6-1.2-.9-1.2s-.9.4-.9 1.2c0 .6.3 1.2.9 1.8zM4 17h16',
  balloon: 'M12 3c-2.8 0-5 2.5-5 5.5S9 14 12 14s5-2.5 5-5.5S14.8 3 12 3zM12 14l-.8 1.5c-.3.5-.3 1 0 1.5l.3.5c.2.4.5.6.9.6.4 0 .7-.2.9-.6l.3-.5c.3-.5.3-1 0-1.5L12 14zM12 18v3M10 21h4',
  sparkle: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5zM18 16l1 2.5 2.5 1-2.5 1L18 23l-1-2.5-2.5-1 2.5-1L18 16z',
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  const strokeWidth = name === 'check' ? '2.5' : '2';
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name]} />
    </svg>
  );
}
