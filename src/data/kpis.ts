// ─── KPI & OKR Data Layer ───────────────────────────────────────────────────

export interface KeyResult {
  id: string;
  metric: string;
  target: number;
  current: number;
  unit: string; // "%", "K", "S/", "#", etc.
}

export interface OKR {
  id: string;
  quarter: string;          // "Q1 2026"
  objective: string;
  status: "on-track" | "at-risk" | "achieved";
  keyResults: KeyResult[];
}

export interface KPI {
  id: string;
  label: string;
  value: string;            // formatted display value
  raw: number;              // for calculations
  trend: number;            // % change vs last month (positive = good)
  unit: string;
  icon: string;
  color: string;            // Tailwind bg class
  iconColor: string;        // Tailwind text class
}

// ─── OKR Data per project ────────────────────────────────────────────────────

export const PROJECT_OKRS: Record<string, OKR[]> = {
  "1": [ // EcoConstruct
    {
      id: "eco_q1_2026",
      quarter: "Q1 2026",
      objective: "Establecer presencia digital como referente de construcción sostenible en Lima",
      status: "achieved",
      keyResults: [
        { id: "eco_kr1", metric: "Seguidores en LinkedIn", target: 2000, current: 2340, unit: "#" },
        { id: "eco_kr2", metric: "Alcance mensual en redes", target: 50000, current: 48200, unit: "#" },
        { id: "eco_kr3", metric: "Leads generados por RRSS", target: 30, current: 28, unit: "#" },
      ],
    },
    {
      id: "eco_q2_2026",
      quarter: "Q2 2026",
      objective: "Convertir el tráfico digital en citas comerciales calificadas",
      status: "on-track",
      keyResults: [
        { id: "eco_kr4", metric: "Tasa de conversión web", target: 5, current: 3.2, unit: "%" },
        { id: "eco_kr5", metric: "Citas agendadas vía RRSS", target: 20, current: 11, unit: "#" },
        { id: "eco_kr6", metric: "Costo por Lead", target: 35, current: 42, unit: "S/" },
      ],
    },
  ],

  "2": [ // Sunset Lounge Bar
    {
      id: "sun_q1_2026",
      quarter: "Q1 2026",
      objective: "Posicionar Sunset Lounge como el bar de referencia para el after-office en Miraflores",
      status: "achieved",
      keyResults: [
        { id: "sun_kr1", metric: "Seguidores en Instagram", target: 5000, current: 5840, unit: "#" },
        { id: "sun_kr2", metric: "Reservas vía RRSS por semana", target: 25, current: 31, unit: "#" },
        { id: "sun_kr3", metric: "Engagement Rate promedio", target: 4.5, current: 5.2, unit: "%" },
      ],
    },
    {
      id: "sun_q2_2026",
      quarter: "Q2 2026",
      objective: "Lanzar campaña de fidelización y aumentar clientes recurrentes en 30%",
      status: "on-track",
      keyResults: [
        { id: "sun_kr4", metric: "Clientes recurrentes/mes", target: 200, current: 148, unit: "#" },
        { id: "sun_kr5", metric: "Alcance en TikTok", target: 80000, current: 61400, unit: "#" },
        { id: "sun_kr6", metric: "Mención en medios digitales", target: 5, current: 3, unit: "#" },
      ],
    },
  ],

  "3": [ // Lumina Studio
    {
      id: "lum_q1_2026",
      quarter: "Q1 2026",
      objective: "Consolidar Lumina como productora de referencia para contenido experimental",
      status: "on-track",
      keyResults: [
        { id: "lum_kr1", metric: "Visualizaciones en YouTube", target: 100000, current: 73200, unit: "#" },
        { id: "lum_kr2", metric: "Seguidores ganados en IG", target: 3000, current: 2100, unit: "#" },
        { id: "lum_kr3", metric: "Colaboraciones con marcas", target: 4, current: 3, unit: "#" },
      ],
    },
  ],

  "4": [ // Aether Finance
    {
      id: "aeth_q2_2026",
      quarter: "Q2 2026",
      objective: "Educar al mercado sobre activos descentralizados y captar primeros 100 clientes",
      status: "at-risk",
      keyResults: [
        { id: "aeth_kr1", metric: "Suscriptores newsletter", target: 1000, current: 380, unit: "#" },
        { id: "aeth_kr2", metric: "Webinars realizados", target: 3, current: 1, unit: "#" },
        { id: "aeth_kr3", metric: "Leads calificados", target: 100, current: 24, unit: "#" },
      ],
    },
  ],
};

// ─── KPI Data per project ────────────────────────────────────────────────────

