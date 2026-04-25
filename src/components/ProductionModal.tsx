"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";

interface Inspiration {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl: string;
}

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: any;
}

// Sub-component for each inspiration card to handle its own auto-thumbnail logic
function InspirationCard({ 
  inspiration, 
  onUpdate, 
  onRemove 
}: { 
  inspiration: Inspiration; 
  onUpdate: (data: Partial<Inspiration>) => void;
  onRemove: () => void;
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [lastFetchedUrl, setLastFetchedUrl] = useState("");

  const fetchThumbnail = async (url: string) => {
    setIsFetching(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/proxy/oembed?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        setLastFetchedUrl(url);
        if (data.thumbnail_url) {
          onUpdate({ 
            imageUrl: data.thumbnail_url,
            description: inspiration.description || data.title || ""
          });
        }
      } else {
        setFetchError(true);
      }
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
      setFetchError(true);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const url = inspiration.url?.trim();
    if (!url || !url.startsWith("http")) return;
    if (url === lastFetchedUrl) return;

    const isSupported = url.includes("tiktok.com") || url.includes("youtube.com") || url.includes("youtu.be");
    if (!isSupported) return;

    const timer = setTimeout(() => fetchThumbnail(url), 1000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspiration.url, lastFetchedUrl]);

  const hasImage = !!(inspiration.imageUrl && inspiration.imageUrl.length > 0);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/5 rounded-xl p-3 flex flex-col gap-3 focus-within:border-primary/20 transition-all relative group/card">
      <button 
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-outline-variant/20 rounded-full flex items-center justify-center text-outline-variant hover:text-error hover:border-error/20 shadow-sm opacity-0 group-hover/card:opacity-100 transition-opacity z-30"
      >
        <span className="material-symbols-outlined text-[12px]">close</span>
      </button>

      <div className="flex gap-3">
        <div className="w-16 h-24 bg-slate-900 rounded-lg shrink-0 overflow-hidden relative group border border-outline-variant/10 shadow-inner">
          {isFetching && (
            <div className="absolute inset-0 z-20 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          {hasImage ? (
            <img 
              src={inspiration.imageUrl} 
              className={`w-full h-full object-cover transition-all duration-500 ${isFetching ? 'blur-sm scale-110' : 'blur-0 scale-100'}`} 
              alt="Inspiration" 
            />
          ) : (
            <div className={`w-full h-full flex flex-col items-center justify-center text-outline-variant/20 ${isFetching ? 'animate-pulse bg-primary/5' : ''}`}>
              <span className="material-symbols-outlined text-[24px]">
                {fetchError ? 'error_outline' : (isFetching ? 'downloading' : 'image')}
              </span>
              {fetchError && <span className="text-[7px] font-bold uppercase mt-1">Error</span>}
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <input 
            type="text"
            value={inspiration.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Nombre de Ref..."
            className="text-[10px] font-bold uppercase tracking-widest text-outline bg-transparent border-none focus:ring-0 p-0 w-full"
          />
          <textarea 
            value={inspiration.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Descripción de la idea..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] font-medium text-primary leading-snug mt-1 resize-none h-16"
          />
        </div>
      </div>
      
      <div className="pt-2 border-t border-outline-variant/5 flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px] text-[#ff0050]">link</span>
        <input 
          type="text"
          value={inspiration.url}
          onChange={(e) => onUpdate({ url: e.target.value })}
          placeholder="Link de TikTok / Referencia"
          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-[10px] font-bold text-[#ff0050] placeholder:text-[#ff0050]/20"
        />
      </div>
    </div>
  );
}

export default function ProductionModal({ isOpen, onClose, eventData }: ProductionModalProps) {
  const { addContent, updateContent, deleteContent, projects, allProjectCampaigns } = useProject();
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (eventData) {
      setShowDeleteConfirm(false); // Reset on open
      setIsExpanded(false); // Reset expansion
      // Migrate single inspiration to calibrations array if needed
      let formattedInspirations = eventData.inspirations || [];
      if (formattedInspirations.length === 0 && eventData.inspiration) {
        formattedInspirations = [{ ...eventData.inspiration, id: 'init-1' }];
      }

      setEditedData({
        ...eventData,
        title: eventData.title || "",
        goal: eventData.goal || "",
        hook: eventData.hook || "",
        narrative: eventData.narrative || "",
        cta: eventData.cta || "Link en bio",
        time: eventData.time || "",
        resources: eventData.resources || { drive: "", export: "" },
        inspirations: formattedInspirations
      });
    }
  }, [eventData]);

  if (!eventData || !editedData) return null;

  const handleSave = async () => {
    if (!editedData || isSaving) return;
    setIsSaving(true);
    try {
      const dataToSave = {
        ...editedData,
        id: editedData.id || `content_${Date.now()}`
      };
      
      if (editedData.isDraft || editedData.isNew) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isDraft, isNew, ...rest } = dataToSave;
        await addContent(rest);
      } else {
        await updateContent(dataToSave.id, dataToSave);
      }
      onClose();
    } catch (error) {
      console.error("Error saving piece:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await deleteContent(editedData.id);
      onClose();
    } catch (error) {
      console.error("Error deleting piece:", error);
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent: string, field: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleAddInspiration = () => {
    const newInspiration: Inspiration = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Referencia ${editedData.inspirations.length + 1}`,
      description: "",
      url: "",
      imageUrl: ""
    };
    setEditedData((prev: any) => ({
      ...prev,
      inspirations: [...prev.inspirations, newInspiration]
    }));
    setViewMode('list'); // Switch to list for better editing of new item
  };

  const handleUpdateInspiration = (id: string, data: Partial<Inspiration>) => {
    setEditedData((prev: any) => ({
      ...prev,
      inspirations: prev.inspirations.map((ins: Inspiration) => 
        ins.id === id ? { ...ins, ...data } : ins
      )
    }));
  };

  const handleRemoveInspiration = (id: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      inspirations: prev.inspirations.filter((ins: Inspiration) => ins.id !== id)
    }));
  };

  // Derive project and campaign for contextual header
  const project = projects.find(p => p.id === editedData.projectId);
  const campaign = project ? allProjectCampaigns[project.id]?.find(c => c.id === editedData.campaignId) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white h-full w-full flex flex-col pointer-events-auto overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-5 w-2/3">
                  <button onClick={onClose} className="p-1.5 -ml-1 rounded-full hover:bg-surface-container-low text-outline-variant hover:text-primary transition-colors shrink-0">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text"
                      value={editedData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Título de la Pieza..."
                      className="text-lg font-headline font-bold text-primary tracking-tight bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-primary/20 truncate"
                    />
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap w-full">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e64394]"></span>
                        <span className="text-[9px] font-bold text-[#e64394] uppercase tracking-wider">
                          {isSaving ? "Guardando..." : "Editando Contenido"}
                        </span>
                      </div>
                      
                      {/* Project info */}
                      {project && (
                        <>
                          <div className="h-3 w-px bg-outline-variant/30 shrink-0"></div>
                          <div className="flex items-center gap-1.5 shrink-0" title={`Proyecto: ${project.name}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${project.accent?.replace('bg-', 'bg-') || 'bg-primary'}`}></div>
                             <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider truncate max-w-[120px]">{project.name}</span>
                          </div>
                        </>
                      )}
                      
                      {/* Campaign info */}
                      {campaign && (
                        <>
                          <div className="h-3 w-px bg-outline-variant/30 shrink-0"></div>
                          <div className="flex items-center gap-1 shrink-0" title={`Campaña matriz: ${campaign.name}`}>
                             <span className="material-symbols-outlined text-[12px] text-on-surface-variant">campaign</span>
                             <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider truncate max-w-[120px]">{campaign.name}</span>
                          </div>
                        </>
                      )}

                      {/* Time input */}
                      <div className="h-3 w-px bg-outline-variant/30 shrink-0"></div>
                      <div className="flex items-center gap-1 shrink-0 bg-surface-container-lowest border border-outline-variant/10 px-2 py-0.5 rounded-md hover:border-primary/30 transition-colors focus-within:border-primary/50">
                         <span className="material-symbols-outlined text-[12px] text-primary">schedule</span>
                         <input 
                           type="text" 
                           value={editedData.time || ""} 
                           onChange={(e) => handleChange("time", e.target.value)}
                           placeholder="Añadir hora..." 
                           className="bg-transparent border-none focus:ring-0 p-0 text-[10px] font-bold text-primary uppercase tracking-wider w-20 placeholder:text-primary/30"
                         />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2 bg-error/10 border border-error/20 px-2 py-1 rounded-lg animate-in slide-in-from-right-4 duration-200">
                      <span className="text-[10px] font-bold text-error uppercase tracking-widest pl-1">¿Eliminar?</span>
                      <button onClick={handleDelete} disabled={isSaving} className="px-3 py-1 text-[10px] font-bold text-white bg-error hover:bg-error/90 rounded-md transition-colors">
                        Sí
                      </button>
                      <button onClick={() => setShowDeleteConfirm(false)} className="px-3 py-1 text-[10px] font-bold text-error bg-white hover:bg-error/5 rounded-md transition-colors border border-error/20">
                        No
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1.5 text-error/70 hover:text-error hover:bg-error/10 rounded-lg transition-colors border border-transparent hover:border-error/20"
                      title="Eliminar Pieza"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  )}
                  
                  <button className="px-4 py-1.5 text-[11px] font-bold text-primary bg-surface-container-lowest hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/20 shadow-sm" onClick={handleSave} disabled={isSaving || showDeleteConfirm}>
                    {isSaving ? "..." : "Guardar"}
                  </button>
                  <button className="px-4 py-1.5 text-[11px] font-bold text-white bg-primary hover:opacity-90 rounded-lg transition-opacity shadow-lg shadow-primary/20">
                    Publicar
                  </button>
                </div>
              </div>

              {/* High-Density Content - No Scroll */}
              <div className="flex-1 overflow-hidden bg-surface-container-lowest/30 relative">
                <div className="h-full grid grid-cols-12 gap-0 divide-x divide-outline-variant/10">
                  
                  {/* LEFT: Briefing + Estrategia */}
                  <div className="col-span-4 flex flex-col divide-y divide-outline-variant/10 bg-white">
                    
                    {/* Briefing */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[18px] text-primary">lightbulb</span>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Briefing Estratégico</h3>
                      </div>
                      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-outline-variant mb-2">Objetivo de la pieza</h4>
                        <textarea 
                          value={editedData.goal}
                          onChange={(e) => handleChange("goal", e.target.value)}
                          placeholder="Describe el objetivo..."
                          rows={3}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] font-medium text-slate-700 leading-relaxed resize-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Estrategia */}
                    <div className="p-6 flex-1 flex flex-col min-h-0 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[18px] text-primary">dynamic_feed</span>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Estrategia de Contenido</h3>
                      </div>
                      <div className="space-y-4 flex-1 flex flex-col">
                        <div className="bg-[#00174b] rounded-2xl p-6 relative overflow-hidden shadow-xl group/hook">
                          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/hook:opacity-40 transition-opacity">
                            <span className="material-symbols-outlined text-4xl text-white">format_quote</span>
                          </div>
                          <h4 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2">Hook (Gancho Inicial)</h4>
                          <textarea 
                            value={editedData.hook}
                            onChange={(e) => handleChange("hook", e.target.value)}
                            placeholder='"¿Qué pasaría si te dijera..."'
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-bold font-headline text-white italic tracking-tight resize-none placeholder:text-white/10"
                            rows={2}
                          />
                        </div>
                        <div className="bg-white border border-outline-variant/10 rounded-2xl p-5 flex-1 flex flex-col shadow-sm hover:shadow-md transition-shadow min-h-0">
                          <h4 className="text-[9px] font-bold uppercase tracking-widest text-outline-variant mb-2">Arco Narrativo (Cuerpo)</h4>
                          <textarea 
                            value={editedData.narrative}
                            onChange={(e) => handleChange("narrative", e.target.value)}
                            placeholder="Desarrollo del contenido..."
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-[14px] text-slate-700 leading-relaxed resize-none flex-1 placeholder:text-slate-300"
                          />
                          <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-4">
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary/40">Call to Action (CTA)</span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                              <input 
                                type="text"
                                value={editedData.cta}
                                onChange={(e) => handleChange("cta", e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-[12px] font-bold text-primary text-right w-32 placeholder:text-primary/20"
                              />
                              <span className="material-symbols-outlined text-[14px] text-primary">arrow_outward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: Recursos */}
                  <div className="col-span-2 flex flex-col divide-y divide-outline-variant/10 bg-surface-container-lowest/50">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[18px] text-primary">folder_open</span>
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Recursos</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/10 shadow-sm hover:border-primary/30 transition-colors cursor-pointer group/res">
                          <div className="h-10 w-10 bg-surface-container-high rounded-xl flex items-center justify-center text-primary shrink-0 group-hover/res:bg-primary group-hover/res:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">add_link</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[9px] font-bold text-primary uppercase tracking-tight mb-0.5">Raw Footage</h4>
                            <input 
                              type="text"
                              value={editedData.resources?.drive || ""}
                              onChange={(e) => handleNestedChange("resources", "drive", e.target.value)}
                              placeholder="Link de Drive..."
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] text-on-surface-variant font-medium placeholder:text-outline/20 truncate"
                            />
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-outline-variant/10 shadow-sm hover:border-primary/30 transition-colors cursor-pointer group/res">
                          <div className="h-10 w-10 bg-surface-container-high rounded-xl flex items-center justify-center text-primary shrink-0 group-hover/res:bg-primary group-hover/res:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">movie</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[9px] font-bold text-primary uppercase tracking-tight mb-0.5">Export Final</h4>
                            <input 
                              type="text"
                              value={editedData.resources?.export || ""}
                              onChange={(e) => handleNestedChange("resources", "export", e.target.value)}
                              placeholder="Link del export..."
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] text-on-surface-variant font-medium placeholder:text-outline/20 truncate"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Inspiraciones (Overlay-able) */}
                  <div className={`flex flex-col min-h-0 bg-surface-container-lowest transition-all duration-300 ${isExpanded ? 'absolute inset-0 z-40' : 'col-span-6 border-l border-outline-variant/10'}`}>
                      <div className="flex items-center justify-between p-4 border-b border-outline-variant/10 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-primary">auto_awesome</span>
                          <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Galería de Inspiración</h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-surface-container-high p-1 rounded-xl">
                            <button 
                              onClick={() => setViewMode('grid')}
                              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-outline-variant hover:text-primary'}`}
                              title="Ver Cuadrícula"
                            >
                              <span className="material-symbols-outlined text-[18px]">grid_view</span>
                            </button>
                            <button 
                              onClick={() => setViewMode('list')}
                              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-outline-variant hover:text-primary'}`}
                              title="Ver Lista"
                            >
                              <span className="material-symbols-outlined text-[18px]">view_list</span>
                            </button>
                          </div>
                          <div className="h-5 w-px bg-outline-variant/20"></div>
                          <button 
                            onClick={() => setIsExpanded(prev => !prev)}
                            className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-primary text-white shadow-lg' : 'bg-surface-container-high text-outline-variant hover:text-primary'}`}
                            title={isExpanded ? "Contraer" : "Maximizar Galería"}
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              {isExpanded ? 'fullscreen_exit' : 'fullscreen'}
                            </span>
                          </button>
                          <button 
                            onClick={handleAddInspiration}
                            className="h-10 px-4 text-[10px] font-black text-white bg-primary hover:opacity-90 rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 transition-all active:scale-95"
                          >
                            <span className="material-symbols-outlined text-sm">add</span> NUEVA REF
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-surface-container-lowest/50">
                        {viewMode === 'grid' ? (
                          <div className={`grid gap-6 ${isExpanded ? 'grid-cols-4 lg:grid-cols-6 xl:grid-cols-8' : 'grid-cols-3 lg:grid-cols-4'}`}>
                            <AnimatePresence>
                              {editedData.inspirations.map((ins: Inspiration) => (
                                <motion.div
                                  key={ins.id}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="group/thumb relative aspect-[3/4] bg-slate-900 rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-lg hover:shadow-2xl transition-all cursor-pointer ring-0 hover:ring-4 ring-primary/20"
                                  onClick={() => { setViewMode('list'); if (isExpanded) setIsExpanded(false); }}
                                >
                                  <InspirationThumbnail imageUrl={ins.imageUrl} url={ins.url} onUpdate={(data) => handleUpdateInspiration(ins.id, data)} />
                                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
                                    <p className="text-[10px] font-black text-white truncate uppercase tracking-widest">{ins.title || "Sin título"}</p>
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleRemoveInspiration(ins.id); }}
                                    className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity z-10 border border-white/10"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className={`space-y-6 ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
                            <AnimatePresence>
                              {editedData.inspirations.map((ins: Inspiration) => (
                                <motion.div
                                  key={ins.id}
                                  initial={{ opacity: 0, y: 12 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                >
                                  <InspirationCard 
                                    inspiration={ins} 
                                    onUpdate={(data) => handleUpdateInspiration(ins.id, data)}
                                    onRemove={() => handleRemoveInspiration(ins.id)}
                                  />
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                        
                        {editedData.inspirations.length === 0 && (
                          <div className="h-64 flex flex-col items-center justify-center text-outline-variant/30 gap-3 border-2 border-dashed border-outline-variant/10 rounded-3xl bg-surface-container-lowest/50">
                            <span className="material-symbols-outlined text-4xl">auto_awesome_motion</span>
                            <p className="text-[11px] font-black uppercase tracking-widest">Sin referencias guardadas</p>
                            <button onClick={handleAddInspiration} className="text-[10px] font-bold text-primary px-4 py-2 bg-primary/5 rounded-full hover:bg-primary/10 transition-colors">Añadir Primera</button>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function InspirationThumbnail({ imageUrl, url, onUpdate }: { imageUrl: string, url: string, onUpdate: (data: Partial<Inspiration>) => void }) {
  const [isFetching, setIsFetching] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Re-fetch if we don't have an image OR if the previous one failed
    if (imageUrl && !hasError) return;
    
    const trimmedUrl = url?.trim();
    if (!trimmedUrl || !trimmedUrl.startsWith("http")) return;

    const isSupported = trimmedUrl.includes("tiktok.com") || trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be");
    if (!isSupported) return;

    const fetchThumbnail = async () => {
      setIsFetching(true);
      setHasError(false);
      try {
        const res = await fetch(`/api/proxy/oembed?url=${encodeURIComponent(trimmedUrl)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail_url) {
            onUpdate({ imageUrl: data.thumbnail_url });
          }
        } else {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error fetching thumbnail:", error);
        setHasError(true);
      } finally {
        setIsFetching(false);
      }
    };

    const timer = setTimeout(fetchThumbnail, 1500);
    return () => clearTimeout(timer);
  }, [imageUrl, url, onUpdate, hasError]);

  if (imageUrl && !hasError) {
    return (
      <img 
        src={imageUrl} 
        className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-500" 
        alt="" 
        onError={() => {
          console.log("Thumbnail expired/failed, clearing to retry...");
          setHasError(true);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 bg-slate-800">
      <span className={`material-symbols-outlined text-2xl ${isFetching ? 'animate-spin' : ''}`}>
        {isFetching ? 'sync' : (hasError ? 'refresh' : 'image')}
      </span>
      {hasError && <span className="text-[7px] font-bold uppercase mt-1 text-white/40">Reintento...</span>}
    </div>
  );
}

