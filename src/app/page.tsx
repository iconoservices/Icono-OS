"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calendarEvents, projectCampaigns, SUGGESTED_DATES } from "@/data/mock";
import { PROJECT_OKRS, getOKRProgress, getKRProgress, statusConfig } from "@/data/kpis";
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

function DebouncedInput({ 
  value, 
  onChange, 
  className, 
  placeholder,
  autoFocus,
  disabled
}: { 
  value: string; 
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const [localVal, setLocalVal] = useState(value);
  const onChangeRef = useRef(onChange);
  const isDirty = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Only sync from external if user is NOT actively editing
  useEffect(() => {
    if (!isDirty.current) {
      setLocalVal(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newVal = e.target.value;
    isDirty.current = true;
    setLocalVal(newVal);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      isDirty.current = false;
      onChangeRef.current(newVal);
    }, 600);
  };

  return (
    <input
      type="text"
      value={localVal}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
    />
  );
}

function LibraryDropdown({
  activeLibraryId,
  projectStrategyLibrary,
  currentText,
  onSelect,
  onSave,
}: {
  activeLibraryId?: string;
  projectStrategyLibrary: any[];
  currentText: string;
  onSelect: (item: any) => void;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const activeItem = projectStrategyLibrary.find(i => i.id === activeLibraryId);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        id="strategy-dropdown-trigger"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
          activeItem
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-white border-outline-variant/10 text-slate-400 hover:border-primary/20 hover:text-primary'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[13px]">style</span>
          <span>{activeItem ? activeItem.name : 'Asignar pilar de contenido...'}</span>
        </div>
        <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 bg-white border border-outline-variant/10 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Save current */}
          <button
            onClick={() => { onSave(); setOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 border-b border-outline-variant/10 hover:bg-primary/5 text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-[14px]">bookmark_add</span>
            <span className="text-[10px] font-bold">Guardar "{currentText.slice(0, 20)}{currentText.length > 20 ? '…' : ''}" como pilar</span>
          </button>

          {/* Library items */}
          <div className="max-h-48 overflow-y-auto">
            {projectStrategyLibrary.length === 0 ? (
              <p className="px-3 py-3 text-[10px] text-outline-variant italic text-center">
                No hay pilares en este proyecto aún.
              </p>
            ) : (
              projectStrategyLibrary.map(item => {
                const isActive = item.id === activeLibraryId;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left hover:bg-surface-container-low ${isActive ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-primary' : 'bg-outline-variant/30'}`} />
                    <span className={`text-[11px] font-bold flex-1 ${isActive ? 'text-primary' : 'text-on-surface'}`}>{item.name}</span>
                    {isActive && <span className="material-symbols-outlined text-[14px] text-primary">check</span>}
                  </button>
                );
              })
            )}
          </div>

          {/* Desvincular */}
          {activeLibraryId && (
            <button
              onClick={() => { onSelect({ id: undefined, name: currentText }); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 border-t border-outline-variant/10 hover:bg-error/5 text-error/70 transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">link_off</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Desvincular de librería</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PilaresTab({ projectStrategyLibrary, projectId, onAdd, onDelete, onUpdate, campaigns }: {
  projectStrategyLibrary: any[];
  projectId: string | undefined;
  onAdd: (template: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: any) => Promise<void>;
  campaigns: any[];
}) {
  const [newName, setNewName] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedColor, setSelectedColor] = useState("text-primary");
  const [isAdding, setIsAdding] = useState(false);

  const dayNames = ["L", "M", "M", "J", "V", "S", "D"];
  const fullDayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  
  const colors = [
    { name: 'Indigo', class: 'text-indigo-500', bg: 'bg-indigo-500' },
    { name: 'Emerald', class: 'text-emerald-500', bg: 'bg-emerald-500' },
    { name: 'Amber', class: 'text-amber-500', bg: 'bg-amber-500' },
    { name: 'Rose', class: 'text-rose-500', bg: 'bg-rose-500' },
    { name: 'Purple', class: 'text-purple-500', bg: 'bg-purple-500' },
    { name: 'Sky', class: 'text-sky-500', bg: 'bg-sky-500' },
    { name: 'Orange', class: 'text-orange-500', bg: 'bg-orange-500' },
  ];

  const getNumericDay = (matrixDay: string) => {
    const map: Record<string, number> = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
    return map[matrixDay] || 1;
  };

  const getDetectedDays = (itemId: string) => {
    const daysFound = new Set<number>();
    campaigns.forEach(camp => {
      camp.data.forEach((d: any) => {
        Object.values(d.entries).forEach(actions => {
          if (Array.isArray(actions)) {
            actions.forEach((a: any) => {
              if (a.libraryId === itemId) {
                daysFound.add(getNumericDay(d.day));
              }
            });
          }
        });
      });
    });
    return Array.from(daysFound).sort();
  };

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setIsAdding(true);
    const id = `template_${Date.now()}`;
    await onAdd({ 
      id, 
      name: trimmed, 
      projectId,
      activeDays: selectedDays,
      color: selectedColor
    });
    setNewName("");
    setSelectedDays([]);
    setSelectedColor("text-primary");
    setIsAdding(false);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort()
    );
  };

  const toggleItemDay = async (item: any, day: number) => {
    const currentDays = item.activeDays || [];
    const newDays = currentDays.includes(day) 
      ? currentDays.filter((d: number) => d !== day) 
      : [...currentDays, day].sort();
    await onUpdate(item.id, { activeDays: newDays });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight font-headline">Pilares</h3>
          <p className="text-xs text-on-surface-variant font-medium">Estrategias de este proyecto</p>
        </div>
        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
          {projectStrategyLibrary.length} guardados
        </span>
      </div>

      {/* Add new */}
      <div className="bg-white border border-outline-variant/10 rounded-2xl p-4 mb-4 shrink-0 shadow-sm relative group/addpilar">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <button 
              onClick={() => {
                const el = document.getElementById('new-pilar-colors');
                if (el) el.classList.toggle('hidden');
              }}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${selectedColor.replace('text-', 'bg-')}/10`}
            >
              <span className={`material-symbols-outlined ${selectedColor}`}>palette</span>
            </button>
            <div id="new-pilar-colors" className="hidden absolute left-0 top-full mt-2 z-30 bg-white border border-outline-variant/10 rounded-2xl p-2 shadow-2xl flex flex-wrap gap-2 w-32 animate-in fade-in slide-in-from-top-2">
              {colors.map(c => (
                <button
                  key={c.class}
                  onClick={() => {
                    setSelectedColor(c.class);
                    document.getElementById('new-pilar-colors')?.classList.add('hidden');
                  }}
                  className={`w-6 h-6 rounded-full transition-all ${c.bg} hover:scale-110 shadow-sm`}
                />
              ))}
            </div>
          </div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Nombre del pilar..."
            className="flex-1 bg-transparent border-b-2 border-slate-100 px-1 py-2 text-[13px] font-bold text-primary placeholder:text-slate-300 focus:outline-none focus:border-primary transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding || !newName.trim()}
            className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-primary/20 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">{isAdding ? 'hourglass_empty' : 'add'}</span>
          </button>
        </div>
        
        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Frecuencia semanal:</span>
          <div className="flex gap-1">
            {dayNames.map((name, idx) => {
              const dayNum = idx + 1;
              const isActive = selectedDays.includes(dayNum);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(dayNum)}
                  className={`w-6 h-6 rounded-lg text-[9px] font-black transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Library list */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-4">
        {projectStrategyLibrary.length === 0 && (
          <div className="text-center p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl">
            <span className="material-symbols-outlined text-3xl text-outline-variant/40 mb-2 block">style</span>
            <p className="text-xs text-on-surface-variant font-medium">No hay pilares en este proyecto.<br/>Escribe uno arriba para empezar.</p>
          </div>
        )}
        {projectStrategyLibrary.map((item) => {
          const detectedDays = getDetectedDays(item.id);
          const manualDays = item.activeDays || [];
          const itemColor = colors.find(c => c.class === item.color) || colors[0];
          const dropdownId = `color-dropdown-${item.id}`;
          
          return (
            <div
              key={item.id}
              className="group flex flex-col gap-3 bg-white p-4 rounded-2xl border border-outline-variant/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Vertical Color Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.color?.replace('text-', 'bg-') || 'bg-primary'}`} />
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => {
                      const el = document.getElementById(dropdownId);
                      if (el) el.classList.toggle('hidden');
                    }}
                    className={`w-8 h-8 rounded-xl ${item.color?.replace('text-', 'bg-') || 'bg-primary'}/10 flex items-center justify-center shrink-0 hover:scale-105 transition-transform`}
                  >
                    <span className={`material-symbols-outlined text-[14px] ${item.color || 'text-primary'}`}>palette</span>
                  </button>
                  <div id={dropdownId} className="hidden absolute left-0 top-full mt-2 z-30 bg-white border border-outline-variant/10 rounded-2xl p-2 shadow-2xl flex flex-wrap gap-2 w-32 animate-in fade-in slide-in-from-top-2">
                    {colors.map(c => (
                      <button
                        key={c.class}
                        onClick={() => {
                          onUpdate(item.id, { color: c.class });
                          document.getElementById(dropdownId)?.classList.add('hidden');
                        }}
                        className={`w-6 h-6 rounded-full transition-all ${c.bg} hover:scale-110 shadow-sm`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-extrabold text-on-surface truncate tracking-tight">{item.name}</p>
                  <p className="text-[9px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">Estrategia Activa</p>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-outline-variant hover:text-error hover:bg-error/10 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex gap-1.5">
                  {dayNames.map((name, idx) => {
                    const dayNum = idx + 1;
                    const isManual = manualDays.includes(dayNum);
                    const isDetected = detectedDays.includes(dayNum);
                    const isActive = isManual || isDetected;

                    return (
                      <button
                        key={idx}
                        onClick={() => toggleItemDay(item, dayNum)}
                        className={`w-6 h-6 rounded-lg text-[9px] font-black transition-all relative ${
                          isActive 
                            ? `${item.color?.replace('text-', 'bg-') || 'bg-primary'} text-white shadow-sm ring-2 ring-primary/20` 
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={`${fullDayNames[idx]} ${isDetected ? '(Detectado en matriz)' : ''}`}
                      >
                        {name}
                        {isDetected && !isManual && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {(manualDays.length > 0 || detectedDays.length > 0) && (
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${item.color || 'text-primary'}`}>
                    {Array.from(new Set([...manualDays, ...detectedDays])).length} días/sem
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { 
    projects,
    currentProject, 
    hiddenCampaignIds, 
    globalContents, 
    setGlobalContents, 
    allProjectCampaigns, 
    setAllProjectCampaigns, 
    addCampaign,
    addContent, 
    updateContent, 
    deleteContent, 
    updateCampaign,
    strategyLibrary,
    addStrategyTemplate,
    updateStrategyTemplate,
    deleteStrategyTemplate
  } = useProject();
  const [view, setView] = useState<"monthly" | "weekly" | "matrix" | "yearly">("matrix");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  
  // Editable Data States
  const [activeMatrixSlot, setActiveMatrixSlot] = useState<{ 
    campaignId: string, 
    actionId: string, 
    day: string, 
    colId: string, 
    text: string, 
    time?: string, 
    color: string,
    libraryId?: string 
  } | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<"tareas" | "hitos" | "plan" | "metas" | "pilares">("tareas");
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

  const handleAddActionToSlot = async (dayName: string, colId: string, campaignId?: string) => {
    let finalCampaignId = campaignId;

    if (!finalCampaignId) {
      if (!currentProject) return;
      finalCampaignId = `camp_base_${currentProject.id}_${Date.now()}`;
      
      const newAction = {
        id: Math.random().toString(36).substr(2, 9),
        text: "Nueva Acción...",
        time: "",
        campaignId: finalCampaignId
      };

      const newCampaign = {
        id: finalCampaignId,
        projectId: currentProject.id,
        name: "Estrategia Base",
        isBase: true,
        color: "text-primary",
        data: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => ({
          day, 
          entries: day === dayName ? { [colId]: [newAction] } : {}
        }))
      };
      
      await addCampaign(newCampaign);
      
      setActiveMatrixSlot({
        campaignId: finalCampaignId,
        actionId: newAction.id,
        day: dayName,
        colId: colId,
        text: newAction.text,
        time: newAction.time,
        color: initialMatrixColumns.find(c => c.id === colId)?.color || 'text-primary'
      });
      setIsRightPanelOpen(true);
      return;
    }

    const actionId = Math.random().toString(36).substr(2, 9);
    const newAction = {
      id: actionId,
      text: "Nueva Acción...",
      time: "",
      campaignId: finalCampaignId
    };

    const campaign = campaigns.find(c => c.id === finalCampaignId);
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
  // Filter strategy library to current project only
  const projectStrategyLibrary = strategyLibrary.filter(t => t.projectId === currentProject?.id);

  const handleUpdateAction = async (campaignId: string, actionId: string, day: string, colId: string, updates: { text?: string, time?: string, libraryId?: string }) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // If this is a linked action, update the master template too
    if (updates.text && (updates.libraryId || (activeMatrixSlot?.actionId === actionId && activeMatrixSlot?.libraryId))) {
      const libId = updates.libraryId || activeMatrixSlot?.libraryId;
      if (libId) {
        await updateStrategyTemplate(libId, { name: updates.text });
      }
    }

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
                                  return actions.map((action: any) => {
                                    const libItem = action.libraryId ? projectStrategyLibrary.find(l => l.id === action.libraryId) : null;
                                    return {
                                      actionId: action.id,
                                      campaignId: camp.id,
                                      campaignName: camp.name,
                                      strategy: libItem ? libItem.name : action.text,
                                      time: action.time,
                                      color: libItem?.color || camp.color || col.color,
                                      libraryId: action.libraryId
                                    };
                                  });
                                });

                          return (
                            <td key={`${dayName}-${col.id}`} className="p-4 align-top relative group/cell">
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
                                                  color: item.color,
                                                  libraryId: item.libraryId
                                                }); 
                                                setIsRightPanelOpen(true); 
                                              }}
                                              className="group/item relative p-2.5 pl-4 rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md bg-white dark:bg-slate-900 border border-outline-variant/10 overflow-hidden"
                                            >
                                              {/* Single Color Strip - Channel Only */}
                                              <div className="absolute left-0 top-0 bottom-0 w-[4px]">
                                                <div className={`h-full w-full ${col.bg || 'bg-primary'}`} />
                                              </div>

                                              <p className={`text-[11px] font-bold leading-tight line-clamp-2 ${item.color || col.color}`}>{item.strategy}</p>
                                              
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
                                        handleAddActionToSlot(dayName, col.id, baseCamp?.id);
                                      }}
                                      className="w-full h-full min-h-[44px] rounded-xl border border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 hover:border-primary/40 hover:bg-primary/[0.03] transition-all cursor-pointer group/add"
                                    >
                                      <span className="material-symbols-outlined text-sm text-slate-300 group-hover/add:text-primary transition-colors">add</span>
                                    </div>
                                  )}
                              </div>
                              
                              {activeStrategies.length > 0 && (
                                <button 
                                  onClick={() => handleAddActionToSlot(dayName, col.id, activeStrategies[0].campaignId)}
                                  className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-primary text-white opacity-0 group-hover/cell:opacity-100 hover:scale-110 transition-all flex items-center justify-center shadow-lg z-10 border-2 border-white"
                                >
                                  <span className="material-symbols-outlined text-[14px]">add</span>
                                </button>
                              )}
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
            /* YEARLY VIEW — OKR QUARTERLY STRATEGY */
            <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
              {/* Header strip */}
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-base font-extrabold text-primary">Plan Anual {year}</h3>
                  <p className="text-xs text-outline font-medium mt-0.5">Objetivos por trimestre · {currentProject?.name || "Todos los proyectos"}</p>
                </div>
                <a href="/performance" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/20 text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all">
                  <span className="material-symbols-outlined text-sm">monitoring</span>
                  Ver detalle completo
                </a>
              </div>

              {/* 4 quarters */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { q: "Q1", label: "Ene — Mar", months: ["Enero","Febrero","Marzo"],       monthIdxs: [0,1,2]   },
                  { q: "Q2", label: "Abr — Jun", months: ["Abril","Mayo","Junio"],           monthIdxs: [3,4,5]   },
                  { q: "Q3", label: "Jul — Sep", months: ["Julio","Agosto","Septiembre"],    monthIdxs: [6,7,8]   },
                  { q: "Q4", label: "Oct — Dic", months: ["Octubre","Noviembre","Diciembre"],monthIdxs: [9,10,11] },
                ].map(({ q, label, months, monthIdxs }) => {
                  const pid = currentProject?.id || "2";
                  // Find OKR for this quarter
                  const quarterLabel = `${q} ${year}`;
                  const okr = (PROJECT_OKRS[pid] || []).find(o => o.quarter === quarterLabel);
                  const progress = okr ? getOKRProgress(okr) : null;
                  const sc = okr ? statusConfig(okr.status) : null;
                  const isCurrentQ = (() => {
                    const m = new Date().getMonth();
                    if (q === "Q1") return m <= 2;
                    if (q === "Q2") return m >= 3 && m <= 5;
                    if (q === "Q3") return m >= 6 && m <= 8;
                    return m >= 9;
                  })();

                  return (
                    <div key={q} className={`bg-surface-container-lowest rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 ${isCurrentQ ? "border-primary/20 shadow-primary/5" : "border-outline-variant/10"}`}>
                      {/* Quarter header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isCurrentQ ? "bg-primary text-white" : "bg-surface-container-low text-outline"}`}>{q}</span>
                            {isCurrentQ && <span className="text-[8px] font-black text-primary uppercase tracking-widest">Actual</span>}
                          </div>
                          <p className="text-[10px] font-bold text-outline">{label}</p>
                        </div>
                        {progress !== null && (
                          <span className="text-xl font-black text-primary">{progress}%</span>
                        )}
                      </div>

                      {/* OKR block (if exists) */}
                      {okr && sc ? (
                        <div className="bg-surface-container-low/60 rounded-xl p-3 space-y-2">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            <span className={`text-[8px] font-black uppercase tracking-wider ${sc.text}`}>{sc.label}</span>
                          </div>
                          <p className="text-[10px] font-bold text-primary leading-snug line-clamp-3">{okr.objective}</p>
                          {/* KR progress bars */}
                          <div className="space-y-1.5 pt-1">
                            {okr.keyResults.map(kr => {
                              const pct = getKRProgress(kr);
                              return (
                                <div key={kr.id}>
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[8px] font-medium text-on-surface-variant truncate pr-1">{kr.metric}</span>
                                    <span className="text-[8px] font-black text-primary shrink-0">{pct}%</span>
                                  </div>
                                  <div className="h-1 bg-outline-variant/10 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${pct}%` }}
                                      transition={{ duration: 0.7, ease: "easeOut" }}
                                      className={`h-full rounded-full ${pct >= 100 ? "bg-emerald-500" : okr.status === "at-risk" ? "bg-red-400" : "bg-primary"}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Overall bar */}
                          <div className="h-1.5 w-full bg-outline-variant/10 rounded-full overflow-hidden mt-1">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.9, ease: "easeOut" }}
                              className={`h-full rounded-full ${okr.status === "achieved" ? "bg-primary" : okr.status === "on-track" ? "bg-emerald-500" : "bg-red-400"}`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-4 border-2 border-dashed border-outline-variant/20 rounded-xl text-center">
                          <span className="material-symbols-outlined text-xl text-outline-variant/30 mb-1">track_changes</span>
                          <p className="text-[9px] font-bold text-outline/50">Sin OKR definido</p>
                        </div>
                      )}

                      {/* Campaign activity intensity per month */}
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-outline uppercase tracking-widest">Actividad de Campañas</p>
                        {months.map((month, i) => {
                          const mIdx = monthIdxs[i];
                          return (
                            <div key={month} className="flex items-center gap-2">
                              <span className="text-[8px] font-bold text-outline w-8 shrink-0">{month.slice(0,3)}</span>
                              <div className="flex-1 h-1.5 bg-outline-variant/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: mIdx < new Date().getMonth() ? "100%" : mIdx === new Date().getMonth() ? "60%" : "0%" }}
                                  transition={{ duration: 0.6, delay: i * 0.1 }}
                                  className="h-full bg-primary/60 rounded-full"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
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
                                    color: action.color,
                                    libraryId: action.libraryId
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
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${activeMatrixSlot.color?.replace('text-', 'bg-') || 'bg-primary'}`} />
                        <h3 className="text-[9px] font-bold text-outline-variant uppercase tracking-widest">
                          {activeMatrixSlot.day} • {activeMatrixSlot.colId}
                        </h3>
                      </div>
                      
                      {!activeMatrixSlot.libraryId && activeMatrixSlot.text !== "Nueva Acción..." && (
                        <div className="relative group/input mb-2">
                          <DebouncedInput 
                            value={activeMatrixSlot.text}
                            onChange={(val) => handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, { text: val })}
                            placeholder="Acción estratégica..."
                            className={`w-full bg-transparent border-none focus:ring-0 p-0 text-base font-extrabold tracking-tight font-headline placeholder:text-outline-variant/30 ${activeMatrixSlot.color || 'text-primary'}`}
                            autoFocus
                          />
                        </div>
                      )}
                      
                      {activeMatrixSlot.libraryId ? (
                        <div className="flex items-center gap-1.5 mb-3 px-1">
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full animate-pulse">
                            <span className="material-symbols-outlined text-[10px] text-primary">sync</span>
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">Vínculo Maestro Activo</span>
                          </div>
                        </div>
                      ) : activeMatrixSlot.text === "Nueva Acción..." ? (
                        <div className="flex flex-col gap-3 mb-4">
                          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                              Recomendación Estratégica
                            </p>
                            
                            <LibraryDropdown
                              activeLibraryId={activeMatrixSlot.libraryId}
                              projectStrategyLibrary={projectStrategyLibrary}
                              currentText={activeMatrixSlot.text}
                              onSelect={(item) => {
                                const updates = { 
                                  text: item.name || activeMatrixSlot.text, 
                                  libraryId: item.id,
                                  color: item.color || activeMatrixSlot.color
                                };
                                handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, updates);
                                setActiveMatrixSlot({ ...activeMatrixSlot, ...updates });
                              }}
                              onSave={() => {
                                const newId = `template_${Date.now()}`;
                                addStrategyTemplate({ id: newId, name: activeMatrixSlot.text, projectId: currentProject?.id, color: activeMatrixSlot.color });
                                const updates = { libraryId: newId };
                                handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, updates);
                                setActiveMatrixSlot({ ...activeMatrixSlot, ...updates });
                              }}
                            />
                            
                            <button 
                              onClick={() => {
                                const updates = { text: "" };
                                handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, updates);
                                setActiveMatrixSlot({ ...activeMatrixSlot, ...updates });
                              }}
                              className="w-full mt-3 py-2 text-[9px] font-black text-slate-400 hover:text-primary uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border border-dashed border-slate-200 rounded-xl hover:border-primary/30 hover:bg-white"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit_note</span>
                              O escribir acción manual
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <LibraryDropdown
                            activeLibraryId={activeMatrixSlot.libraryId}
                            projectStrategyLibrary={projectStrategyLibrary}
                            currentText={activeMatrixSlot.text}
                            onSelect={(item) => {
                              const updates = { 
                                text: item.name || activeMatrixSlot.text, 
                                libraryId: item.id,
                                color: item.color || activeMatrixSlot.color
                              };
                              handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, updates);
                              setActiveMatrixSlot({ ...activeMatrixSlot, ...updates });
                            }}
                            onSave={() => {
                              const newId = `template_${Date.now()}`;
                              addStrategyTemplate({ id: newId, name: activeMatrixSlot.text, projectId: currentProject?.id, color: activeMatrixSlot.color });
                              const updates = { libraryId: newId };
                              handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, updates);
                              setActiveMatrixSlot({ ...activeMatrixSlot, ...updates });
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Time Input Component - COMPACT */}
                      <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white border border-outline-variant/5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-outline uppercase tracking-widest">Horario</span>
                          <span className="material-symbols-outlined text-[12px] text-slate-300">schedule</span>
                        </div>
                        <DebouncedInput 
                          value={activeMatrixSlot.time || ""}
                          onChange={(val) => handleUpdateAction(activeMatrixSlot.campaignId, activeMatrixSlot.actionId, activeMatrixSlot.day, activeMatrixSlot.colId, { time: val })}
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
                        .filter(c => c.matrixSlot.day === activeMatrixSlot.day && c.matrixSlot.colId === activeMatrixSlot.colId && c.type !== 'ESTRATÉGICO')
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
                  {/* Tab Nav */}
                  <div className="flex bg-surface-container-high/50 p-1 rounded-xl border border-outline-variant/10 mb-5 shrink-0 gap-0.5">
                    {([['tareas','Tareas'],['plan','Plan'],['hitos','Suger.'],['pilares','Pilares'],['metas','Metas']] as const).map(([tab, label]) => (
                      <button
                        key={tab}
                        onClick={() => setRightPanelTab(tab)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all relative ${
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
                        {tab === 'pilares' && projectStrategyLibrary.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-black flex items-center justify-center">{projectStrategyLibrary.length}</span>
                        )}
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
                            .sort((a, b) => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              
                              const getScore = (task: any) => {
                                const hasDate = task.day !== undefined && task.month !== undefined;
                                if (!hasDate) return 1; // Producción normal al medio
                                
                                const taskDate = new Date(task.year || today.getFullYear(), task.month, task.day);
                                const daysAway = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                                
                                if (daysAway < 0) return 3; // Pasados al final
                                if (daysAway <= 7) return 0; // Próximos (<=7 días) arriba de todo
                                return 2; // Futuros (>7 días) abajo de producción
                              };

                              const scoreA = getScore(a);
                              const scoreB = getScore(b);
                              
                              if (scoreA !== scoreB) return scoreA - scoreB;
                              
                              if (scoreA === 0 || scoreA === 2 || scoreA === 3) {
                                const dateA = (a.year || today.getFullYear())*10000 + a.month!*100 + a.day!;
                                const dateB = (b.year || today.getFullYear())*10000 + b.month!*100 + b.day!;
                                return dateA - dateB;
                              }
                              return 0;
                            })
                            .map(task => {
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const hasDate = task.day !== undefined && task.month !== undefined;
                              let daysAway: number | null = null;
                              if (hasDate) {
                                const taskDate = new Date(task.year || today.getFullYear(), task.month!, task.day!);
                                daysAway = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                              }

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
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${task.color || 'bg-surface-container-low'} ${task.iconColor || 'text-on-surface'}`}>
                                          {task.type}
                                        </span>
                                        {daysAway !== null && daysAway >= 0 && daysAway <= 7 && (
                                          <span className="px-1.5 py-0.5 rounded bg-error/10 text-error text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5 animate-pulse">
                                            <span className="material-symbols-outlined text-[10px]">timer</span>
                                            {daysAway === 0 ? 'Hoy' : daysAway === 1 ? 'Mañana' : `En ${daysAway} días`}
                                          </span>
                                        )}
                                      </div>
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
                    const acceptedIds = new Set(globalContents.filter(c => c.sourceSuggestionId && c.projectId === currentProject?.id).map(c => c.sourceSuggestionId));
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

                  {/* ---- METAS TAB (OKRs compactos) ---- */}
                  {rightPanelTab === 'metas' && (() => {
                    const pid = currentProject?.id || '2';
                    const okrs = PROJECT_OKRS[pid] || [];
                    return (
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                          <div>
                            <h3 className="text-lg font-extrabold tracking-tight font-headline">Metas</h3>
                            <p className="text-xs text-on-surface-variant font-medium">OKRs del proyecto activo</p>
                          </div>
                          <a href="/performance" className="p-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors" title="Ver detalle completo">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                          </a>
                        </div>
                        <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar pb-4">
                          {okrs.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl">
                              <span className="material-symbols-outlined text-3xl text-outline-variant/40 mb-2 block">track_changes</span>
                              <p className="text-xs text-on-surface-variant">Sin OKRs registrados aún.</p>
                            </div>
                          )}
                          {okrs.map(okr => {
                            const progress = getOKRProgress(okr);
                            const sc = statusConfig(okr.status);
                            return (
                              <div key={okr.id} className="bg-white rounded-2xl p-4 border border-outline-variant/10 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${sc.bg} ${sc.text} flex items-center gap-1`}>
                                    <span className={`w-1 h-1 rounded-full ${sc.dot}`} />{sc.label}
                                  </span>
                                  <span className="text-[9px] font-bold text-outline">{okr.quarter}</span>
                                  <span className="ml-auto text-xs font-black text-primary">{progress}%</span>
                                </div>
                                <p className="text-[11px] font-bold text-primary leading-snug mb-3 line-clamp-2">{okr.objective}</p>
                                {/* Overall bar */}
                                <div className="h-1.5 w-full bg-outline-variant/10 rounded-full overflow-hidden mb-3">
                                  <div
                                    className={`h-full rounded-full transition-all ${okr.status === 'achieved' ? 'bg-primary' : okr.status === 'on-track' ? 'bg-emerald-500' : 'bg-red-400'}`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                {/* Key Results compact */}
                                <div className="space-y-1.5">
                                  {okr.keyResults.map(kr => {
                                    const pct = getKRProgress(kr);
                                    return (
                                      <div key={kr.id} className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full shrink-0 flex items-center justify-center ${pct >= 100 ? 'bg-emerald-100' : 'bg-outline-variant/10'}`}>
                                          {pct >= 100 && <span className="material-symbols-outlined text-[8px] text-emerald-600">check</span>}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <div className="text-[9px] font-medium text-on-surface-variant truncate">{kr.metric}</div>
                                          <div className="h-1 bg-outline-variant/10 rounded-full overflow-hidden mt-0.5">
                                            <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                                          </div>
                                        </div>
                                        <span className="text-[9px] font-black text-primary shrink-0">{pct}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ---- PILARES TAB ---- */}
                  {rightPanelTab === 'pilares' && (
                    <PilaresTab
                      projectStrategyLibrary={projectStrategyLibrary}
                      projectId={currentProject?.id}
                      onAdd={addStrategyTemplate}
                      onDelete={deleteStrategyTemplate}
                      onUpdate={updateStrategyTemplate}
                      campaigns={campaigns}
                    />
                  )}

                  {rightPanelTab !== 'pilares' && (
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
                  )}
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
