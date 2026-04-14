export type Priority = "Alta" | "Media" | "Baja";
export type TaskStatus = "Pendiente" | "Completada";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  subtitle: string;
  accent: string;
  logo: string;
  colors: string[];
  large?: boolean;
}

export interface StrategicAction {
  id: string;
  text: string;
  time?: string;
  campaignId: string;
}

export interface CampaignMatrix {
  id: string;
  name: string;
  isBase: boolean;
  color?: string;
  badgeBg?: string;
  // Entries now map to an array of StrategicActions
  data: { day: string; entries: Record<string, StrategicAction[]> }[];
}

export const projectCampaigns: Record<string, CampaignMatrix[]> = {
  "1": [
    {
      id: "base_1",
      name: "Estrategia Base (Always-On)",
      isBase: true,
      data: [
        { day: 'Lunes',     entries: { prod: [{id: '1', text: 'GIRA DE CAMPO: Obras Sur', campaignId: 'base_1', time: '09:00'}], tiktok: [{id: '2', text: 'Avances de Obra', campaignId: 'base_1'}], ig: [],  fb: [{id: '3', text: 'Promo Vivienda', campaignId: 'base_1'}] } },
        { day: 'Martes',    entries: { prod: [{id: '4', text: 'Tomas con dron', campaignId: 'base_1', time: '11:00'}], tiktok: [], ig: [{id: '5', text: 'Render vs Realidad', campaignId: 'base_1'}], fb: [] } },
        { day: 'Miércoles', entries: { prod: [{id: '6', text: 'Entrevistas a Ingenieros', campaignId: 'base_1'}], tiktok: [{id: '7', text: 'Tip Constructivo', campaignId: 'base_1'}], ig: [{id: '8', text: 'Historias de Materiales', campaignId: 'base_1'}], fb: [] } },
        { day: 'Jueves',    entries: { prod: [{id: '9', text: 'Revisión de planos', campaignId: 'base_1'}], tiktok: [], ig: [], fb: [{id: '10', text: 'Brochure Digital', campaignId: 'base_1'}] } },
        { day: 'Viernes',   entries: { prod: [{id: '11', text: 'Monitoreo de seguridad', campaignId: 'base_1'}], tiktok: [{id: '12', text: 'Trend de Cascos', campaignId: 'base_1'}], ig: [{id: '13', text: 'Casa Terminada', campaignId: 'base_1'}], fb: [{id: '14', text: 'Invitación a Piloto', campaignId: 'base_1'}] } },
        { day: 'Sábado',    entries: { prod: [], tiktok: [], ig: [], fb: [] } },
        { day: 'Domingo',   entries: { prod: [], tiktok: [], ig: [], fb: [] } },
      ],
    },
  ],
  "2": [
    {
      id: "base_2",
      name: "Cartelera Fija",
      isBase: true,
      data: [
        { day: 'Lunes',     entries: { prod: [{id: '15', text: 'Grabación B-Roll Tragos', campaignId: 'base_2', time: '17:00'}], tiktok: [{id: '16', text: 'Detrás de la barra', campaignId: 'base_2'}], ig: [{id: '17', text: 'Receta de Cóctel', campaignId: 'base_2'}], fb: [{id: '18', text: 'Promo inicio de semana', campaignId: 'base_2'}] } },
        { day: 'Martes',    entries: { prod: [], tiktok: [], ig: [], fb: [{id: '19', text: 'Martes de 2x1', campaignId: 'base_2'}] } },
        { day: 'Miércoles', entries: { prod: [{id: '20', text: 'GRABACIÓN: Humor y Gastronomía', campaignId: 'base_2'}], tiktok: [{id: '21', text: 'Trend humor staff', campaignId: 'base_2'}], ig: [{id: '22', text: 'Video platos estrella', campaignId: 'base_2'}], fb: [] } },
        { day: 'Jueves',    entries: { prod: [{id: '23', text: 'Fotos cartelera DJ', campaignId: 'base_2'}], tiktok: [], ig: [{id: '24', text: 'Historias DJ Set', campaignId: 'base_2'}], fb: [{id: '25', text: 'Promo "After Office"', campaignId: 'base_2'}] } },
        { day: 'Viernes',   entries: { prod: [{id: '26', text: 'Monitoreo asistencia', campaignId: 'base_2'}], tiktok: [{id: '27', text: '"POV: Es viernes"', campaignId: 'base_2'}], ig: [{id: '28', text: 'Reel: Vibe fin', campaignId: 'base_2'}], fb: [{id: '29', text: 'Reserva tu mesa', campaignId: 'base_2'}] } },
        { day: 'Sábado',    entries: { prod: [{id: '30', text: 'Captura ambiente vivo', campaignId: 'base_2'}], tiktok: [], ig: [{id: '31', text: 'Resumen noche anterior', campaignId: 'base_2'}], fb: [] } },
        { day: 'Domingo',   entries: { prod: [{id: '32', text: 'Planificación', campaignId: 'base_2'}], tiktok: [], ig: [{id: '33', text: 'Brunch Relax', campaignId: 'base_2'}], fb: [{id: '34', text: 'Horarios Domingo', campaignId: 'base_2'}] } },
      ],
    },
    {
      id: "hw_2",
      name: "👻 Sunset Spooky Week",
      isBase: false,
      color: "text-orange-600",
      badgeBg: "bg-orange-100",
      data: [
        { day: 'Lunes',     entries: { prod: [], tiktok: [], ig: [], fb: [] } },
        { day: 'Martes',    entries: { prod: [{id: '35', text: 'Fotos Decoración', campaignId: 'hw_2'}], tiktok: [{id: '36', text: 'Promo Disfraces', campaignId: 'hw_2'}], ig: [{id: '37', text: 'Fotos Cócteles Negros', campaignId: 'hw_2'}], fb: [{id: '38', text: 'Concurso Disfraces', campaignId: 'hw_2'}] } },
        { day: 'Miércoles', entries: { prod: [], tiktok: [], ig: [], fb: [] } },
        { day: 'Jueves',    entries: { prod: [], tiktok: [], ig: [], fb: [] } },
        { day: 'Viernes',   entries: { prod: [{id: '39', text: 'Noche de Brujas', campaignId: 'hw_2', time: '20:00'}], tiktok: [{id: '40', text: 'Trend susto mesero', campaignId: 'hw_2'}], ig: [{id: '41', text: 'Flyer Pre-Fiesta', campaignId: 'hw_2'}], fb: [{id: '42', text: 'Reserva VIP', campaignId: 'hw_2'}] } },
        { day: 'Sábado',    entries: { prod: [{id: '43', text: 'Cobertura Fiesta', campaignId: 'hw_2'}], tiktok: [], ig: [{id: '44', text: 'Resumen Disfraces', campaignId: 'hw_2'}], fb: [] } },
        { day: 'Domingo',   entries: { prod: [], tiktok: [], ig: [], fb: [] } },
      ],
    },
  ],
};

