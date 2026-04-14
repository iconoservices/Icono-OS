"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calendarEvents, projectCampaigns, SUGGESTED_DATES } from "@/data/mock";
import ProductionModal from "@/components/ProductionModal";
import { useProject } from "@/context/ProjectContext";

const initialMatrixColumns = [
  { id: 'prod', title: 'Producción', subtitle: 'Acción en Campo', color: 'text-emerald-500', bg: 'bg-emerald-500', isAction: true },
  { id: 'tiktok', title: 'TikTok', subtitle: 'Humor / Cercano', color: 'text-[#FE2C55]', bg: 'bg-[#FE2C55]', hoverBg: 'hover:bg-[#FE2C55]/10', hoverText: 'hover:text-[#FE2C55]', borderHover: 'hover:border-[#FE2C55]/20' },
  { id: 'ig', title: 'Instagram', subtitle: 'Estético / Info', color: 'text-[#E4405F]', bg: 'bg-[#E4405F]', hoverBg: 'hover:bg-[#E4405F]/10', hoverText: 'hover:text-[#E4405F]', borderHover: 'hover:border-[#E4405F]/20' },
  { id: 'fb', title: 'Facebook', subtitle: 'Promo / Comunidad', color: 'text-[#1877F2]', bg: 'bg-[#1877F2]', hoverBg: 'hover:bg-[#1877F2]/10', hoverText: 'hover:text-[#1877F2]', borderHover: 'hover:border-[#1877F2]/20' },
  { id: 'stories', title: 'Meta Stories', subtitle: 'Historias / 24h', color: 'text-[#E1306C]', bg: 'bg-[#E1306C]', hoverBg: 'hover:bg-[#E1306C]/10', hoverText: 'hover:text-[#E1306C]', borderHover: 'hover:border-[#E1306C]/20' }
];

