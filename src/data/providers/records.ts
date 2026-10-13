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
  website?: string;
  socialUrl?: string;
  phoneDisplay?: string;
  phoneTel?: string;
  secondaryPhoneDisplay?: string;
  secondaryPhoneTel?: string;
  whatsappUrl?: string;
  mapUrl?: string;
  sources: ProviderSource[];
  verifiedAt: '2026-10-13';
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
      'Salón de cumpleaños infantiles en Zona Norte de la ciudad de Córdoba. En su sitio publican la dirección de Viracocha 6078, teléfono y WhatsApp. También informan que arman festejos en domicilio dentro de Córdoba y alrededores.',
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
        fields: 'Nombre, ciudad, barrio, dirección, teléfono, WhatsApp e Instagram',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Qué incluye el precio y qué se cobra aparte, sobre todo comida, torta y animación.',
      'Cuántos chicos y cuántos adultos entran en la propuesta que te pasan.',
      'Cómo se paga la seña y hasta cuándo se puede cambiar la fecha.',
      'Si podés llevar comida o torta de afuera.',
      'Si la visita al salón es con cita, como informan en su sitio.',
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
      'Salón de fiestas infantiles en la ciudad de Córdoba. Su sitio describe tres salas para cumpleaños de niños y publica la dirección Av. Rafael Núñez 4615 junto con un teléfono de contacto.',
    website: 'https://diverworld.com.ar/',
    phoneDisplay: '351 3326949',
    phoneTel: '+543513326949',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Rafael%20N%C3%BA%C3%B1ez%204615%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://diverworld.com.ar/',
        fields: 'Nombre, ciudad, dirección y teléfono',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Qué sala corresponde a la edad que festejás y qué queda incluido.',
      'Si la coordinación del cumple está dentro del precio o se suma aparte.',
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
      'Hacen tortas temáticas y catering para eventos en Córdoba Capital. En su sitio publican WhatsApp, teléfono e Instagram para encargos, y aclaran que trabajan en la ciudad.',
    website: 'https://tentacionsys.com.ar/',
    socialUrl: 'https://www.instagram.com/tentacion_s_y_s/',
    phoneDisplay: '+54 9 351 787-6548',
    phoneTel: '+5493517876548',
    whatsappUrl: 'https://wa.me/5493517876548',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://tentacionsys.com.ar/',
        fields: 'Nombre, cobertura en Córdoba Capital, teléfono, WhatsApp e Instagram',
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
      'Con cuánta anticipación hay que encargar la tuya.',
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
      'Venden helio y globos para cumpleaños y eventos. En su sitio publican el local de Diagonal Ica 1340, Córdoba, código postal 5000, un teléfono fijo y un móvil.',
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
        fields: 'Nombre, dirección, código postal, teléfono fijo y móvil',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Si solo venden helio y globos o también arman la decoración en el lugar.',
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