export const projectsData: Project[] = [
  {
    id: "1",
    name: "EcoConstruct",
    category: "Construcción",
    subtitle: "Infraestructura Urbana Sostenible",
    accent: "bg-[#2ECC71]",
    logo: "https://ui-avatars.com/api/?name=EC&background=2ECC71&color=fff",
    colors: ["bg-[#0A3D2E]", "bg-[#2ECC71]", "bg-[#F1F8E9]", "bg-[#191C1E]"],
  },
  {
    id: "2",
    name: "Sunset Lounge Bar",
    category: "Gastronomía",
    subtitle: "Gastronomía Latina y Coctelería",
    accent: "bg-[#E67E22]",
    logo: "https://ui-avatars.com/api/?name=SL+B&background=E67E22&color=fff",
    colors: ["bg-[#E67E22]", "bg-[#F39C12]", "bg-[#2C3E50]", "bg-[#ECF0F1]"],
  },
  {
    id: "3",
    name: "Lumina Studio",
    category: "Creatividad",
    subtitle: "Medios Digitales Experimentales",
    accent: "bg-[#9B59B6]",
    logo: "https://ui-avatars.com/api/?name=LS&background=9B59B6&color=fff",
    colors: ["bg-[#8E44AD]", "bg-[#2C3E50]", "bg-[#D2B4DE]", "bg-[#FFFFFF]"],
    large: true,
  },
  {
    id: "4",
    name: "Aether Finance",
    category: "FinTech",
    subtitle: "Gestión de Activos Descentralizados",
    accent: "bg-[#3498DB]",
    logo: "https://ui-avatars.com/api/?name=AF&background=3498DB&color=fff",
    colors: ["bg-[#2980B9]", "bg-[#34495E]", "bg-[#AED6F1]", "bg-[#FBFCFC]"],
  },
];

