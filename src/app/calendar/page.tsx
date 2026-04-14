"use client";

import { useProject } from "@/context/ProjectContext";
import { useState } from "react";
import ProductionModal from "@/components/ProductionModal";
import { SUGGESTED_DATES, SuggestedDate } from "@/data/mock";

export default function CalendarPage() {
  const { currentProject, projects, hiddenCampaignIds, globalContents, allProjectCampaigns } = useProject();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [view, setView] = useState<"weekly" | "monthly">("weekly");

  const currentWeekDays = [16, 17, 18, 19, 20, 21, 22]; // Mock week dates
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const matrixDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const getColColor = (colId: string) => {
    const map: any = { prod: 'text-emerald-500', tiktok: 'text-[#FE2C55]', ig: 'text-[#E4405F]', fb: 'text-[#1877F2]', stories: 'text-[#E1306C]' };
    return map[colId] || 'text-primary';
  };

  const campaigns = currentProject 
    ? (allProjectCampaigns[currentProject.id] || []) 
    : Object.values(allProjectCampaigns).flat();

  // Filter events: current project (or all if null) + not hidden campaign
  const filteredEvents = globalContents.filter(e => 
    (currentProject === null ? true : e.projectId === currentProject?.id) && 
    !hiddenCampaignIds.includes(e.campaignId)
  );

  const handleAddFromSuggestion = (suggestion: SuggestedDate) => {
    // Create a mock event to pre-fill the modal
    setSelectedEvent({
      id: `suggested-${Date.now()}`,
      title: suggestion.title,
      type: "Estratégico",
      projectId: projects[0].id, // Default to first project or let user pick
      isNew: true,
      day: parseInt(suggestion.date.split("-")[2]), // Extract day for mock logic
    });
  };

  return (
    <div className="flex flex-1 overflow-hidden h-full bg-surface">
      <section className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold font-headline tracking-tighter text-on-surface">
                {view === 'weekly' ? 'Septiembre 2024' : 'Octubre 2024'}
              </h2>
              <p className="text-on-surface-variant font-medium mt-1">
                {view === 'weekly' ? 'Semana 38 • 16 – 22 de Sept' : 'Vista Mensual Consolidada'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10">
                <button 
                  onClick={() => setView('weekly')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${view === 'weekly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Semanal
                </button>
                <button 
                  onClick={() => setView('monthly')}
                  className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${view === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Mensual
                </button>
              </div>
              <div className="flex gap-1">
                <button className="p-2 bg-white rounded-lg border border-outline-variant/15 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-2 bg-white rounded-lg border border-outline-variant/15 hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-7 gap-px bg-outline-variant/20 rounded-2xl overflow-hidden border border-outline-variant/15 shadow-xl shadow-primary/5">
            {/* Header Days */}
            {dayNames.map((day, idx) => {
              const date = currentWeekDays[idx];
              const isToday = day === "Mié";
              return (
                <div key={day} className={`bg-surface-container-low/50 backdrop-blur-sm py-2 text-center border-b border-outline-variant/15 ${isToday ? 'relative' : ''}`}>
                  <span className={`text-[9px] font-bold font-headline uppercase tracking-widest ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</span>
                  <div className={`text-xl font-black mt-1 ${isToday ? 'text-primary' : (day === 'Sáb' || day === 'Dom') ? 'text-on-surface-variant/40' : 'text-on-surface'}`}>{date}</div>
                  {isToday && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                </div>
              );
            })}

            {/* Content columns for each day of the week (1-7) */}
            {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
              const dayName = matrixDays[dayNum - 1];
              const dayEvents = filteredEvents.filter(e => (e.day % 7 || 7) === dayNum);
              
              const activeStrategies = campaigns
                .filter(camp => !hiddenCampaignIds.includes(camp.id))
                .flatMap(camp => {
                  const dayData = camp.data.find((d: any) => d.day === dayName);
                  if (!dayData) return [];
                  const actions: any[] = [];
                  Object.entries(dayData.entries).forEach(([colId, colActions]) => {
                    if (Array.isArray(colActions)) {
                      colActions.forEach(action => {
                        actions.push({
                          actionId: action.id,
                          campaignId: camp.id,
                          strategy: action.text,
                          colId,
                          color: camp.color || getColColor(colId)
                        });
                      });
                    }
                  });
                  return actions;
                });

              const matchedEventIds = new Set();
              
              return (
                <div key={dayNum} className="bg-white dark:bg-slate-900 min-h-0 p-1.5 space-y-1.5 border-r border-outline-variant/5 last:border-r-0">
                  {activeStrategies.map((action, i) => {
                    const matchingEvents = dayEvents.filter(e => e.matrixSlot?.colId === action.colId || e.type?.toLowerCase() === action.colId);
                    matchingEvents.forEach(e => matchedEventIds.add(e.id));
                    
                    return (
                      <div key={`strat-${i}`} className="space-y-1.5">
                        {matchingEvents.length > 0 ? (
                          matchingEvents.map(event => (
                            <div 
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className={`group relative px-2 py-1.5 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${event.color || 'bg-surface-container-low'}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[8px] font-extrabold uppercase tracking-tighter ${event.iconColor || 'text-on-surface'}`}>
                                  {currentProject === null ? (projects.find(p => p.id === event.projectId)?.name || event.type) : event.type}
                                </span>
                                <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                              </div>
                              <h4 className="text-[10px] font-bold leading-snug text-on-surface mt-0.5">{event.title}</h4>
                              <p className="text-[8px] font-bold text-slate-500/70 line-clamp-1 leading-tight select-none mt-0.5 italic">{action.strategy}</p>
                              
                              {currentProject === null && (
                                <div className="flex items-center gap-1 mt-1">
                                  <div className={`w-1 h-1 rounded-full ${projects.find(p => p.id === event.projectId)?.accent.replace('bg-', 'bg-') || 'bg-primary'}`}></div>
                                  <span className="text-[8px] font-bold text-on-surface-variant uppercase truncate">{projects.find(p => p.id === event.projectId)?.name}</span>
                                </div>
                              )}
                              {event.time && (
                                <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-on-surface-variant/70 uppercase">
                                  <span className="material-symbols-outlined text-[10px]">schedule</span> {event.time}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/20 opacity-60 flex items-start gap-1.5 group hover:bg-surface-container-low/40 transition-colors cursor-pointer">
                            <span className={`material-symbols-outlined text-[10px] ${action.color} mt-0.5 opacity-50`}>design_services</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] font-bold text-slate-500 line-clamp-2 leading-tight select-none">{action.strategy}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayEvents.filter(e => !matchedEventIds.has(e.id)).map(event => (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`group relative px-2 py-1.5 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${event.color || 'bg-surface-container-low'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-extrabold uppercase tracking-tighter ${event.iconColor || 'text-on-surface'}`}>
                          {currentProject === null ? (projects.find(p => p.id === event.projectId)?.name || event.type) : event.type}
                        </span>
                        <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                      </div>
                      <h4 className="text-[10px] font-bold leading-snug text-on-surface mt-0.5">{event.title}</h4>
                      {currentProject === null && (
                        <div className="flex items-center gap-1 mt-1">
                           <div className={`w-1 h-1 rounded-full ${projects.find(p => p.id === event.projectId)?.accent.replace('bg-', 'bg-') || 'bg-primary'}`}></div>
                           <span className="text-[8px] font-bold text-on-surface-variant uppercase truncate">{projects.find(p => p.id === event.projectId)?.name}</span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-on-surface-variant/70 uppercase">
                          <span className="material-symbols-outlined text-[10px]">schedule</span> {event.time}
                        </div>
                      )}
                    </div>
                  ))}
                      
                  {/* Quick Add Button per day */}
                  <div className="w-full py-1 rounded-lg border border-dashed border-outline-variant/20 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-surface-container-low transition-all flex items-center justify-center cursor-pointer">
                    <span className="material-symbols-outlined text-xs text-outline-variant">add</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Suggested Dates Sidebar */}
      <aside className="w-80 border-l border-outline-variant/10 bg-surface-container-low/30 backdrop-blur-md overflow-hidden flex flex-col hidden xl:flex">
        <div className="p-6 border-b border-outline-variant/10">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl font-black tracking-tighter text-on-surface font-headline leading-none">TE<span className="inline-flex items-center justify-center border border-on-surface text-[10px] w-5 h-5 align-middle mx-0.5 -mt-1 font-bold">MP</span>EST</span>
            <div className="flex flex-col">
              <h3 className="text-sm font-black uppercase tracking-tight text-on-surface leading-none">Estrategia</h3>
              <h3 className="text-sm font-black uppercase tracking-tight text-on-surface leading-none">Sugerida</h3>
            </div>
          </div>
          <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest pl-0.5">Hitos clave para tu planificación</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {SUGGESTED_DATES.map((suggestion) => (
            <div 
              key={suggestion.id}
              onClick={() => handleAddFromSuggestion(suggestion)}
              className="bg-[#131722] dark:bg-black/40 p-6 rounded-[32px] hover:scale-[1.02] transition-all cursor-pointer group shadow-2xl shadow-black/20 relative border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none ${
                  suggestion.type === 'Feriado' ? 'bg-[#FFD9D9] text-[#E54D4D]' : 'bg-[#3D0A1D] text-[#FE2C55]'
                }`}>
                  {suggestion.type}
                </span>
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary group-hover:border-primary transition-all">
                  <span className="material-symbols-outlined text-sm font-bold">add</span>
                </div>
              </div>
              
              <h4 className="text-base font-extrabold text-[#E2E8F0] mb-3 leading-tight group-hover:text-primary transition-colors">{suggestion.title}</h4>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-6 font-medium">{suggestion.description}</p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                <span className="material-symbols-outlined text-[18px] text-[#475569]">{suggestion.icon}</span>
                <span className="text-[10px] font-black text-[#475569] uppercase tracking-widest">
                  {new Date(suggestion.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          ))}

          <div className="pt-8 text-center px-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <p className="text-[11px] font-bold text-on-surface">¿Falta algo?</p>
            <p className="text-[10px] text-on-surface-variant mt-1 leading-relaxed">Antigravity aprende de tus hitos personalizados para sugerirte mejores fechas.</p>
          </div>
        </div>
      </aside>

      {/* Persistence and Detailed Add would go here, same as dashboard */}
      <ProductionModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        eventData={selectedEvent} 
      />
    </div>
  );
}