// Map over days and store entries corresponding to column IDs
const defaultCampaigns = [
  {
    id: "default",
    name: "Estrategia Base",
    isBase: true,
    data: [
      { day: 'Lunes', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
      { day: 'Martes', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
      { day: 'Miércoles', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
      { day: 'Jueves', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
      { day: 'Viernes', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
      { day: 'Sábado', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
      { day: 'Domingo', entries: { tiktok: '-', ig: '-', fb: '-', prod: '-' } },
    ]
  }
];

export default function Dashboard() {
  const { 
    projects,
    currentProject, 
    hiddenCampaignIds, 
    globalContents, 
    setGlobalContents, 
    allProjectCampaigns, 
    setAllProjectCampaigns, 
    addContent, 
    updateContent, 
    deleteContent, 
    updateCampaign 
  } = useProject();
  const [view, setView] = useState<"monthly" | "weekly" | "matrix" | "yearly">("matrix");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  // Editable Data States
  const [activeMatrixSlot, setActiveMatrixSlot] = useState<{ campaignId: string, actionId: string, day: string, colId: string, text: string, time?: string, color: string } | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<"tareas" | "hitos" | "plan">("tareas");
  const [planClientFilter, setPlanClientFilter] = useState<string | null>(null);
  
  
  const getNumericDay = (matrixDay: string) => {
    const map: Record<string, number> = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
    return map[matrixDay] || 1;
  };

  const handleAddContentToSlot = async (dayName: string, colId: string, campaignId: string) => {
    if (!colId) return;
    // This now adds to globalContents (Production pieces)
    const newContent = {
      id: Date.now().toString(),
      projectId: currentProject?.id || '2',
      campaignId: campaignId || 'base_2',
      day: dayName ? getNumericDay(dayName) : 1,
      type: colId.toUpperCase(),
      title: "Nueva Pieza...",
      color: "bg-surface-container",
      iconColor: "text-primary",
      borderColor: "border-primary",
      icon: "add_box",
      matrixSlot: { day: dayName || 'Lunes', colId: colId }
    };
    await addContent(newContent);
    setSelectedEvent(newContent);
  };

  const handleAddActionToSlot = async (dayName: string, colId: string, campaignId: string) => {
    const actionId = Math.random().toString(36).substr(2, 9);
    const newAction = {
      id: actionId,
      text: "Nueva Acción...",
      time: "",
      campaignId: campaignId
    };

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newData = campaign.data.map(d => d.day === dayName ? {
      ...d,
      entries: {
        ...d.entries,
        [colId]: [...(d.entries[colId] || []), newAction]
      }
    } : d);

    await updateCampaign(campaignId, { data: newData });

    setActiveMatrixSlot({
      campaignId,
      actionId,
      day: dayName,
      colId: colId,
      text: newAction.text,
      time: newAction.time,
      color: initialMatrixColumns.find(c => c.id === colId)?.color || 'text-primary'
    });
    setIsRightPanelOpen(true);
  };

  // Compute active campaigns based on project
  const campaigns = currentProject ? (allProjectCampaigns[currentProject.id] || []) : [];

  const handleUpdateAction = async (campaignId: string, actionId: string, day: string, colId: string, updates: { text?: string, time?: string }) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newData = campaign.data.map(d => d.day === day ? {
      ...d,
      entries: {
        ...d.entries,
        [colId]: Array.isArray(d.entries[colId])
          ? (d.entries[colId] as any[]).map(a => a.id === actionId ? { ...a, ...updates } : a)
          : []
      }
    } : d);

    await updateCampaign(campaignId, { data: newData });

    // Update active slot to reflect change in sidebar
    if (activeMatrixSlot && activeMatrixSlot.actionId === actionId) {
      setActiveMatrixSlot(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteAction = async (campaignId: string, actionId: string, day: string, colId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const newData = campaign.data.map(d => d.day === day ? {
      ...d,
      entries: {
        ...d.entries,
        [colId]: Array.isArray(d.entries[colId])
          ? (d.entries[colId] as any[]).map(a => a.id === actionId ? null : a).filter(Boolean) as any
          : []
      }
    } : d);

    await updateCampaign(campaignId, { data: newData });
    setActiveMatrixSlot(null);
  };

  const handleGoToToday = () => setCurrentDate(new Date());
  const handlePrevMonth = () => {
    if (view === 'weekly') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };
  const handleNextMonth = () => {
    if (view === 'weekly') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleAddFromSuggestion = async (suggestion: any) => {
    if (!currentProject) return;
    const newContent = {
      id: Date.now().toString(),
      projectId: currentProject.id,
      campaignId: 'base_2',
      day: parseInt(suggestion.date.split("-")[2]),
      month: parseInt(suggestion.date.split("-")[1]) - 1,
      year: parseInt(suggestion.date.split("-")[0]),
      type: "ESTRATÉGICO",
      title: suggestion.title,
      sourceSuggestionId: suggestion.id,
      color: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "border-primary",
      icon: suggestion.icon,
      matrixSlot: { day: 'Lunes', colId: 'prod' }
    };
    await addContent(newContent);
    setRightPanelTab('plan');
  };

  const matrixDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  // Dynamic Month Generation
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });
  const year = currentDate.getFullYear();
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust for Monday start
  };

   const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
   const firstDayIdx = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
   
   const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
   const prevMonthDaysCount = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);
   const prevMonthEmptyDays = Array.from({ length: firstDayIdx }, (_, i) => prevMonthDaysCount - firstDayIdx + i + 1);
  
  // Calculate current week days based on currentDate
  const getWeeklyDays = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(d.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  };
  const currentWeekDays = getWeeklyDays(currentDate);

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
          
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-outline-variant uppercase tracking-[0.2em] mb-0.5">
                {view === 'monthly' ? 'Calendario Mensual' : 'Estrategia de Contenido'}
              </span>
              <h2 className="text-xl font-black text-primary tracking-tight font-headline flex items-center gap-2">
                {view === 'monthly' ? monthName : currentProject?.name || "Sin Proyecto"}
                <span className="text-slate-300 text-sm font-light">
                  {view === 'matrix' ? '• Plan Maestro' : `• ${year}`}
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center bg-surface-container-low/50 rounded-lg p-0.5 border border-outline-variant/10">
                <button 
                  onClick={() => setView('matrix')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${view === 'matrix' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Matriz
                </button>
                <button 
                  onClick={() => setView('weekly')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${view === 'weekly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Semanal
                </button>
                <button 
                  onClick={() => setView('monthly')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${view === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Mensual
                </button>
                <button 
                  onClick={() => setView('yearly')}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${view === 'yearly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Anual
                </button>
              </div>

              <div className="h-4 w-px bg-outline-variant/20 mx-1 hidden sm:block"></div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handleGoToToday}
                  className="px-3 py-1 text-[11px] font-bold rounded-lg bg-white border border-outline-variant/10 hover:bg-surface-container-low transition-colors shadow-sm"
                >
                  Hoy
                </button>
                <div className="flex items-center bg-surface-container-low/50 rounded-lg p-0.5 border border-outline-variant/10">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-white hover:shadow-sm rounded-md transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${isRightPanelOpen ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white border border-outline-variant/10 text-on-surface-variant hover:bg-surface-container-low'}`}
                title="Alternar Tareas"
              >
                <span className="material-symbols-outlined text-[18px]">{isRightPanelOpen ? 'dock_to_right' : 'right_panel_open'}</span>
              </button>
            </div>
          </div>
          
           {view === 'matrix' ? (
            /* MATRIZ VIEW - UNIFIED MASTER TABLE */
            <div className="pb-12 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-primary/5 border border-outline-variant/10 overflow-x-auto overflow-hidden">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container-low/40 backdrop-blur-sm">
                      <th className="py-4 px-6 text-[11px] font-black uppercase tracking-widest text-slate-400 w-24 border-b border-outline-variant/10">Día</th>
                      
                      {initialMatrixColumns.map(col => (
                        <th key={col.id} className="py-4 px-4 border-b border-outline-variant/10 group cursor-pointer hover:bg-surface-container/50 transition-colors min-w-[160px] max-w-[200px]">
                          <div className="flex items-center justify-between">
                            <div className="overflow-hidden">
                              <span className={`text-[11px] font-black uppercase tracking-tighter ${col.color} block truncate`}>{col.title}</span>
                              <span className="block text-[9px] font-bold text-slate-400 normal-case tracking-normal truncate">{col.subtitle}</span>
                            </div>
                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 text-slate-300 transition-all shrink-0">more_vert</span>
                          </div>
                        </th>
                      ))}
                      
                      <th className="py-4 px-2 w-12 text-center border-b border-outline-variant/10 border-l border-dashed group cursor-pointer hover:bg-surface-container/50">
                        <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-primary transition-colors">add</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/5">
                    {matrixDays.map((dayName) => (
                      <tr key={dayName} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="py-6 px-6 align-top bg-surface-container-low/20 border-r border-outline-variant/5">
                          <span className="text-base font-black text-primary tracking-tighter block leading-none">{dayName}</span>
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-1 block">{monthName}</span>
                        </td>
                        
                        {initialMatrixColumns.map(col => {
                          // Aggregate strategies from all unhidden campaigns
                          const activeStrategies = campaigns
                            .filter(camp => !hiddenCampaignIds.includes(camp.id))
                            .flatMap(camp => {
                              const dayData = camp.data.find((d: any) => d.day === dayName);
                              const rawEntry = dayData?.entries[col.id];
                              const actions = Array.isArray(rawEntry) ? rawEntry : [];
                              return actions.map((action: any) => ({
                                actionId: action.id,
                                campaignId: camp.id,
                                campaignName: camp.name,
                                strategy: action.text,
                                time: action.time,
                                color: camp.color || col.color
                              }));
                            });

                          return (
                            <td key={`${dayName}-${col.id}`} className="p-4 align-top">
                              <div className="flex flex-col gap-2">
                                {activeStrategies.length > 0 ? (() => {
                                      // Group strategies by campaignId
                                      const grouped: Record<string, any[]> = {};
                                      activeStrategies.forEach(item => {
                                        if (!grouped[item.campaignId]) grouped[item.campaignId] = [];
                                        grouped[item.campaignId].push(item);
                                      });

                                      return Object.entries(grouped).map(([campId, items]) => (
                                        <div key={campId} className="space-y-1.5 mb-2 last:mb-0">
                                          {/* Show Campaign Label only ONCE for the group if multiple campaigns exist */}
                                          {campaigns.length > 1 && (
                                            <div className="text-[8px] font-black uppercase tracking-tighter text-slate-400 mb-1 flex items-center gap-1 overflow-hidden">
                                              <div className={`w-1 h-1 rounded-full shrink-0 ${items[0].color?.replace('text-', 'bg-') || 'bg-primary'}`}></div>
                                              <span className="truncate">{items[0].campaignName}</span>
                                            </div>
                                          )}
                                          
                                          {items.map((item) => (
                                            <div 
                                              key={`${item.campaignId}-${item.actionId}`}
                                              onClick={() => {
                                                setActiveMatrixSlot({ 
                                                  campaignId: item.campaignId, 
                                                  actionId: item.actionId,
                                                  day: dayName, 
                                                  colId: col.id, 
                                                  text: item.strategy, 
                                                  time: item.time,
                                                  color: col.color 
                                                }); 
                                                setIsRightPanelOpen(true); 
                                              }}
                                              className={`group/item relative p-2.5 rounded-xl border-l-[4px] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md bg-white dark:bg-slate-900 border-outline-variant/10 ${col.color?.replace('text-', 'border-') || 'border-primary'}`}
                                            >
                                              <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${col.color}`}>{item.strategy}</p>
                                              
                                              {item.time && (
                                                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-black text-slate-400">
                                                  <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                  {item.time}
                                                </div>
                                              )}
                                              
                                              <div className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <span className="material-symbols-outlined text-[14px] text-slate-300">edit</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ));
                                    })() : (
                                    <div 
                                      onClick={() => { 
                                        // Default to Base Campaign if empty
                                        const baseCamp = campaigns.find(c => c.isBase) || campaigns[0];
                                        handleAddActionToSlot(dayName, col.id, baseCamp.id);
                                      }}
                                      className="w-full h-full min-h-[44px] rounded-xl border border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 hover:border-primary/40 hover:bg-primary/[0.03] transition-all cursor-pointer group/add"
                                    >
                                      <span className="material-symbols-outlined text-sm text-slate-300 group-hover/add:text-primary transition-colors">add</span>
                                    </div>
                                  )}

                                  {activeStrategies.length > 0 && (
                                    <button 
                                      onClick={() => handleAddActionToSlot(dayName, col.id, activeStrategies[0].campaignId)}
                                      className="w-full py-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-primary/[0.02] transition-all flex items-center justify-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-xs text-slate-300">add</span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Nuevo</span>
                                    </button>
                                  )}
                              </div>
                            </td>
                          );
                        })}
                        
                        <td className="py-4 px-2 w-12 text-center border-l border-dashed border-outline-variant/10 align-top pt-8">
                          <button className="text-slate-200 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-sm">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : view === 'monthly' ? (
            <div className="flex flex-col gap-4">
              {/* Filtro de Campañas */}
              <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-outline-variant">filter_list</span>
                <span className="text-xs font-bold text-outline uppercase tracking-widest">Filtro Consolidado:</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-full bg-slate-900 text-slate-100 text-[11px] font-bold shadow-sm">Todas las Campañas</button>
                  {campaigns.map(camp => (
                     <button key={camp.id} className="px-4 py-1.5 rounded-full bg-surface text-on-surface border border-outline-variant/20 text-[11px] font-bold hover:bg-surface-container transition-colors shadow-sm">{camp.name}</button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col">
                <div className="grid grid-cols-7 gap-px bg-outline-variant/10">
                  {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                    <div key={day} className="bg-surface-container-low py-3 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">{day}</div>
                  ))}
                  {prevMonthEmptyDays.map(day => (
                    <div key={`prev-${day}`} className="bg-surface-container-lowest min-h-[140px] p-3 transition-colors hover:bg-surface-container-low">
                      <span className="text-sm font-medium text-on-surface-variant/40">{day}</span>
                    </div>
                  ))}
                   {currentMonthDays.map(day => {
                    const events = globalContents.filter(e => 
                      e.day === day && 
                      e.projectId === currentProject?.id &&
                      !hiddenCampaignIds.includes(e.campaignId)
                    );
                    
                    const suggestions = SUGGESTED_DATES.filter(s => {
                      const sDate = new Date(s.date);
                      return sDate.getDate() === day && 
                             sDate.getMonth() === currentDate.getMonth() && 
                             sDate.getFullYear() === currentDate.getFullYear();
                    });

                    const today = new Date();
                    const isToday = day === today.getDate() && 
                                   currentDate.getMonth() === today.getMonth() && 
                                   currentDate.getFullYear() === today.getFullYear();
                    
                    return (
                      <div key={`curr-${day}`} className={`bg-surface-container-lowest min-h-[140px] p-3 transition-colors hover:bg-surface-container-low ${isToday ? 'bg-primary/5' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                          {isToday && <span className="text-[8px] font-black text-primary uppercase tracking-widest px-1.5 py-0.5 bg-primary/10 rounded-full">Hoy</span>}
                        </div>
                        <div className="mt-2 space-y-2">
                          {suggestions.map((s) => (
                            <div key={s.id} className={`flex items-center gap-1.5 p-1.5 rounded-lg border border-dashed border-primary/20 bg-primary/5 group cursor-default`}>
                              <span className="material-symbols-outlined text-[12px] text-primary">{s.icon}</span>
                              <span className="text-[9px] font-extrabold text-primary uppercase truncate leading-none">{s.title}</span>
                            </div>
                          ))}
                          {events.map((event, idx) => (
                            <div key={idx} onClick={() => setSelectedEvent(event)} className={`flex items-center gap-2 p-2 rounded-lg ${event.color} border-l-4 ${event.borderColor} group cursor-pointer transition-all hover:scale-[1.02]`}>
                              <span className={`material-symbols-outlined text-[16px] ${event.iconColor}`}>{event.icon}</span>
                              <span className="text-[11px] font-bold truncate">{event.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : view === 'yearly' ? (
            /* YEARLY VIEW - MACRO STRATEGY GRID */
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, mIdx) => (
                  <div key={month} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 p-5 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/5">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">{month}</h4>
                      <span className="text-[10px] font-bold text-slate-400">2024</span>
                    </div>
                    
                    {/* Simplified Macro View: Show Campaign Intensity */}
                    <div className="space-y-3">
                      {(allProjectCampaigns[currentProject?.id || '2'] || []).map((camp, cIdx) => (
                        <div key={cIdx} className="space-y-1">
                          <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <span>{camp.name}</span>
                            <span className={mIdx === 9 ? 'text-primary' : ''}>{mIdx === 9 ? 'Activa' : ''}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: mIdx === 9 ? '85%' : (mIdx < 9 ? '100%' : '15%') }}
                              className={`h-full rounded-full ${camp.id === 'base_2' ? 'bg-primary' : 'bg-amber-400'}`}
                            ></motion.div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-outline-variant/5 flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#FE2C55] border-2 border-white dark:border-slate-800"></div>
                        <div className="w-5 h-5 rounded-full bg-[#E4405F] border-2 border-white dark:border-slate-800"></div>
                        <div className="w-5 h-5 rounded-full bg-[#1877F2] border-2 border-white dark:border-slate-800"></div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Macro-Plan</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Calendar Grid (Weekly) */}
              <div className="grid grid-cols-7 gap-px bg-outline-variant/10 rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(day => (
                  <div key={day} className="bg-surface-container-low py-3 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">{day}</div>
                ))}
                
                {currentWeekDays.map((date, idx) => {
                  const dayNum = date.getDate();
                  const dayOfWeek = date.getDay() || 7;
                  const dayName = matrixDays[dayOfWeek - 1];

                  const events = globalContents.filter(e => 
                    (e.day === dayNum || e.day === dayOfWeek) && 
                    e.projectId === currentProject?.id &&
                    !hiddenCampaignIds.includes(e.campaignId)
                  );

                  const activeStrategies = campaigns
                    .filter(camp => !hiddenCampaignIds.includes(camp.id))
                    .flatMap(camp => {
                      const dayData = camp.data.find((d: any) => d.day === dayName);
                      if (!dayData) return [];
                      const actions: any[] = [];
                      const colOrder = ['prod', 'tiktok', 'ig', 'fb', 'stories'];
                      colOrder.forEach(colId => {
                        const colActions = dayData.entries[colId];
                        if (Array.isArray(colActions)) {
                          colActions.forEach(action => {
                            actions.push({
                              actionId: action.id,
                              campaignId: camp.id,
                              strategy: action.text,
                              colId,
                              color: initialMatrixColumns.find(c => c.id === colId)?.color || 'text-primary'
                            });
                          });
                        }
                      });
                      return actions;
                    });

                  const suggestions = SUGGESTED_DATES.filter(s => {
                    const sDate = new Date(s.date);
                    return sDate.getDate() === dayNum && 
                           sDate.getMonth() === date.getMonth() && 
                           sDate.getFullYear() === date.getFullYear();
                  });

                  const today = new Date();
                  const isToday = date.getDate() === today.getDate() && 
                                 date.getMonth() === today.getMonth() && 
                                 date.getFullYear() === today.getFullYear();
                  
                  const matchedEventIds = new Set();
                  
                  return (
                    <div key={`week-${idx}`} className={`bg-surface-container-lowest min-h-0 p-1.5 transition-colors hover:bg-surface-container-low ${isToday ? 'bg-primary/[0.03] ring-2 ring-primary ring-inset' : ''}`}>
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{dayNum}</span>
                        {isToday && <span className="text-[8px] font-black text-primary uppercase tracking-widest">HOY</span>}
                      </div>
                      <div className="space-y-1.5">
                        {suggestions.map((s) => (
                          <div key={s.id} className="px-2 py-1.5 rounded-lg border border-dashed border-primary/30 bg-primary/5 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[12px] text-primary shrink-0">{s.icon}</span>
                            <span className="text-[9px] font-black text-primary uppercase tracking-tighter leading-none truncate">{s.title}</span>
                          </div>
                        ))}
                        {activeStrategies.map((action, i) => {
                          const matchingEvents = events.filter(e => e.matrixSlot?.colId === action.colId || e.type?.toLowerCase() === action.colId);
                          matchingEvents.forEach(e => matchedEventIds.add(e.id));
                          
                          const colDef = initialMatrixColumns.find(c => c.id === action.colId);
                          const colName = colDef ? colDef.title : action.colId;

                          return (
                            <div 
                              key={`strat-${i}`} 
                              className={`group relative p-2.5 rounded-xl border border-outline-variant/10 transition-all cursor-pointer overflow-hidden ${matchingEvents.length > 0 ? 'bg-white dark:bg-slate-900 shadow-sm hover:shadow-md' : 'bg-surface-container-low/30 border-dashed opacity-60 hover:opacity-100 hover:bg-surface-container-low/50'}`}
                              onClick={() => {
                                if (matchingEvents.length > 0) {
                                  setSelectedEvent(matchingEvents[0]);
                                } else {
                                  setActiveMatrixSlot({ 
                                    campaignId: action.campaignId, 
                                    actionId: action.actionId,
                                    day: dayName, 
                                    colId: action.colId, 
                                    text: action.strategy, 
                                    time: action.time,
                                    color: action.color 
                                  }); 
                                  setIsRightPanelOpen(true);
                                }
                              }}
                            >
                              <div className="mb-1.5">
                                <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest ${action.color} bg-surface-container-low border border-outline-variant/5`}>
                                  {colName}
                                </span>
                              </div>
                              <h4 className={`text-[11px] font-extrabold leading-tight ${matchingEvents.length > 0 ? 'text-on-surface' : 'text-on-surface-variant'}`}>{action.strategy}</h4>
                              
                              {action.time && (
                                <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-on-surface-variant/70 uppercase">
                                  <span className="material-symbols-outlined text-[10px]">schedule</span> {action.time}
                                </div>
                              )}

                              {matchingEvents.map(event => (
                                <div key={event.id} className="mt-1.5 flex items-center gap-1.5 py-1 px-1.5 rounded-md border border-outline-variant/10 bg-surface-container-lowest">
                                  <span className="text-[8.5px] font-extrabold truncate text-on-surface-variant/90">{event.title}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {events.filter(e => !matchedEventIds.has(e.id)).map((event, idx) => (
                          <div 
                            key={`unmatched-${idx}`} 
                            onClick={() => setSelectedEvent(event)}
                            className={`group relative px-2 py-1.5 rounded-xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${event.color || 'bg-surface-container-low'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className={`text-[8px] font-extrabold uppercase tracking-tighter ${event.iconColor || 'text-on-surface'}`}>
                                {event.type}
                              </span>
                              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">more_vert</span>
                            </div>
                            <h4 className="text-[10px] font-bold leading-snug text-on-surface mt-0.5">{event.title}</h4>
                            
                            {event.time && (
                              <div className="flex items-center gap-1 mt-1 text-[8px] font-bold text-on-surface-variant/70 uppercase">
                                <span className="material-symbols-outlined text-[10px]">schedule</span> {event.time}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="opacity-0 group-hover:opacity-100 border border-dashed border-outline-variant/30 rounded-lg py-1 flex items-center justify-center text-outline-variant hover:text-primary hover:border-primary transition-all cursor-pointer">
                          <span className="material-symbols-outlined text-sm">add</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Bottom Legend */}
              <div className="mt-8 flex gap-6 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-900"></div>
                  <span className="text-xs font-semibold text-slate-600">TikTok</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-on-tertiary-container"></div>
                  <span className="text-xs font-semibold text-slate-600">Instagram</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-xs font-semibold text-slate-600">Facebook</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Collapsible Right Sidebar */}
      <AnimatePresence initial={false}>
        {isRightPanelOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shrink-0 border-l border-outline-variant/10 bg-surface-container-low overflow-hidden"
          >
            <aside className="w-80 flex flex-col p-6 h-full overflow-y-auto no-scrollbar relative">
              
              {activeMatrixSlot ? (
                /* BUCKET GESTOR UI - HIGH DENSITY */
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <button 
                        onClick={() => setActiveMatrixSlot(null)}
                        className="p-1.5 rounded-lg hover:bg-outline-variant/10 text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId)}
                        className="p-1.5 rounded-lg text-error hover:bg-error/10 transition-colors"
                        title="Eliminar Acción"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-[9px] font-bold text-outline-variant uppercase tracking-widest mb-0.5">
                        {activeMatrixSlot.day} • {activeMatrixSlot.colId}
                      </h3>
                      <input 
                        type="text"
                        value={activeMatrixSlot.text}
                        onChange={(e) => handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, { text: e.target.value })}
                        placeholder="Acción estratégica..."
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-base font-extrabold tracking-tight font-headline placeholder:text-outline-variant/30"
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Time Input Component - COMPACT */}
                      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white border border-outline-variant/5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-outline uppercase tracking-widest">Horario</span>
                          <span className="material-symbols-outlined text-[12px] text-slate-300">schedule</span>
                        </div>
                        <input 
                          type="text"
                          value={activeMatrixSlot.time || ""}
                          onChange={(e) => handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, { time: e.target.value })}
                          placeholder="Ej: 18:00"
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] font-bold text-primary placeholder:text-slate-300"
                        />
                      </div>

                      {/* Campaign Selection Component - COMPACT */}
                      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white border border-outline-variant/5 shadow-sm">
                        <span className="text-[8px] font-bold text-outline uppercase tracking-widest">Asignada a</span>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[10px] text-primary">campaign</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 truncate min-w-0">
                            {campaigns.find(c => c.id === activeMatrixSlot.campaignId)?.name || 'Estrategia'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Piezas de Producción</span>
                      <button 
                        onClick={() => handleAddContentToSlot(activeMatrixSlot.day, activeMatrixSlot.colId, activeMatrixSlot.campaignId)}
                        className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      >
                         <span className="material-symbols-outlined text-sm">post_add</span>
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-1.5 pb-4">
                      {globalContents
                        .filter(c => c.matrixSlot.day === activeMatrixSlot.day && c.matrixSlot.colId === activeMatrixSlot.colId)
                        .map((content) => (
                        <div 
                          key={content.id}
                          onClick={() => setSelectedEvent(content)}
                          className={`p-2 rounded-xl border border-outline-variant/10 bg-white hover:border-primary/20 hover:shadow-sm cursor-pointer transition-all flex items-center gap-2.5 group`}
                        >
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${content.color}`}>
                            <span className={`material-symbols-outlined text-[12px] ${content.iconColor}`}>{content.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10.5px] font-bold text-primary truncate leading-tight">{content.title}</p>
                            <p className="text-[8px] text-on-surface-variant uppercase tracking-widest font-semibold">{content.type}</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                        </div>
                      ))}

                      <button 
                        onClick={() => handleAddContentToSlot(activeMatrixSlot.day, activeMatrixSlot.colId, activeMatrixSlot.campaignId)}
                        className="w-full py-2 border-2 border-dashed border-outline-variant/20 rounded-xl text-[9px] font-bold text-outline-variant/60 hover:text-primary hover:border-primary/30 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">add</span> NUEVO ITEM
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* 3-Tab Nav */}
                  <div className="flex bg-surface-container-high/50 p-1 rounded-xl border border-outline-variant/10 mb-5 shrink-0">
                    {([['tareas','Tareas'],['plan','Plan'],['hitos','Suger.']] as const).map(([tab, label]) => (
                      <button
                        key={tab}
                        onClick={() => setRightPanelTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all relative ${
                          rightPanelTab === tab ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {label}
                        {tab === 'plan' && (() => {
                          const planCount = globalContents.filter(c => c.type === 'ESTRATÉGICO' && (currentProject ? c.projectId === currentProject.id : true)).length;
                          return planCount > 0 ? (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center">{planCount}</span>
                          ) : null;
                        })()}
                      </button>
                    ))}
                  </div>

                  {/* ---- TAREAS TAB ---- */}
                  {rightPanelTab === 'tareas' && (
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <div className="flex items-center justify-between mb-2 shrink-0">
                        <div>
                          <h3 className="text-lg font-extrabold tracking-tight font-headline">Actividades</h3>
                          <p className="text-xs text-on-surface-variant font-medium">Piezas y acciones en producción</p>
                        </div>
                        <button
                          onClick={() => setView('weekly')}
                          className="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors"
                          title="Ver en Calendario"
                        >
                          <span className="material-symbols-outlined text-sm">calendar_month</span>
                        </button>
                      </div>
                      
                      <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pb-4 mt-2">
                        {globalContents.filter(c => c.projectId === currentProject?.id).length === 0 ? (
                            <div className="text-center p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl">
                              <span className="material-symbols-outlined text-3xl text-outline-variant/40 mb-2 block">task</span>
                              <p className="text-xs text-on-surface-variant font-medium">Aún no hay actividades.<br/>Añade piezas desde la matriz para empezar.</p>
                            </div>
                        ) : (
                          globalContents
                            .filter(t => t.projectId === currentProject?.id)
                            .map(task => {
                              return (
                                <div 
                                  key={task.id} 
                                  onClick={() => setSelectedEvent(task)}
                                  className={`bg-white p-3 rounded-2xl border-l-[6px] border-y border-r border-outline-variant/10 shadow-sm hover:shadow-md transition-all group flex items-start gap-3 cursor-pointer ${task.borderColor || 'border-l-primary'}`}
                                >
                                  <div className="pt-0.5">
                                    <input 
                                      type="checkbox" 
                                      className="w-4 h-4 rounded appearance-none border-2 border-outline-variant/30 hover:border-primary checked:bg-primary checked:border-primary transition-all cursor-pointer relative checked:after:content-['✓'] checked:after:text-white checked:after:text-xs checked:after:absolute checked:after:left-[2px] checked:after:-top-[1px]"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteContent(task.id);
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${task.color || 'bg-surface-container-low'} ${task.iconColor || 'text-on-surface'}`}>
                                        {task.type}
                                      </span>
                                      <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                                        {task.type === 'ESTRATÉGICO' && task.day !== undefined ? (
                                          <>
                                            <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                                            {new Date(task.year || new Date().getFullYear(), task.month || new Date().getMonth(), task.day).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                                          </>
                                        ) : (
                                          task.time || 'Sin hora'
                                        )}
                                      </span>
                                    </div>
                                    <h4 className="text-[12px] font-bold text-on-surface leading-tight break-words">{task.title}</h4>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); deleteContent(task.id); }} className="w-6 h-6 rounded-full bg-error/10 text-error flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  )}

                  {/* ---- SUGERENCIAS TAB (TEMPEST) ---- */}
                  {rightPanelTab === 'hitos' && (() => {
                    const acceptedIds = new Set(globalContents.filter(c => c.sourceSuggestionId).map(c => c.sourceSuggestionId));
                    const upcoming = SUGGESTED_DATES.filter(s => new Date(s.date) >= new Date(new Date().setHours(0,0,0,0)));
                    return (
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="mb-4 shrink-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-2xl font-black tracking-tighter text-on-surface font-headline leading-none">TE<span className="inline-flex items-center justify-center border border-on-surface text-[9px] w-4 h-4 align-middle mx-0.5 font-bold">MP</span>EST</span>
                            <div className="flex flex-col">
                              <h3 className="text-xs font-black uppercase tracking-tight text-on-surface leading-none">Estrategia</h3>
                              <h3 className="text-xs font-black uppercase tracking-tight text-on-surface leading-none">Sugerida</h3>
                            </div>
                          </div>
                          <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">Próximos hitos — haz clic en + para añadir</p>
                        </div>
                        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-4">
                          {upcoming.map(s => {
                            const isAccepted = acceptedIds.has(s.id);
                            return isAccepted ? (
                              <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-surface-container/50 border border-outline-variant/10 opacity-60">
                                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">{s.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-bold text-on-surface-variant line-through truncate">{s.title}</p>
                                  <p className="text-[8px] text-primary font-black uppercase tracking-widest">✓ En Plan</p>
                                </div>
                                <span className="text-[9px] text-on-surface-variant">{new Date(s.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
                              </div>
                            ) : (
                              <div
                                key={s.id}
                                onClick={() => handleAddFromSuggestion(s)}
                                className="bg-[#131722] p-5 rounded-[24px] hover:scale-[1.02] transition-all cursor-pointer group shadow-xl shadow-black/20 border border-white/5"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                    s.type === 'Feriado' ? 'bg-[#FFD9D9] text-[#E54D4D]' : s.type === 'Marketing' ? 'bg-[#3D0A1D] text-[#FE2C55]' : 'bg-primary/20 text-primary'
                                  }`}>{s.type}</span>
                                  <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary group-hover:border-primary transition-all">
                                    <span className="material-symbols-outlined text-sm">add</span>
                                  </div>
                                </div>
                                <h4 className="text-sm font-extrabold text-[#E2E8F0] mb-2 leading-tight group-hover:text-primary transition-colors">{s.title}</h4>
                                <p className="text-[10px] text-[#94A3B8] leading-relaxed mb-4 font-medium line-clamp-2">{s.description}</p>
                                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                  <span className="material-symbols-outlined text-[16px] text-[#475569]">{s.icon}</span>
                                  <span className="text-[9px] font-black text-[#475569] uppercase tracking-widest">{new Date(s.date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ---- PLAN TAB ---- */}
                  {rightPanelTab === 'plan' && (() => {
                    const allPlan = globalContents.filter(c => c.type === 'ESTRATÉGICO');
                    const clientsInPlan = [...new Set(allPlan.map(c => c.projectId))];
                    const filtered = planClientFilter ? allPlan.filter(c => c.projectId === planClientFilter) : (currentProject ? allPlan.filter(c => c.projectId === currentProject.id) : allPlan);
                    
                    return (
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                          <div>
                            <h3 className="text-lg font-extrabold tracking-tight font-headline">Plan Aprobado</h3>
                            <p className="text-xs text-on-surface-variant font-medium">Hitos confirmados para producción</p>
                          </div>
                          <button
                            onClick={() => {
                              const newHito = { id: Date.now().toString(), projectId: currentProject?.id || '2', campaignId: 'base_2', day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear(), type: 'ESTRATÉGICO', title: 'Nuevo Hito...', icon: 'event', color: 'bg-primary/10', iconColor: 'text-primary', borderColor: 'border-primary', matrixSlot: { day: 'Lunes', colId: 'prod' } };
                              addContent(newHito).then(() => setSelectedEvent(newHito));
                            }}
                            className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>

                        {/* Client Filter Chips */}
                        {clientsInPlan.length > 1 && (
                          <div className="flex gap-1.5 flex-wrap mb-3 shrink-0">
                            <button onClick={() => setPlanClientFilter(null)} className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${ !planClientFilter ? 'bg-primary text-white border-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/30'}`}>Todos</button>
                            {clientsInPlan.map(projId => {
                              const proj = projects.find(p => p.id === projId);
                              if (!proj) return null;
                              return (
                                <button key={projId} onClick={() => setPlanClientFilter(planClientFilter === projId ? null : projId)}
                                  className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${ planClientFilter === projId ? 'text-white border-transparent' : 'border-outline-variant/30 text-on-surface-variant'}`}
                                  style={{ backgroundColor: planClientFilter === projId ? (proj as any).accent?.replace('bg-','') || '#6366f1' : undefined }}
                                >{proj.name}</button>
                              );
                            })}
                          </div>
                        )}

                        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pb-4">
                          {filtered.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl">
                              <span className="material-symbols-outlined text-3xl text-outline-variant/40 mb-2 block">event_available</span>
                              <p className="text-xs text-on-surface-variant font-medium">Aún no hay hitos en el plan.<br/>Añade desde Sugerencias con el botón +.</p>
                            </div>
                          )}
                          {filtered.sort((a,b) => (a.year||0)*10000+(a.month||0)*100+(a.day||0) - ((b.year||0)*10000+(b.month||0)*100+(b.day||0))).map(c => {
                            const proj = projects.find(p => p.id === c.projectId);
                            const dateStr = c.day !== undefined && c.month !== undefined
                              ? new Date(c.year || new Date().getFullYear(), c.month, c.day).toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' })
                              : '—';
                            return (
                              <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group relative border border-outline-variant/5">
                                <button onClick={() => deleteContent(c.id)} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-outline-variant hover:text-error transition-all">
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[14px] text-primary">{c.icon || 'calendar_month'}</span>
                                  </div>
                                  <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-bold text-on-surface leading-tight mb-1">{c.title}</p>
                                    <p className="text-[10px] text-on-surface-variant font-medium">{dateStr}</p>
                                  </div>
                                </div>
                                {proj && !currentProject && (
                                  <div className="mt-3 flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${(proj as any).accent || 'bg-primary'}`}></div>
                                    <span className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">{proj.name}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-auto pt-4 shrink-0">
                    <div className="p-4 rounded-xl bg-primary-container text-on-primary-container/80 relative overflow-hidden group">
                      <div className="relative z-10">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-2">Insights del Curador</h4>
                        <p className="text-[11px] leading-relaxed text-white/70 italic">"Restobar X ve un 40% más de interacción en videos de comida entre las 6PM y las 8PM."</p>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductionModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
        eventData={selectedEvent} 
      />
    </div>
  );
}