export const activeTasks: Task[] = [
  { id: "1", projectId: "1", title: "Aprobar Gasto de Anuncios del Fin de Semana", priority: "Alta",  status: "Pendiente",  date: "Hoy"       },
  { id: "2", projectId: "1", title: "Finalizar Fotos del Site",                    priority: "Media", status: "Pendiente",  date: "05 Oct"    },
  { id: "3", projectId: "2", title: "Reporte Mensual de Estadísticas",              priority: "Baja",  status: "Pendiente",  date: "12 Oct"    },
  { id: "4", projectId: "2", title: "Integrar al Equipo a Restobar X",              priority: "Baja",  status: "Completada", date: "Completada" },
];

export const calendarEvents = [
  { day: 1, projectId: "2", campaignId: "base_2", type: "Reels de IG", title: "Intro del Chef",         color: "bg-tertiary-fixed/30",      iconColor: "text-on-tertiary-fixed-variant", borderColor: "border-on-tertiary-fixed-variant", icon: "movie"            },
  { day: 2, projectId: "2", campaignId: "base_2", type: "Facebook",    title: "Promo: Happy Hour",      color: "bg-blue-100",               iconColor: "text-blue-600",                  borderColor: "border-blue-600",                  icon: "social_leaderboard" },
  { day: 4, projectId: "2", campaignId: "hw_2",   type: "TikTok",      title: "Halloween B-Roll",       color: "bg-orange-600/20",          iconColor: "text-orange-600",                borderColor: "border-orange-600",                icon: "music_note"        },
  { day: 6, projectId: "2", campaignId: "base_2", type: "IG",          title: "Carrusel de Comida",     color: "bg-tertiary-fixed/30",      iconColor: "text-on-tertiary-fixed-variant", borderColor: "border-on-tertiary-fixed-variant", icon: "image"             },
  { day: 3, projectId: "1", campaignId: "base_1", type: "LinkedIn",    title: "Avance de Obra Sur",     color: "bg-blue-100",               iconColor: "text-blue-700",                  borderColor: "border-blue-700",                  icon: "domain"            },
  { day: 5, projectId: "1", campaignId: "base_1", type: "YouTube",     title: "Entrevista Ing. Jefe",   color: "bg-red-100",                iconColor: "text-red-600",                   borderColor: "border-red-600",                   icon: "smart_display"     },
];

export interface SuggestedDate {
  id: string;
  title: string;
  date: string; // ISO format or relative
  type: "Feriado" | "Marketing" | "Estratégico";
  description: string;
  icon: string;
}