export const PROJECT_KPIS: Record<string, KPI[]> = {
  "1": [ // EcoConstruct
    { id: "eco_kpi1", label: "Alcance Mensual",    value: "48.2K",  raw: 48200,  trend: +12.4, unit: "K",  icon: "cell_tower",   color: "bg-blue-50",    iconColor: "text-blue-600"   },
    { id: "eco_kpi2", label: "Engagement Rate",    value: "3.8%",   raw: 3.8,    trend: +0.4,  unit: "%",  icon: "favorite",     color: "bg-rose-50",    iconColor: "text-rose-500"   },
    { id: "eco_kpi3", label: "Seguidores Ganados", value: "+340",   raw: 340,    trend: +18.0, unit: "#",  icon: "group_add",    color: "bg-emerald-50", iconColor: "text-emerald-600"},
    { id: "eco_kpi4", label: "Leads RRSS",         value: "28",     raw: 28,     trend: -6.7,  unit: "#",  icon: "person_raised_hand", color: "bg-orange-50", iconColor: "text-orange-500"},
    { id: "eco_kpi5", label: "Impresiones",        value: "142K",   raw: 142000, trend: +9.1,  unit: "K",  icon: "visibility",   color: "bg-purple-50",  iconColor: "text-purple-600" },
    { id: "eco_kpi6", label: "Costo por Lead",     value: "S/ 42",  raw: 42,     trend: +20.0, unit: "S/", icon: "payments",     color: "bg-red-50",     iconColor: "text-red-500"    },
  ],

  "2": [ // Sunset Lounge Bar
    { id: "sun_kpi1", label: "Alcance Mensual",    value: "61.4K",  raw: 61400,  trend: +22.1, unit: "K",  icon: "cell_tower",       color: "bg-blue-50",    iconColor: "text-blue-600"   },
    { id: "sun_kpi2", label: "Engagement Rate",    value: "5.2%",   raw: 5.2,    trend: +0.7,  unit: "%",  icon: "favorite",         color: "bg-rose-50",    iconColor: "text-rose-500"   },
    { id: "sun_kpi3", label: "Seguidores Ganados", value: "+840",   raw: 840,    trend: +31.0, unit: "#",  icon: "group_add",        color: "bg-emerald-50", iconColor: "text-emerald-600"},
    { id: "sun_kpi4", label: "Reservas/Semana",    value: "31",     raw: 31,     trend: +24.0, unit: "#",  icon: "table_restaurant", color: "bg-amber-50",   iconColor: "text-amber-600"  },
    { id: "sun_kpi5", label: "Impresiones",        value: "198K",   raw: 198000, trend: +18.4, unit: "K",  icon: "visibility",       color: "bg-purple-50",  iconColor: "text-purple-600" },
    { id: "sun_kpi6", label: "Alcance TikTok",     value: "61.4K",  raw: 61400,  trend: -4.2,  unit: "K",  icon: "music_note",       color: "bg-slate-50",   iconColor: "text-slate-600"  },
  ],

  "3": [ // Lumina Studio
    { id: "lum_kpi1", label: "Views YouTube",      value: "73.2K",  raw: 73200,  trend: +14.0, unit: "K",  icon: "smart_display",  color: "bg-red-50",     iconColor: "text-red-500"    },
    { id: "lum_kpi2", label: "Engagement Rate",    value: "4.1%",   raw: 4.1,    trend: +0.3,  unit: "%",  icon: "favorite",       color: "bg-rose-50",    iconColor: "text-rose-500"   },
    { id: "lum_kpi3", label: "Seguidores Ganados", value: "+210",   raw: 210,    trend: -5.0,  unit: "#",  icon: "group_add",      color: "bg-emerald-50", iconColor: "text-emerald-600"},
    { id: "lum_kpi4", label: "Colaboraciones",     value: "3",      raw: 3,      trend: +50.0, unit: "#",  icon: "handshake",      color: "bg-purple-50",  iconColor: "text-purple-600" },
    { id: "lum_kpi5", label: "Impresiones",        value: "89K",    raw: 89000,  trend: +7.2,  unit: "K",  icon: "visibility",     color: "bg-blue-50",    iconColor: "text-blue-600"   },
    { id: "lum_kpi6", label: "Shares",             value: "1.2K",   raw: 1200,   trend: +33.3, unit: "K",  icon: "share",          color: "bg-orange-50",  iconColor: "text-orange-500" },
  ],

  "4": [ // Aether Finance
    { id: "aeth_kpi1", label: "Suscriptores",      value: "380",    raw: 380,    trend: -12.0, unit: "#",  icon: "mark_email_read", color: "bg-blue-50",   iconColor: "text-blue-600"   },
    { id: "aeth_kpi2", label: "Engagement Rate",   value: "2.1%",   raw: 2.1,    trend: -0.8,  unit: "%",  icon: "favorite",        color: "bg-rose-50",   iconColor: "text-rose-500"   },
    { id: "aeth_kpi3", label: "Leads Calificados", value: "24",     raw: 24,     trend: -20.0, unit: "#",  icon: "person_raised_hand", color: "bg-orange-50", iconColor: "text-orange-500"},
    { id: "aeth_kpi4", label: "Impresiones",       value: "31K",    raw: 31000,  trend: +3.1,  unit: "K",  icon: "visibility",      color: "bg-purple-50", iconColor: "text-purple-600" },
    { id: "aeth_kpi5", label: "Alcance Mensual",   value: "18.4K",  raw: 18400,  trend: -8.2,  unit: "K",  icon: "cell_tower",      color: "bg-slate-50",  iconColor: "text-slate-600"  },
    { id: "aeth_kpi6", label: "Costo por Lead",    value: "S/ 128", raw: 128,    trend: +28.0, unit: "S/", icon: "payments",        color: "bg-red-50",    iconColor: "text-red-500"    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getOKRProgress(okr: OKR): number {
  const total = okr.keyResults.reduce((sum, kr) => {
    const pct = Math.min((kr.current / kr.target) * 100, 100);
    return sum + pct;
  }, 0);
  return Math.round(total / okr.keyResults.length);
}

export function getKRProgress(kr: KeyResult): number {
  return Math.min(Math.round((kr.current / kr.target) * 100), 100);
}

export function statusConfig(status: OKR["status"]) {
  return {
    "on-track": { label: "En Ruta",  bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    "at-risk":  { label: "En Riesgo",bg: "bg-red-50",     text: "text-red-600",    dot: "bg-red-500 animate-pulse" },
    "achieved": { label: "Logrado",  bg: "bg-primary/10", text: "text-primary",    dot: "bg-primary" },
  }[status];
}
