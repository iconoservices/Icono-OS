"use client";

import { useProject } from "@/context/ProjectContext";
import { useState } from "react";
import ProductionModal from "@/components/ProductionModal";

export default function CalendarPage() {
  const { currentProject, hiddenCampaignIds, globalContents } = useProject();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [view, setView] = useState<"weekly" | "monthly">("weekly");

  const currentWeekDays = [16, 17, 18, 19, 20, 21, 22]; // Mock week dates
  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // Filter events: current project + not hidden campaign
  const filteredEvents = globalContents.filter(e => 
    e.projectId === currentProject?.id && 
    !hiddenCampaignIds.includes(e.campaignId)
  );

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
                <div key={day} className={`bg-surface-container-low/50 backdrop-blur-sm py-4 text-center border-b border-outline-variant/15 ${isToday ? 'relative' : ''}`}>
                  <span className={`text-[10px] font-bold font-headline uppercase tracking-widest ${isToday ? 'text-primary' : 'text-on-surface-variant'}`}>{day}</span>
                  <div className={`text-xl font-black mt-1 ${isToday ? 'text-primary' : (day === 'Sáb' || day === 'Dom') ? 'text-on-surface-variant/40' : 'text-on-surface'}`}>{date}</div>
                  {isToday && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                </div>
              );
            })}

            {/* Content columns for each day of the week (1-7) */}
            {[1, 2, 3, 4, 5, 6, 7].map(dayNum => {
              const dayEvents = filteredEvents.filter(e => (e.day % 7 || 7) === dayNum);
              return (
                <div key={dayNum} className="bg-white dark:bg-slate-900 min-h-[600px] p-2 space-y-2 border-r border-outline-variant/5 last:border-r-0">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`group relative p-3 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${event.color || 'bg-surface-container-low'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-extrabold uppercase tracking-tighter ${event.iconColor || 'text-on-surface'}`}>{event.type}</span>
                        <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                      </div>
                      <h4 className="text-[11px] font-bold leading-tight text-on-surface">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-4 text-[9px] font-bold text-on-surface-variant/70 uppercase">
                        <span className="material-symbols-outlined text-[12px]">schedule</span> 10:00 AM
                      </div>
                      
                      {/* Sub-items indicator */}
                      <div className="mt-2 pt-2 border-t border-black/5 flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Quick Add Button per day */}
                  <button className="w-full py-2 rounded-lg border border-dashed border-outline-variant/20 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-surface-container-low transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs text-outline-variant">add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Persistence and Detailed Add would go here, same as dashboard */}
      <ProductionModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        eventData={selectedEvent} 
      />
    </div>
  );
}
