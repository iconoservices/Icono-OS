"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { activeTasks, calendarEvents, projectCampaigns } from "@/data/mock";
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
  const { currentProject, hiddenCampaignIds, globalContents, setGlobalContents, allProjectCampaigns, setAllProjectCampaigns, addContent, updateContent, deleteContent, updateCampaign } = useProject();
  const [view, setView] = useState<"monthly" | "weekly" | "matrix" | "yearly">("matrix");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  // Editable Data States
  const [tasks, setTasks] = useState(activeTasks);
  const [activeMatrixSlot, setActiveMatrixSlot] = useState<{ campaignId: string, actionId: string, day: string, colId: string, text: string, time?: string, color: string } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  
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
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !currentProject) return;
    const newTask = {
      id: Date.now().toString(),
      projectId: currentProject.id,
      title: newTaskTitle,
      priority: "Media" as any,
      status: "Pendiente" as any,
      date: "Hoy"
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };
   const getPriorityColors = (priority: string) => {
    switch(priority) {
      case "Alta": return "border-error bg-error-container text-on-error-container";
      case "Media": return "border-primary-fixed bg-primary-fixed text-on-primary-fixed";
      case "Baja": return "border-secondary-container bg-secondary-container text-on-secondary-container";
      default: return "";
    }
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

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto no-scrollbar">
          
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-primary tracking-tight font-headline capitalize">{view === 'monthly' ? `${monthName} ${year}` : 'Estrategia de Contenido'}</h2>
              <p className="text-on-surface-variant/70 text-sm">Revisando distribución para <span className="font-bold text-primary">{currentProject?.name || "Sin Proyecto"}</span></p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center bg-surface-container-low rounded-lg p-1">
                <button 
                  onClick={() => setView('matrix')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'matrix' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Matriz
                </button>
                <button 
                  onClick={() => setView('weekly')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'weekly' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Semanal
                </button>
                <button 
                  onClick={() => setView('monthly')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'monthly' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Mensual
                </button>
                <button 
                  onClick={() => setView('yearly')}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'yearly' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Anual
                </button>
              </div>

              <button 
                onClick={handleGoToToday}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors"
              >
                Hoy
              </button>
              <div className="flex items-center bg-surface-container-low rounded-lg p-1">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-surface-container-lowest rounded-md transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-surface-container-lowest rounded-md transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="w-px h-8 bg-outline-variant/30 mx-1"></div>
              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={`p-2 rounded-lg transition-colors flex items-center justify-center ${isRightPanelOpen ? 'bg-primary-fixed text-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                title="Alternar Tareas"
              >
                <span className="material-symbols-outlined text-[20px]">{isRightPanelOpen ? 'right_panel_close' : 'right_panel_open'}</span>
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
                        <th key={col.id} className="py-4 px-4 border-b border-outline-variant/10 group cursor-pointer hover:bg-surface-container/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className={`text-[11px] font-black uppercase tracking-tighter ${col.color}`}>{col.title}</span>
                              <span className="block text-[9px] font-bold text-slate-400 normal-case tracking-normal">{col.subtitle}</span>
                            </div>
                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 text-slate-300 transition-all">more_vert</span>
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
                        <td className="py-6 px-6 align-top">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tighter block">{dayName}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Octubre</span>
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
                              <div className="flex flex-col gap-2 min-h-[44px]">
                                {activeStrategies.length > 0 ? (
                                  activeStrategies.map((item: any, i) => (
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
                                      className={`group/item relative p-3 rounded-xl border-l-[6px] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md
                                        ${col.isAction 
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400' 
                                          : `bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-white/5 ${col.color?.replace('text-', 'border-') || 'border-primary'}`}
                                      `}
                                    >
                                      {activeStrategies.length > 1 && (
                                        <div className="text-[8px] font-black uppercase tracking-tighter text-slate-400 mb-1 flex items-center gap-1">
                                          <div className={`w-1 h-1 rounded-full ${col.color?.replace('text-', 'bg-')}`}></div>
                                          {item.campaignName}
                                        </div>
                                      )}
                                      <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${col.color}`}>{item.strategy}</p>
                                      
                                      {item.time && (
                                        <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-slate-400">
                                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                                          {item.time}
                                        </div>
                                      )}
                                      
                                      <div className="absolute top-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-[14px] text-slate-300">edit</span>
                                      </div>
                                    </div>
                                  ))
                                ) : (
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
                                    className="w-full py-1.5 border border-dashed border-slate-100 dark:border-white/5 rounded-lg opacity-0 group-hover:opacity-100 hover:opacity-100 hover:border-primary/20 hover:bg-primary/[0.02] transition-all flex items-center justify-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-xs text-slate-300">add_task</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Añadir Acción</span>
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
                    const today = new Date();
                    const isToday = day === today.getDate() && 
                                   currentDate.getMonth() === today.getMonth() && 
                                   currentDate.getFullYear() === today.getFullYear();
                    
                    return (
                      <div key={`curr-${day}`} className={`bg-surface-container-lowest min-h-[140px] p-3 transition-colors hover:bg-surface-container-low ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
                        <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>{day}</span>
                        <div className="mt-2 space-y-2">
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
                
                {currentWeekDays.map(day => {
                  const events = globalContents.filter(e => 
                    e.day === day && 
                    e.projectId === currentProject?.id &&
                    !hiddenCampaignIds.includes(e.campaignId)
                  );
                  const isToday = day === 4;
                  
                  return (
                    <div key={`week-${day}`} className={`bg-surface-container-lowest min-h-[500px] p-4 transition-colors hover:bg-surface-container-low ${isToday ? 'border-2 border-primary-fixed bg-surface-container-low/20' : ''}`}>
                      <span className={`text-sm font-bold block mb-4 ${isToday ? 'text-primary' : 'text-primary'}`}>{day}</span>
                      <div className="space-y-3">
                        {events.map((event, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedEvent(event)}
                            className={`flex flex-col gap-1 p-3 rounded-xl ${event.color} border-l-4 ${event.borderColor} group cursor-pointer transition-all hover:-translate-y-1 hover:shadow-sm`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`material-symbols-outlined text-[16px] ${event.iconColor}`}>{event.icon}</span>
                              <span className="text-xs font-bold truncate">{event.title}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-on-surface-variant/70 uppercase tracking-wider">{event.type}</span>
                          </div>
                        ))}
                        
                        <div className="opacity-0 group-hover:opacity-100 border-2 border-dashed border-outline-variant/30 rounded-xl p-3 flex items-center justify-center text-outline-variant hover:text-primary hover:border-primary transition-all cursor-pointer">
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
                /* BUCKET GESTOR UI */
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-6 flex flex-col gap-4">
                    <div className="flex items-start gap-2">
                      <button 
                        onClick={() => setActiveMatrixSlot(null)}
                        className="mt-1 shrink-0 p-1 rounded hover:bg-outline-variant/10 text-on-surface-variant transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                      </button>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">
                          {activeMatrixSlot.day} • {activeMatrixSlot.colId}
                        </h3>
                        <input 
                          type="text"
                          value={activeMatrixSlot.text}
                          onChange={(e) => handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, { text: e.target.value })}
                          placeholder="Nombre de la acción estratégica..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-extrabold tracking-tight font-headline placeholder:text-outline-variant/40"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Time Input Component */}
                      <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white border border-outline-variant/10 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">Horario (Opcional)</span>
                          <span className="material-symbols-outlined text-sm text-slate-300">schedule</span>
                        </div>
                        <input 
                          type="text"
                          value={activeMatrixSlot.time || ""}
                          onChange={(e) => handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, { time: e.target.value })}
                          placeholder="Ej: 18:00 o Tarde"
                          className="w-full bg-transparent border-none focus:ring-0 p-0 py-1 text-sm font-bold text-primary placeholder:text-slate-300"
                        />
                      </div>

                      {/* Campaign Selection Component (Display only if multiple campaigns exist) */}
                      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-outline-variant/10 shadow-sm">
                        <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">Asignada a</span>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-xs text-primary">campaign</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">
                            {campaigns.find(c => c.id === activeMatrixSlot.campaignId)?.name || 'Estrategia Unificada'}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-1 pt-2">
                        <button 
                          onClick={() => handleDeleteAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span className="text-[10px] font-bold uppercase">Eliminar Acción</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-3 overflow-hidden mt-6">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Piezas de Producción</span>
                      <button 
                        onClick={() => handleAddContentToSlot(activeMatrixSlot.day, activeMatrixSlot.colId, activeMatrixSlot.campaignId)}
                        className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                      >
                         <span className="material-symbols-outlined text-sm">post_add</span>
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-4">
                      {globalContents
                        .filter(c => c.matrixSlot.day === activeMatrixSlot.day && c.matrixSlot.colId === activeMatrixSlot.colId)
                        .map((content) => (
                        <div 
                          key={content.id}
                          onClick={() => setSelectedEvent(content)}
                          className={`p-2.5 rounded-xl border border-outline-variant/10 bg-white hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all flex items-center gap-3 group`}
                        >
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${content.color}`}>
                            <span className={`material-symbols-outlined text-[14px] ${content.iconColor}`}>{content.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-primary truncate">{content.title}</p>
                            <p className="text-[9px] text-on-surface-variant uppercase tracking-widest font-semibold">{content.type}</p>
                          </div>
                        </div>
                      ))}

                      <button 
                        onClick={() => handleAddContentToSlot(activeMatrixSlot.day, activeMatrixSlot.colId, activeMatrixSlot.campaignId)}
                        className="w-full py-2.5 border-2 border-dashed border-outline-variant/20 rounded-xl text-[10px] font-bold text-outline-variant hover:text-primary hover:border-primary/40 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">add</span> NUEVO ITEM
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* DEFAULT TAREAS ACTIVAS UI */
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-extrabold tracking-tight font-headline">Tareas Activas</h3>
                      <button 
                        onClick={() => setIsAddingTask(!isAddingTask)}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">{isAddingTask ? 'close' : 'add'}</span>
                      </button>
                    </div>
                    
                    {isAddingTask && (
                      <div className="mb-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-primary/20">
                          <input 
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            placeholder="¿Qué falta por hacer?"
                            className="w-full text-xs font-bold border-none focus:ring-0 p-0 mb-3"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAddingTask(false)} className="px-3 py-1 text-[10px] font-bold text-outline-variant uppercase">Cancelar</button>
                            <button onClick={handleAddTask} className="px-3 py-1 text-[10px] font-bold bg-primary text-white rounded-lg uppercase tracking-wider">Guardar</button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-on-surface-variant font-medium">Hitos estratégicos para Octubre</p>
                  </div>
                  
                  <div className="space-y-4">
                    {tasks.filter(t => t.projectId === currentProject?.id).length === 0 && (
                      <div className="text-center p-6 border-2 border-dashed border-outline-variant/30 rounded-xl">
                        <p className="text-xs text-on-surface-variant font-medium">No hay tareas para este proyecto.</p>
                      </div>
                    )}
                    {tasks.filter(t => t.projectId === currentProject?.id).map(task => {
                      const isCompleted = task.status === "Completada";
                      const priorityStyle = getPriorityColors(task.priority);
                      const borderColor = isCompleted ? "border-transparent" : priorityStyle.split(" ")[0];
                      const badgeBg = isCompleted ? "bg-outline-variant/30 text-on-surface-variant" : priorityStyle.split(" ").slice(1).join(" ");
                      
                      return (
                        <div key={task.id} className={`${isCompleted ? 'bg-surface-container/50 opacity-60' : 'bg-surface-container-lowest shadow-sm hover:shadow-md'} p-4 rounded-xl border-l-4 ${borderColor} transition-all relative group`}>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-outline-variant hover:text-error transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                          <div className="flex items-start justify-between mb-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isCompleted} 
                                onChange={() => {
                                  setTasks(tasks.map(t => t.id === task.id ? { ...t, status: isCompleted ? 'Pendiente' : 'Completada' } : t));
                                }}
                                className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary transition-all" 
                              />
                              <span className={`text-sm font-bold leading-tight ${isCompleted ? 'line-through' : ''}`}>{task.title}</span>
                            </label>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${badgeBg}`}>
                              {isCompleted ? "Completada" : `Prioridad ${task.priority}`}
                            </span>
                            {!isCompleted && (
                              <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">event</span>
                                {task.date}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-auto pt-8">
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
