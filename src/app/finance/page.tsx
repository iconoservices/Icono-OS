import Image from "next/image";

const clients = [
  {
    name: "Luminary Wellness",
    desc: "Estrategia de Contenido y Anuncios TikTok",
    color: "bg-[#ff0050]",
    fee: "$12,500",
    cost: "$4,200",
    margin: "+$8,300",
    marginPercent: "66.4%",
    status: "ÓPTIMO",
    statusColor: "emerald"
  },
  {
    name: "Apex Dynamics",
    desc: "Gestión Integral de Canales",
    color: "bg-[#1877f2]",
    fee: "$8,000",
    cost: "$7,100",
    margin: "+$900",
    marginPercent: "11.2%",
    status: "CRÍTICO",
    statusColor: "error"
  },
  {
    name: "Velvet & Vine",
    desc: "Curaduría Editorial y Estética",
    color: "bg-[#e4405f]",
    fee: "$15,000",
    cost: "$8,450",
    margin: "+$6,550",
    marginPercent: "43.6%",
    status: "ESTABLE",
    statusColor: "secondary"
  }
];

export default function Finance() {
  return (
    <main className="flex-1 p-8 overflow-y-auto">
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary leading-none mb-2 font-headline">Rentabilidad</h1>
          <p className="text-secondary font-body font-medium">Portal de Control de Realidad</p>
        </div>
        <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-full">
          <button className="px-6 py-2 rounded-full bg-surface-container-lowest text-sm font-bold shadow-sm">Mensual</button>
          <button className="px-6 py-2 rounded-full text-sm font-medium text-secondary hover:text-primary transition-colors">Trimestral</button>
          <button className="px-6 py-2 rounded-full text-sm font-medium text-secondary hover:text-primary transition-colors">Anual</button>
        </div>
      </div>
      
      {/* Key Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Monthly Revenue */}
        <div className="bg-surface-container-lowest p-8 rounded-full border border-outline-variant/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">payments</span>
          </div>
          <div className="relative z-10">
            <div className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Ingreso Mensual Total</div>
            <div className="text-4xl font-headline font-extrabold text-primary mb-2">$84,200</div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              <span>+12.4% vs mes anterior</span>
            </div>
          </div>
        </div>
        
        {/* Total Hours Invested */}
        <div className="bg-surface-container-lowest p-8 rounded-full border border-outline-variant/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">timer</span>
          </div>
          <div className="relative z-10">
            <div className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Horas Totales Invertidas</div>
            <div className="text-4xl font-headline font-extrabold text-primary mb-2">412.5 <span className="text-lg font-medium text-outline">hrs</span></div>
            <div className="flex items-center gap-2 text-on-tertiary-container font-bold text-xs">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>8% sobre la capacidad proyectada</span>
            </div>
          </div>
        </div>
        
        {/* Avg Hourly Rate */}
        <div className="bg-surface-container-lowest p-8 rounded-full border border-outline-variant/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl">insights</span>
          </div>
          <div className="relative z-10">
            <div className="text-xs font-bold text-outline uppercase tracking-widest mb-4">Tarifa por Hora por Cliente</div>
            <div className="text-4xl font-headline font-extrabold text-primary mb-2">$204 <span className="text-lg font-medium text-outline">prom</span></div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
              <span className="material-symbols-outlined text-sm">stars</span>
              <span>Umbral optimizado alcanzado</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Client Profitability Section */}
      <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-extrabold text-primary mb-1 font-headline">Análisis de Portafolio</h2>
            <p className="text-on-surface-variant text-sm">Tarifa Mensual vs. Costo Estimado de Recursos</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-bold text-primary hover:opacity-70 transition-opacity">
            <span className="material-symbols-outlined">download</span>
            Exportar Reporte Completo
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-outline uppercase text-[10px] tracking-[0.2em] font-bold">
                <th className="pb-4 pl-4">Entidad Cliente</th>
                <th className="pb-4">Equipo Asignado</th>
                <th className="pb-4">Tarifa Mensual</th>
                <th className="pb-4">Costo de Recursos</th>
                <th className="pb-4">Margen Neto</th>
                <th className="pb-4 text-right pr-4">Estado de Salud</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client, i) => (
                <tr key={i} className="group hover:bg-surface-container-low transition-colors">
                  <td className="py-4 pl-4 rounded-l-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-12 rounded-full ${client.color}`}></div>
                      <div>
                        <div className="font-bold text-primary text-sm">{client.name}</div>
                        <div className="text-[10px] text-outline">{client.desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex -space-x-2">
                       <img src={`https://ui-avatars.com/api/?name=${client.name}&background=random`} className="h-6 w-6 rounded-full border-2 border-surface-container-lowest object-cover" alt="team" />
                       <img src={`https://ui-avatars.com/api/?name=User&background=random`} className="h-6 w-6 rounded-full border-2 border-surface-container-lowest object-cover" alt="team" />
                    </div>
                  </td>
                  <td className="py-4 font-bold text-sm">{client.fee}</td>
                  <td className="py-4 text-sm text-on-surface-variant">{client.cost}</td>
                  <td className="py-4">
                    <div className={`text-sm font-bold ${client.statusColor === 'error' ? 'text-on-tertiary-container' : client.statusColor === 'emerald' ? 'text-emerald-600' : 'text-primary'}`}>{client.margin}</div>
                    <div className="text-[10px] text-on-surface-variant">{client.marginPercent} Margen</div>
                  </td>
                  <td className="py-4 text-right pr-4 rounded-r-xl">
                    {client.statusColor === "emerald" && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {client.status}
                      </div>
                    )}
                    {client.statusColor === "error" && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-error text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> {client.status}
                      </div>
                    )}
                    {client.statusColor === "secondary" && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> {client.status}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom Strategy Section */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency Timeline */}
        <div className="bg-surface-container rounded-xl p-8">
          <h3 className="text-lg font-extrabold text-primary mb-6">Evolución de Estrategia</h3>
          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-outline-variant/30"></div>
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-primary border-4 border-surface-container"></div>
                <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm">
                  <div className="text-[10px] font-bold text-outline mb-1">12 DE SEPTIEMBRE</div>
                  <div className="text-sm font-bold text-primary">Cambio en Asignación de Recursos</div>
                  <p className="text-xs text-on-surface-variant mt-1">Se reasignó Estratega Senior de 'Apex Dynamics' a 'Luminary' para capitalizar el potencial de alto margen.</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-outline-variant border-4 border-surface-container"></div>
                <div className="bg-surface-container-lowest/50 p-4 rounded-xl">
                  <div className="text-[10px] font-bold text-outline mb-1">04 DE SEPTIEMBRE</div>
                  <div className="text-sm font-bold text-on-surface">Auditoría de Tarifa por Hora</div>
                  <p className="text-xs text-on-surface-variant mt-1">Se identificó una fuga de facturación del 12% en tareas de informes automáticos de clientes boutique.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Forecast Card */}
        <div className="bg-primary-container p-8 rounded-xl text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]">bolt</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-lg font-headline font-extrabold mb-2 text-white">Cálculo de Capacidad</h3>
            <p className="text-primary-fixed-dim text-sm mb-6 max-w-xs">Tu equipo se encuentra actualmente a un 88% de capacidad facturable. Hay espacio para un proyecto más de Alta Velocidad (Tier $10k+).</p>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-extrabold">24.5</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-primary-fixed-dim">Horas Libres / Sem</div>
              </div>
              <div className="h-10 w-px bg-white/20"></div>
              <div>
                <div className="text-2xl font-extrabold">88%</div>
                <div className="text-[10px] uppercase font-bold tracking-widest text-primary-fixed-dim">Eficiencia</div>
              </div>
            </div>
            <button className="mt-8 bg-white text-primary px-6 py-2.5 rounded-full text-xs font-bold hover:bg-primary-fixed transition-colors">
              Generar Pitch Deck
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
