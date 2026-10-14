export const providerCategories = [
  {
    id: 'salones',
    label: 'Salones',
    singular: 'Salón infantil',
    servicesTitle: 'Instalaciones y servicios',
    relatedTitle: 'Otros salones en Córdoba',
  },
  {
    id: 'animacion',
    label: 'Animación',
    singular: 'Animación',
    servicesTitle: 'Qué ofrece',
    relatedTitle: 'Otras opciones de animación',
  },
  {
    id: 'tortas-catering',
    label: 'Tortas y catering',
    singular: 'Tortas y catering',
    servicesTitle: 'Qué ofrece',
    relatedTitle: 'Otras opciones de tortas y catering',
  },
  {
    id: 'decoracion',
    label: 'Decoración y alquileres',
    singular: 'Decoración y alquileres',
    servicesTitle: 'Productos y servicios',
    relatedTitle: 'Otras opciones de decoración',
  },
] as const;

export type ProviderCategory = (typeof providerCategories)[number]['id'];

export type ProviderSource = {
  label: string;
  url: string;
  fields: string;
};

export type ProviderImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
  credit: string;
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
  /** Una línea para la tarjeta y el encabezado de la ficha. */
  summary: string;
  /** Texto de "Sobre…": no repite el resumen ni la lista de servicios. */
  description: string;
  /** Hasta tres datos cortos para la tarjeta del directorio. */
  highlights: string[];
  services?: string[];
  /** Servicios que el proveedor publica como adicionales, aparte de su propuesta. */
  addOns?: string[];
  coverage?: string;
  capacity?: string;
  ageRange?: string;
  spaces?: string;
  duration?: string;
  openingHours?: string;
  leadTime?: string;
  delivery?: string;
  bookingNote?: string;
  /** Solo fotos reales del proveedor con permiso de uso. */
  images?: ProviderImage[];
  website?: string;
  socialUrl?: string;
  phoneDisplay?: string;
  phoneTel?: string;
  secondaryPhoneDisplay?: string;
  secondaryPhoneTel?: string;
  /** Solo si el proveedor publica WhatsApp; un teléfono no alcanza como prueba. */
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
    address: 'Viracocha 6078, casi esquina Recta Martinoli',
    summary: 'Salón de juego libre con inspiración Montessori, en Zona Norte. También arma festejos a domicilio.',
    description:
      'Ofrece un espacio pensado para que los chicos jueguen, exploren e imaginen, con instalaciones para chicos y para adultos. Tiene varias propuestas de cumpleaños en el salón y también lleva ambientación, mesas temáticas e inflables a domicilio.',
    highlights: ['Hasta 60 personas', 'De 1 a 12 años', 'Visitas con cita previa'],
    services: [
      'Cumpleaños en el salón, con varias propuestas',
      'Celebraciones de 1 y 2 años, baby showers y bautismos',
      'Ambientación y mesas temáticas a domicilio',
      'Juegos inflables para eventos',
    ],
    coverage: 'También arman festejos a domicilio.',
    capacity: 'Hasta 60 personas',
    ageRange: 'De 1 a 12 años',
    duration: 'Desde 2 h 30 min, con tiempo extra opcional',
    openingHours:
      'Lunes a viernes desde las 16 h. Sábados, domingos y feriados, en turnos que empiezan a las 11, 14:30 o 18 h.',
    bookingNote: 'Solo con cita previa, por teléfono o WhatsApp',
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
      'Si piden seña, cuánto es y qué pasa si tenés que cambiar la fecha.',
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
    summary: 'Tres salas según la edad, con coordinadores, inflables y camas elásticas.',
    description:
      'Salón de fiestas infantiles en la ciudad de Córdoba. Cada sala está ambientada por separado, con luz natural, aire acondicionado y calefacción, y el cumple lo llevan adelante los coordinadores del salón.',
    highlights: ['De 0 a 11 años', 'Sector para adultos', 'Aire acondicionado y calefacción'],
    services: [
      'Sector de juegos con inflables y camas elásticas',
      'Decoración del sector de chicos según la temática, en la Sala 2',
      'Sector para adultos',
      'Coordinadores durante el festejo',
    ],
    addOns: ['Coordinador extra'],
    ageRange: 'De 0 a 11 años, con una sala para 8 a 11',
    spaces: 'Tres salas según la edad',
    website: 'https://diverworld.com.ar/',
    phoneDisplay: '351 3326949',
    phoneTel: '+543513326949',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Rafael%20N%C3%BA%C3%B1ez%204615%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://diverworld.com.ar/',
        fields: 'Nombre, dirección, teléfono, edades, salas, instalaciones y coordinador extra',
      },
    ],
    verifiedAt: '2026-10-13',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      'Qué sala corresponde a la edad que festejás y qué queda incluido.',
      'Si la coordinación está dentro del precio y cuánto suma un coordinador extra.',
      'Hasta qué horario se puede usar el espacio y cómo se cobra una extensión.',
      'Si piden seña, cuánto es y qué pasa si cambiás la fecha.',
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
    summary: 'Tortas temáticas, mesas dulces y saladas y catering con recetas venezolanas y argentinas.',
    description:
      'Emprendimiento familiar que trabaja por encargo: arma cada pedido según la fecha, la cantidad de invitados y si hace falta algo dulce, salado o las dos cosas. Confirman los pedidos por WhatsApp.',
    highlights: ['Por encargo', 'Tortas con 72 h de anticipación', 'Envío con armado de mesas'],
    services: [
      'Tortas personalizadas y temáticas',
      'Mesas dulces y saladas',
      'Catering para eventos',
      'Tequeños, pasapalos y postres venezolanos',
    ],
    coverage: 'Solo Córdoba Capital, en todos los barrios. Fuera de la ciudad no hacen entregas.',
    leadTime: '72 h para tortas decoradas; de 7 a 15 días para mesas completas y catering',
    delivery: 'Retiro coordinado, envío propio con armado de mesas o cadetería para productos sueltos',
    website: 'https://tentacionsys.com.ar/',
    socialUrl: 'https://www.instagram.com/tentacion_s_y_s/',
    phoneDisplay: '+54 9 351 787-6548',
    phoneTel: '+5493517876548',
    whatsappUrl: 'https://wa.me/5493517876548',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://tentacionsys.com.ar/',
        fields: 'Nombre, servicios, cobertura en Córdoba Capital, anticipación, formas de entrega, teléfono, WhatsApp e Instagram',
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
      'Cuánto cuesta el envío a tu barrio y si incluye el armado.',
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
    summary: 'Venta de helio en garrafas y cilindros para inflar globos en cumpleaños y eventos.',
    description:
      'Empresa familiar dedicada a la venta de helio para decoraciones con globos. Atienden de forma personalizada para ayudarte a elegir la opción según el evento, la cantidad y el tipo de globos.',
    highlights: ['Garrafas de helio', 'Cilindros y reguladores', 'Atención personalizada'],
    services: [
      'Garrafas de helio para cumpleaños y eventos',
      'Cilindros de helio',
      'Reguladores',
      'Asesoramiento según la cantidad y el tipo de globos',
    ],
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
