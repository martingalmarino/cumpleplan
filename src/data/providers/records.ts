export const providerCategories = [
  { id: 'salones', label: 'Salones' },
  { id: 'animacion', label: 'Animación' },
  { id: 'tortas-catering', label: 'Tortas y catering' },
  { id: 'decoracion', label: 'Decoración y alquileres' },
] as const;

export type ProviderCategory = (typeof providerCategories)[number]['id'];

export type ProviderSource = {
  label: string;
  url: string;
  fields: string;
};

export type IsoDate = `${number}-${number}-${number}`;

export type ProviderRecord = {
  id: string;
  slug: string;
  name: string;
  categories: ProviderCategory[];
  city: 'Córdoba';
  province: 'Córdoba';
  country: 'Argentina';
  locality: 'Córdoba Capital';
  neighborhood?: string;
  address?: string;
  postalCode?: string;
  description: string;
  summary?: string;
  services?: string[];
  coverage?: string;
  capacity?: string;
  ageRange?: string;
  openingHours?: string;
  bookingNote?: string;
  website?: string;
  socialUrl?: string;
  phoneDisplay?: string;
  phoneTel?: string;
  secondaryPhoneDisplay?: string;
  secondaryPhoneTel?: string;
  whatsappUrl?: string;
  mapUrl?: string;
  sources: ProviderSource[];
  verifiedAt: IsoDate;
  publicationStatus: 'published' | 'draft';
  featured: false;
  quoteQuestions: string[];
};

export const providers: ProviderRecord[] = [
  {
    id: 'maria-membrillo',
    slug: 'maria-membrillo',
    name: 'María Membrillo',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'Zona Norte',
    address: 'Viracocha 6078',
    description:
      'Salón de cumpleaños infantiles en Zona Norte de la ciudad de Córdoba, casi esquina Recta Martinoli. En su sitio cuentan que la propuesta se basa en el juego libre con inspiración Montessori y que también arman festejos a domicilio, con ambientación, mesas temáticas e inflables.',
    summary: 'Salón infantil en Zona Norte con juego libre de inspiración Montessori. También hace festejos a domicilio.',
    services: [
      'Cumpleaños en el salón',
      'Festejos a domicilio',
      'Ambientación y mesas temáticas',
      'Juegos inflables',
      'Baby showers y bautismos',
    ],
    coverage: 'Salón en Zona Norte; también van a domicilio',
    capacity: 'Hasta 60 personas',
    ageRange: 'De 1 a 12 años',
    openingHours:
      'Eventos de lunes a viernes desde las 16 h. Sábados, domingos y feriados, en turnos que empiezan a las 11, 14:30 o 18 h.',
    bookingNote:
      'Las visitas al salón son solo con cita previa por teléfono o WhatsApp. Los eventos duran desde 2 h 30 min y se puede sumar tiempo extra.',
    website: 'https://www.mariamembrillo.com/',
    socialUrl: 'https://www.instagram.com/mariamembrillo.eventos/',
    phoneDisplay: '(0351) 157 684331',
    phoneTel: '+5493517684331',
    whatsappUrl: 'https://wa.me/5493517684331',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Viracocha%206078%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial, página de contacto',
        url: 'https://www.mariamembrillo.com/contacto/',
        fields: 'Nombre, barrio, dirección, teléfono, WhatsApp, Instagram y visitas con cita previa',
      },
      {
        label: 'Sitio oficial, página principal',
        url: 'https://www.mariamembrillo.com/',
        fields: 'Capacidad, edades, servicios, festejos a domicilio, horarios de eventos y duración',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Qué incluye cada propuesta y qué se cobra aparte, sobre todo comida, torta y animación.',
      'Cuántos chicos y cuántos adultos entran en la propuesta que te pasan.',
      'Cómo se paga la seña y qué pasa si tenés que cambiar la fecha.',
      'Si podés llevar comida o torta de afuera.',
      'Cuánto cuesta el tiempo extra si el festejo se estira.',
    ],
  },
  {
    id: 'diverworld',
    slug: 'diverworld',
    name: 'Diverworld',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    address: 'Av. Rafael Núñez 4615',
    description:
      'Salón de fiestas infantiles en la ciudad de Córdoba, sobre Av. Rafael Núñez. Su sitio describe tres salas ambientadas según la edad, con sector para adultos, aire acondicionado y calefacción, y coordinadores que llevan adelante el cumple.',
    summary: 'Salón con tres salas según la edad, de 0 a 11 años, con coordinadores, inflables y camas elásticas.',
    services: [
      'Tres salas según la edad',
      'Coordinadores en el festejo',
      'Inflables y camas elásticas',
      'Sector para adultos',
      'Coordinador extra como adicional',
    ],
    ageRange: 'De 0 a 11 años, con una sala para 8 a 11',
    website: 'https://diverworld.com.ar/',
    phoneDisplay: '351 3326949',
    phoneTel: '+543513326949',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Rafael%20N%C3%BA%C3%B1ez%204615%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://diverworld.com.ar/',
        fields: 'Nombre, dirección, teléfono, edades, salas, servicios y coordinador extra',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Qué sala corresponde a la edad que festejás y qué queda incluido.',
      'Si la coordinación del cumple está dentro del precio y cuánto suma un coordinador extra.',
      'Hasta qué horario se puede usar el espacio y cómo se cobra una extensión.',
      'Qué pasa con la seña si cambiás la fecha.',
      'Si podés llevar la torta y la comida, o si el salón las ofrece.',
    ],
  },
  {
    id: 'tentacion-s-y-s',
    slug: 'tentacion-s-y-s',
    name: 'Tentación S&S',
    categories: ['tortas-catering'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    description:
      'Emprendimiento familiar que hace tortas temáticas, mesas dulces y saladas y catering para eventos en Córdoba Capital, con recetas venezolanas y argentinas. Trabajan por encargo y confirman los pedidos por WhatsApp.',
    summary: 'Tortas temáticas, mesas dulces y saladas y catering con recetas venezolanas y argentinas, por encargo.',
    services: [
      'Tortas personalizadas y temáticas',
      'Mesas dulces y saladas',
      'Catering para eventos',
      'Tequeños y pasapalos venezolanos',
    ],
    coverage: 'Solo Córdoba Capital, todos los barrios',
    bookingNote:
      'Trabajan por encargo: piden 72 h para tortas decoradas y de 7 a 15 días para mesas completas o catering.',
    website: 'https://tentacionsys.com.ar/',
    socialUrl: 'https://www.instagram.com/tentacion_s_y_s/',
    phoneDisplay: '+54 9 351 787-6548',
    phoneTel: '+5493517876548',
    whatsappUrl: 'https://wa.me/5493517876548',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://tentacionsys.com.ar/',
        fields: 'Nombre, servicios, cobertura en Córdoba Capital, anticipación de encargos, teléfono, WhatsApp e Instagram',
      },
      {
        label: 'Página de tortas temáticas',
        url: 'https://tentacionsys.com.ar/tortas-tematicas-cordoba/',
        fields: 'Servicio de tortas para festejos y mismos canales de contacto',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Si el precio de la torta separa el kilo de la decoración.',
      'Si tu fecha cae en un fin de semana o fecha pico que pida más anticipación.',
      'Cómo se entrega en tu barrio y si el traslado se cobra aparte.',
      'Qué datos necesitan de sabores o ingredientes, sin asumir que un aviso resuelve una alergia.',
      'Si el catering y la torta se cotizan juntos o por separado.',
    ],
  },
  {
    id: 'oxinor-globos',
    slug: 'oxinor-globos',
    name: 'Oxinor Globos',
    categories: ['decoracion'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    address: 'Diagonal Ica 1340',
    postalCode: '5000',
    description:
      'Empresa familiar que vende helio para decoraciones con globos. En su sitio ofrecen garrafas de helio para cumpleaños, cilindros y reguladores, y atención para elegir la opción según el evento y la cantidad de globos.',
    summary: 'Venta de helio en garrafas y cilindros, y reguladores, para inflar globos en cumpleaños y eventos.',
    services: ['Garrafas de helio', 'Cilindros y reguladores', 'Asesoramiento según la cantidad de globos'],
    website: 'https://www.oxinorglobos.com/',
    phoneDisplay: '(0351) 472 9562',
    phoneTel: '+543514729562',
    secondaryPhoneDisplay: '(0351) 15 607 1168',
    secondaryPhoneTel: '+5493516071168',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Diagonal%20Ica%201340%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://www.oxinorglobos.com/',
        fields: 'Nombre, dirección, código postal, teléfono fijo, móvil y servicios',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Si solo venden helio o también arman la decoración en el lugar.',
      'Qué tamaño de garrafa conviene para la cantidad de globos que imaginás.',
      'Si hay que reservar fecha y cómo se retiran cilindros o reguladores.',
      'Qué se cobra si sobra o falta helio.',
      'Si el móvil publicado atiende el mismo local.',
    ],
  },
];