export const SUGGESTED_DATES: SuggestedDate[] = [
  // ABRIL 2026
  { id: "pe_abr1", title: "Viernes Santo", date: "2026-04-03", type: "Feriado", description: "Feriado largo de Semana Santa. Máximo consumo familiar. Ideal para contenido de tradición y gastronomía.", icon: "church" },
  { id: "pe_abr2", title: "Día de la Tierra", date: "2026-04-22", type: "Estratégico", description: "Alto engagement en contenido eco-consciente. Buena oportunidad para marcas con propósito.", icon: "eco" },
  // MAYO 2026
  { id: "pe_may1", title: "Día del Trabajo", date: "2026-05-01", type: "Feriado", description: "Feriado Nacional. Contenido motivacional, tributos al trabajo en equipo.", icon: "engineering" },
  { id: "pe_may2", title: "Día de la Madre", date: "2026-05-10", type: "Marketing", description: "Semana de mayor conversión del primer semestre en retail, food & beverage y regalos.", icon: "favorite" },
  // JUNIO 2026
  { id: "pe_jun1", title: "Día del Padre", date: "2026-06-21", type: "Marketing", description: "Segundo pico de conversión por regalos. Buen momento para promos y cenas especiales.", icon: "man" },
  { id: "pe_jun2", title: "San Juan / Amazonía", date: "2026-06-24", type: "Feriado", description: "Fiestas amazónicas. Oportunidad de contenido regional y cultural muy auténtico.", icon: "forest" },
  // JULIO 2026
  { id: "pe_jul1", title: "Fiestas Patrias — 28 Jul", date: "2026-07-28", type: "Feriado", description: "El hito patriótico más importante del año. Máxima oportunidad de campañas de orgullo nacional.", icon: "flag" },
  { id: "pe_jul2", title: "Fiestas Patrias — 29 Jul", date: "2026-07-29", type: "Feriado", description: "Segundo día de Fiestas Patrias. Ideal para contenidos de gastronomía peruana y cierre festivo.", icon: "restaurant" },
  // AGOSTO 2026
  { id: "pe_ago1", title: "Santa Rosa de Lima", date: "2026-08-30", type: "Feriado", description: "Patrona de Lima. Feriado con fuerte connotación espiritual y local.", icon: "local_florist" },
  // SEPTIEMBRE 2026
  { id: "pe_sep1", title: "Día de la Primavera", date: "2026-09-23", type: "Estratégico", description: "Vibe de renovación. Ideal para lanzamientos de temporada y contenido aspiracional.", icon: "sunny" },
  // OCTUBRE 2026
  { id: "pe_oct1", title: "Combate de Angamos", date: "2026-10-08", type: "Feriado", description: "Feriado Nacional. Menor engagement orgánico, mayor consumo de ocio.", icon: "directions_boat" },
  { id: "mkt_oct1", title: "Cyber Wow 2026", date: "2026-10-19", type: "Marketing", description: "Semana de alto tráfico. Preparar campañas de conversión directa y descuentos.", icon: "shopping_cart" },
  { id: "pe_oct2", title: "Halloween / Canción Criolla", date: "2026-10-31", type: "Marketing", description: "Doble oportunidad temática: Terror global vs Identidad local peruana.", icon: "celebration" },
  // NOVIEMBRE 2026
  { id: "pe_nov1", title: "Todos los Santos", date: "2026-11-01", type: "Feriado", description: "Feriado largo. Oportunidad para contenidos reflexivos o de viaje en familia.", icon: "church" },
  { id: "mkt_nov1", title: "Black Friday", date: "2026-11-27", type: "Marketing", description: "Pico máximo de ventas digital. Campañas de urgencia y conteo regresivo.", icon: "sell" },
  { id: "mkt_nov2", title: "Cyber Monday", date: "2026-11-30", type: "Marketing", description: "Extensión del Black Friday. Ideal para promos de productos digitales y tecnología.", icon: "devices" },
  // DICIEMBRE 2026
  { id: "pe_dic1", title: "Inmaculada Concepción", date: "2026-12-08", type: "Feriado", description: "Inicio oficial del mood navideño intensivo. Decoraciones y lanzamientos de temporada.", icon: "hotel_class" },
  { id: "mkt_dic1", title: "Navidad", date: "2026-12-25", type: "Marketing", description: "Pico absoluto de la temporada. Contenido cálido, nostálgico y de cierre de año.", icon: "card_giftcard" },
];
