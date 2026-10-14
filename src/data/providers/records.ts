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
  /** Si falta, vale la fecha de revisión de la ficha. */
  reviewedAt?: IsoDate;
  /** Metadatos internos de la investigación; no se muestran. */
  type?: 'official_website' | 'official_social';
  accessMethod?: 'page_content' | 'search_index_excerpt';
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
  email?: string;
  /** Búsqueda de la dirección en Google Maps, nunca un pin con coordenadas supuestas. */
  mapUrl?: string;
  /** Sedes o propuestas de una misma marca; cada una tiene su propia ficha. */
  brandGroup?: string;
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
      'Jardín con mangrullo',
      'Sala de disfraces, boliche y sala de talleres',
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
        label: 'Sitio oficial, instalaciones',
        url: 'https://www.mariamembrillo.com/instalaciones/',
        fields: 'Ambientes del salón: jardín con mangrullo, sala de disfraces, boliche y talleres',
      },
      {
        label: 'Sitio oficial, página principal',
        url: 'https://www.mariamembrillo.com/',
        fields: 'Capacidad, edades, servicios, festejos a domicilio, horarios de eventos y duración',
        reviewedAt: '2026-10-13',
      },
    ],
    verifiedAt: '2026-10-14',
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
    whatsappUrl: 'https://wa.me/543513326949',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Rafael%20N%C3%BA%C3%B1ez%204615%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://diverworld.com.ar/',
        fields: 'Nombre, dirección, teléfono, enlace de WhatsApp, edades, salas, instalaciones y coordinador extra',
        type: 'official_website',
        accessMethod: 'page_content',
      },
    ],
    verifiedAt: '2026-10-14',
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
  {
    id: 'candy-jump',
    slug: 'candy-jump',
    name: 'Candy Jump',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    address: 'Av. Fuerza Aérea 4540',
    summary: 'Plaza blanda y camas elásticas en un salón de la marca Candy.',
    description:
      'Candy Jump es una de las propuestas de Candy en Córdoba Capital. Su página presenta una plaza de juegos blandos, camas elásticas y un salón climatizado. Consultá la modalidad de coordinación y la cantidad de invitados contemplada en el presupuesto.',
    highlights: ['Plaza de juegos blandos', 'Camas elásticas', 'Salón climatizado'],
    services: ['Plaza de juegos blandos', 'Camas elásticas', 'Salón climatizado'],
    website: 'https://candyfiestasinfantiles.com.ar/salonjump/',
    phoneDisplay: '351 6415525',
    phoneTel: '+5493516415525',
    secondaryPhoneDisplay: '351 3982931',
    secondaryPhoneTel: '+5493513982931',
    whatsappUrl: 'https://wa.me/5493516415525',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Fuerza%20A%C3%A9rea%204540%2C%20C%C3%B3rdoba%2C%20Argentina',
    brandGroup: 'candy-fiestas-infantiles',
    sources: [
      {
        label: 'Sitio oficial de Candy, página de Candy Jump',
        url: 'https://candyfiestasinfantiles.com.ar/salonjump/',
        fields: 'Nombre, dirección, contacto, descripción y instalaciones',
        type: 'official_website',
        accessMethod: 'page_content',
      },
      {
        label: 'Sitio oficial de Candy, página principal',
        url: 'https://candyfiestasinfantiles.com.ar/',
        fields: 'Nombre y dirección',
        type: 'official_website',
        accessMethod: 'page_content',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'candy-vr',
    slug: 'candy-vr',
    name: 'Candy VR',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    address: 'Av. Julio A. Roca 1595',
    summary: 'Festejos con realidad virtual, videojuegos y pista de baile.',
    description:
      'Candy VR propone cumpleaños con actividades de realidad virtual, PlayStation y pista de baile. La web indica que adapta las dinámicas a cada edad. Antes de reservar, consultá qué experiencias se habilitan para el grupo y cómo se organiza el uso de los equipos.',
    highlights: ['Realidad virtual', 'PlayStation', 'Pista de baile'],
    services: ['Realidad virtual', 'PlayStation', 'Pista de baile'],
    website: 'https://candyfiestasinfantiles.com.ar/salonvr/',
    phoneDisplay: '351 6415525',
    phoneTel: '+5493516415525',
    secondaryPhoneDisplay: '351 3982931',
    secondaryPhoneTel: '+5493513982931',
    whatsappUrl: 'https://wa.me/5493516415525',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Julio%20A.%20Roca%201595%2C%20C%C3%B3rdoba%2C%20Argentina',
    brandGroup: 'candy-fiestas-infantiles',
    sources: [
      {
        label: 'Sitio oficial de Candy, página de Candy VR',
        url: 'https://candyfiestasinfantiles.com.ar/salonvr/',
        fields: 'Nombre, dirección, contacto, descripción y instalaciones',
        type: 'official_website',
        accessMethod: 'page_content',
      },
      {
        label: 'Sitio oficial de Candy, página principal',
        url: 'https://candyfiestasinfantiles.com.ar/',
        fields: 'Nombre y dirección',
        type: 'official_website',
        accessMethod: 'page_content',
      },
      {
        label: 'Sitio oficial de Candy, página de Candy Jump',
        url: 'https://candyfiestasinfantiles.com.ar/salonjump/',
        fields: 'WhatsApp',
        type: 'official_website',
        accessMethod: 'page_content',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'habia-una-vez',
    slug: 'habia-una-vez',
    name: 'Había una Vez',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'General Bustos',
    address: 'Gino Galeotti 457',
    summary: 'Salón en General Bustos con juegos, canchita y un evento por turno.',
    description:
      'Había una Vez presenta pelotero, inflables, tejo, metegol, toro mecánico y canchita de fútbol y básquet. Su propuesta contempla un evento por turno. La web aclara que la comida y bebida quedan a cargo de quien contrata y que existen restricciones para usar cocina, parrilla y algunos juegos.',
    highlights: ['Un evento por turno', 'Pelotero e inflables', 'Canchita de fútbol y básquet'],
    services: ['Un evento por turno', 'Pelotero e inflables', 'Canchita de fútbol y básquet', 'Metegol y tejo'],
    website: 'https://www.habiauna-vez.com.ar/',
    phoneDisplay: '0351 4725234',
    phoneTel: '+543514725234',
    secondaryPhoneDisplay: '351 6652905',
    secondaryPhoneTel: '+5493516652905',
    email: 'info@habiauna-vez.com.ar',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gino%20Galeotti%20457%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://www.habiauna-vez.com.ar/',
        fields: 'Nombre, dirección, contacto, descripción y instalaciones',
        type: 'official_website',
        accessMethod: 'page_content',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
      '¿Qué restricciones de altura y uso de juegos se aplican al grupo?',
      '¿Qué alimentos y equipamiento podemos llevar?',
    ],
  },
  {
    id: 'piedra-libre',
    slug: 'piedra-libre',
    name: 'Piedra Libre',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'Alta Córdoba',
    address: 'Urquiza 1959',
    summary: 'Espacio de juegos y festejos infantiles en Alta Córdoba, cerca de Plaza Rivadavia.',
    description:
      'Piedra Libre presenta un espacio para eventos infantiles con animación y sectores organizados para recibir a chicos y adultos. Está en Urquiza 1959, a metros de Plaza Rivadavia. Para conocer los juegos, servicios y formatos disponibles, consultá directamente al salón.',
    highlights: ['Animación infantil'],
    services: ['Animación infantil'],
    website: 'https://piedralibrefiestas.wixsite.com/piedralibre',
    phoneDisplay: '351 3296670',
    phoneTel: '+5493513296670',
    secondaryPhoneDisplay: '0351 4731833',
    secondaryPhoneTel: '+543514731833',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Urquiza%201959%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Sitio oficial',
        url: 'https://piedralibrefiestas.wixsite.com/piedralibre',
        fields: 'Nombre, dirección, contacto, descripción y instalaciones',
        type: 'official_website',
        accessMethod: 'page_content',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'new-diverty',
    slug: 'new-diverty',
    name: 'New Diverty',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    address: 'Av. Rafael Núñez 6217',
    summary: 'Salón de fiestas infantiles sobre avenida Rafael Núñez, en Córdoba Capital.',
    description:
      'New Diverty publica su ubicación en avenida Rafael Núñez 6217 y un contacto de WhatsApp para presupuestos. La ficha permite consultar directamente por la fecha del cumpleaños y la propuesta vigente del salón.',
    highlights: [],
    socialUrl: 'https://www.facebook.com/newdiverty/',
    phoneDisplay: '351 6419474',
    phoneTel: '+5493516419474',
    whatsappUrl: 'https://wa.me/5493516419474',
    email: 'contacto@newdiverty.com.ar',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Rafael%20N%C3%BA%C3%B1ez%206217%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Perfil de Facebook',
        url: 'https://www.facebook.com/newdiverty/',
        fields: 'Nombre, dirección, teléfono y correo',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
      {
        label: 'Publicación en Facebook',
        url: 'https://www.facebook.com/newdiverty/photos/978780937594916/',
        fields: 'WhatsApp y ciudad',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'royal-kids-cerro-de-las-rosas',
    slug: 'royal-kids-cerro-de-las-rosas',
    name: 'Royal Kids · Cerro de las Rosas',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'Cerro de las Rosas',
    address: 'Pasaje Teodoro Burger 2322',
    summary: 'Salón de fiestas infantiles en Cerro de las Rosas, sobre Pasaje Teodoro Burger.',
    description:
      'Royal Kids publica una sede para festejos infantiles en Teodoro Burger 2322. Podés consultar sus propuestas y coordinar una visita mediante el contacto publicado por el negocio. Esta ficha corresponde a Córdoba Capital.',
    highlights: [],
    socialUrl: 'https://www.facebook.com/p/Royal-Kids-Fiestas-Infantiles-100090255973682/',
    phoneDisplay: '351 5528294',
    phoneTel: '+543515528294',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Pasaje%20Teodoro%20Burger%202322%2C%20C%C3%B3rdoba%2C%20Argentina',
    brandGroup: 'royal-kids',
    sources: [
      {
        label: 'Perfil de Facebook',
        url: 'https://www.facebook.com/p/Royal-Kids-100095212039149/',
        fields: 'Nombre, dirección y teléfono',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
      {
        label: 'Publicación en Facebook',
        url: 'https://www.facebook.com/100090255973682/posts/royal-kids-es-un-espacio-creado-con-mucho-%EF%B8%8F-paso-a-paso-cada-detalle-fue-pensado/107804475571418/',
        fields: 'Barrio, teléfono y descripción',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'cocoliche',
    slug: 'cocoliche',
    name: 'Cocoliche',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    address: 'Av. Vélez Sarsfield 5030',
    summary: 'Salón de fiestas infantiles sobre avenida Vélez Sarsfield, en Córdoba Capital.',
    description:
      'Cocoliche publica un salón para cumpleaños infantiles en avenida Vélez Sarsfield 5030. El negocio informa un canal de WhatsApp para consultas. Pedí por ese medio los detalles de la propuesta, los servicios incluidos y la disponibilidad para tu fecha.',
    highlights: [],
    socialUrl: 'https://www.facebook.com/CocolicheSalon/',
    whatsappUrl: 'https://wa.me/5493513541121',
    email: 'cocolichesalon@gmail.com',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20V%C3%A9lez%20Sarsfield%205030%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Perfil de Facebook',
        url: 'https://www.facebook.com/CocolicheSalon/',
        fields: 'Nombre, dirección y contacto',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'payana-eventos',
    slug: 'payana-eventos',
    name: 'Payana Eventos',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'Argüello',
    address: 'Av. Ricardo Rojas 7461',
    summary: 'Espacio para festejos infantiles en Argüello, con consultas de reserva por WhatsApp.',
    description:
      'Payana Eventos publica su propuesta de cumpleaños infantiles en Ricardo Rojas 7461, Argüello. Una publicación de agosto de 2026 informa el contacto para reservas. Consultá directamente los servicios y opciones disponibles para el festejo.',
    highlights: [],
    socialUrl: 'https://www.facebook.com/payanaeventos/',
    phoneDisplay: '351 6806592',
    phoneTel: '+543516806592',
    whatsappUrl: 'https://wa.me/5493516806592',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Av.%20Ricardo%20Rojas%207461%2C%20C%C3%B3rdoba%2C%20Argentina',
    sources: [
      {
        label: 'Publicación en Facebook',
        url: 'https://www.facebook.com/payanaeventos/videos/estamos-tomando-reservaswhatsapp-351-680-6592-ricardo-rojas-7461-arguello-cumple/890616854123321/',
        fields: 'Nombre, dirección, contacto y descripción',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'espacio-aventura-pueyrredon',
    slug: 'espacio-aventura-pueyrredon',
    name: 'Espacio Aventura · Pueyrredón',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'Pueyrredón',
    address: 'Padre Luis Monti 1839',
    summary: 'Sede de Espacio Aventura para fiestas infantiles en barrio Pueyrredón.',
    description:
      'Espacio Aventura informa una sede en Padre Luis Monti 1839, barrio Pueyrredón. Consultá con el negocio la propuesta correspondiente a esta dirección y las fechas disponibles.',
    highlights: [],
    socialUrl: 'https://www.facebook.com/p/Espacio-Aventura-Sal%C3%B3n-de-fiestas-infantiles-61553996811962/',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Padre%20Luis%20Monti%201839%2C%20C%C3%B3rdoba%2C%20Argentina',
    brandGroup: 'espacio-aventura',
    sources: [
      {
        label: 'Perfil de Facebook',
        url: 'https://www.facebook.com/p/Espacio-Aventura-Sal%C3%B3n-de-fiestas-infantiles-61553996811962/',
        fields: 'Nombre, dirección y descripción',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
  {
    id: 'espacio-aventura-alta-cordoba',
    slug: 'espacio-aventura-alta-cordoba',
    name: 'Espacio Aventura 2 · Alta Córdoba',
    categories: ['salones'],
    city: 'Córdoba',
    province: 'Córdoba',
    country: 'Argentina',
    locality: 'Córdoba Capital',
    neighborhood: 'Alta Córdoba',
    address: 'Calderón de la Barca 636',
    summary: 'Sede de Espacio Aventura para fiestas infantiles en barrio Alta Córdoba.',
    description:
      'Espacio Aventura informa una sede en Calderón de la Barca 636, barrio Alta Córdoba. Consultá con el negocio la propuesta correspondiente a esta dirección y las fechas disponibles.',
    highlights: [],
    socialUrl: 'https://www.facebook.com/p/Espacio-Aventura-Sal%C3%B3n-de-fiestas-infantiles-61553996811962/',
    phoneDisplay: '351 2132073',
    phoneTel: '+543512132073',
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Calder%C3%B3n%20de%20la%20Barca%20636%2C%20C%C3%B3rdoba%2C%20Argentina',
    brandGroup: 'espacio-aventura',
    sources: [
      {
        label: 'Perfil de Facebook',
        url: 'https://www.facebook.com/p/Espacio-Aventura-Sal%C3%B3n-de-fiestas-infantiles-61553996811962/',
        fields: 'Nombre, dirección y descripción',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
      {
        label: 'Publicación en Facebook',
        url: 'https://www.facebook.com/61553996811962/videos/espacio-aventura-2-ya-est%C3%A1-en-marcha-en-alta-c%C3%B3rdoba-con-m%C3%A1s-juegos-m%C3%A1s-espacio-/851341081330252/',
        fields: 'Teléfono, dirección y nombre',
        type: 'official_social',
        accessMethod: 'search_index_excerpt',
      },
    ],
    verifiedAt: '2026-10-14',
    publicationStatus: 'published',
    featured: false,
    quoteQuestions: [
      '¿Hay disponibilidad para la fecha del festejo?',
      '¿Qué incluye el presupuesto y qué se cobra aparte?',
      '¿Cuántos chicos y adultos admite la propuesta?',
      '¿Cuáles son las condiciones de reserva y reprogramación?',
    ],
  },
];

export function publishedProviders(): ProviderRecord[] {
  return providers.filter((provider) => provider.publicationStatus === 'published' && provider.featured === false);
}

export function providerBySlug(slug: string): ProviderRecord | undefined {
  return publishedProviders().find((provider) => provider.slug === slug);
}