export function publishedProviders(): ProviderRecord[] {
  return providers.filter((provider) => provider.publicationStatus === 'published' && provider.featured === false);
}

export function providerBySlug(slug: string): ProviderRecord | undefined {
  return publishedProviders().find((provider) => provider.slug === slug);
}

export function categoryLabel(category: ProviderCategory): string {
  return providerCategories.find((item) => item.id === category)?.label ?? category;
}

export function providersByCategory(category: ProviderCategory, list = publishedProviders()): ProviderRecord[] {
  return list
    .filter((provider) => provider.categories.includes(category))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export type ContactActionType = 'whatsapp' | 'phone' | 'website' | 'social' | 'map';

export type ContactAction = {
  type: ContactActionType;
  label: string;
  href: string;
  detail?: string;
  external: boolean;
};

export function contactActions(provider: ProviderRecord): ContactAction[] {
  const actions: ContactAction[] = [];
  if (provider.whatsappUrl) {
    actions.push({ type: 'whatsapp', label: 'WhatsApp', href: provider.whatsappUrl, external: true });
  }
  if (provider.phoneTel) {
    actions.push({ type: 'phone', label: 'Llamar', href: `tel:${provider.phoneTel}`, detail: provider.phoneDisplay, external: false });
  }
  if (provider.secondaryPhoneTel) {
    actions.push({
      type: 'phone',
      label: 'Llamar al otro número',
      href: `tel:${provider.secondaryPhoneTel}`,
      detail: provider.secondaryPhoneDisplay,
      external: false,
    });
  }
  if (provider.website) {
    actions.push({ type: 'website', label: 'Sitio oficial', href: provider.website, external: true });
  }
  if (provider.socialUrl) {
    const label = provider.socialUrl.includes('instagram.com') ? 'Instagram' : 'Perfil en redes';
    actions.push({ type: 'social', label, href: provider.socialUrl, external: true });
  }
  if (provider.mapUrl) {
    actions.push({ type: 'map', label: 'Ver en el mapa', href: provider.mapUrl, external: true });
  }
  return actions;
}

const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export function formatVerifiedDate(date: IsoDate): string {
  const [year, month, day] = date.split('-').map(Number);
  const monthName = monthNames[month - 1];
  if (!year || !monthName || !day) return date;
  return `${day} de ${monthName} de ${year}`;
}
