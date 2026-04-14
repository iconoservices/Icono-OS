"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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
  const fetchedUrlRef = useRef<string | null>(
    inspiration.imageUrl !== "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=300&fit=crop" ? inspiration.url : null
  );

  useEffect(() => {
    const url = inspiration.url;
    if (!url || !url.startsWith("http")) return;
    
    // Prevent refetching if we already fetched for this exact URL
    if (url === fetchedUrlRef.current) return;

    const timer = setTimeout(async () => {
      if (url.includes("tiktok.com") || url.includes("youtube.com") || url.includes("youtu.be")) {
        setIsFetching(true);
        try {
          const res = await fetch(`/api/proxy/oembed?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.thumbnail_url) {
              fetchedUrlRef.current = url; // Mark as fetched
              onUpdate({ 
                imageUrl: data.thumbnail_url,
                description: inspiration.description || data.title || ""
              });
            }
          }
        } catch (error) {
          console.error("Error fetching thumbnail:", error);
        } finally {
          setIsFetching(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inspiration.url]);

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
          <img 
            src={inspiration.imageUrl || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=300&fit=crop"} 
            className={`w-full h-full object-cover transition-all duration-500 ${isFetching ? 'blur-sm scale-110' : 'blur-0 scale-100'}`} 
            alt="Inspiration" 
          />
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
  const { updateContent, deleteContent, projects, allProjectCampaigns } = useProject();
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (eventData) {
      setShowDeleteConfirm(false); // Reset on open
      // Migrate single inspiration to calibrations array if needed
      let formattedInspirations = eventData.inspirations || [];
      if (formattedInspirations.length === 0 && eventData.inspiration) {
        formattedInspirations = [{ ...eventData.inspiration, id: 'init-1' }];
      }
      if (formattedInspirations.length === 0) {
        formattedInspirations = [{
          id: 'default-1',
          title: "Referencia 01", 
          description: "Estilo de cortes rápidos y tipografía cinética agresiva.",
          url: "",
          imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=300&fit=crop"
        }];
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
    setIsSaving(true);
    try {
      await updateContent(editedData.id, editedData);
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
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=300&fit=crop"
    };
    setEditedData((prev: any) => ({
      ...prev,
      inspirations: [...prev.inspirations, newInspiration]
    }));
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

          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white h-full w-full max-w-5xl flex flex-col pointer-events-auto overflow-hidden border-l border-outline-variant/10 shadow-2xl"
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
                             <div className={`w-1.5 h-1.5 rounded-full ${project.accent.replace('bg-', 'bg-') || 'bg-primary'}`}></div>
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
              <div className="flex-1 overflow-y-auto min-h-0 bg-surface-container-lowest/30">
                <div className="h-full grid grid-cols-12 gap-0 divide-x divide-outline-variant/10">
                  
                  {/* LEFT: Briefing + Estrategia */}
                  <div className="col-span-5 flex flex-col divide-y divide-outline-variant/10">
                    
                    {/* Briefing */}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[14px] text-primary">lightbulb</span>
                        <h3 className="text-[9px] font-bold text-primary uppercase tracking-widest">Briefing</h3>
                      </div>
                      <div className="bg-white border border-outline-variant/10 rounded-lg p-2.5">
                        <h4 className="text-[8px] font-bold uppercase tracking-widest text-outline mb-1">Objetivo Estratégico</h4>
                        <textarea 
                          value={editedData.goal}
                          onChange={(e) => handleChange("goal", e.target.value)}
                          placeholder="Describe el objetivo..."
                          rows={2}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[12px] font-medium text-slate-700 leading-snug resize-none placeholder:text-slate-300"
                        />
                      </div>
                    </div>

                    {/* Estrategia */}
                    <div className="p-3 flex-1 flex flex-col">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[14px] text-primary">dynamic_feed</span>
                        <h3 className="text-[9px] font-bold text-primary uppercase tracking-widest">Estrategia</h3>
                      </div>
                      <div className="space-y-2 flex-1 flex flex-col">
                        <div className="bg-[#00174b] rounded-lg p-3 relative overflow-hidden shadow-md">
                          <h4 className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Hook (Gancho)</h4>
                          <textarea 
                            value={editedData.hook}
                            onChange={(e) => handleChange("hook", e.target.value)}
                            placeholder='"¿Qué pasaría si te dijera..."'
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold font-headline text-white italic tracking-tight text-center resize-none placeholder:text-white/10"
                            rows={2}
                          />
                        </div>
                        <div className="bg-white border border-outline-variant/10 rounded-lg p-2.5 flex-1 flex flex-col">
                          <h4 className="text-[8px] font-bold uppercase tracking-widest text-outline mb-1">Arco Narrativo (Cuerpo)</h4>
                          <textarea 
                            value={editedData.narrative}
                            onChange={(e) => handleChange("narrative", e.target.value)}
                            placeholder="Desarrollo del contenido..."
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-[12px] text-slate-700 leading-relaxed resize-none flex-1 placeholder:text-slate-300"
                          />
                          <div className="flex items-center justify-between border-t border-outline-variant/5 pt-1.5 mt-1.5">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-outline">CTA</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="text"
                                value={editedData.cta}
                                onChange={(e) => handleChange("cta", e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-[11px] font-bold text-primary text-right w-24 placeholder:text-primary/20"
                              />
                              <span className="material-symbols-outlined text-[10px] text-primary">arrow_outward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CENTER: Recursos */}
                  <div className="col-span-3 flex flex-col divide-y divide-outline-variant/10">
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[14px] text-primary">folder</span>
                        <h3 className="text-[9px] font-bold text-primary uppercase tracking-widest">Recursos</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg p-2.5 flex items-center gap-2 border border-outline-variant/10">
                          <div className="h-7 w-7 bg-surface-container-high rounded-md flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[14px]">link</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[8px] font-bold text-primary uppercase tracking-tight">Raw Footage</h4>
                            <input 
                              type="text"
                              value={editedData.resources?.drive || ""}
                              onChange={(e) => handleNestedChange("resources", "drive", e.target.value)}
                              placeholder="Link de Drive..."
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-on-surface-variant font-medium placeholder:text-outline/20 truncate"
                            />
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 flex items-center gap-2 border border-outline-variant/10">
                          <div className="h-7 w-7 bg-surface-container-high rounded-md flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[8px] font-bold text-primary uppercase tracking-tight">Export Final</h4>
                            <input 
                              type="text"
                              value={editedData.resources?.export || ""}
                              onChange={(e) => handleNestedChange("resources", "export", e.target.value)}
                              placeholder="Link del export..."
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-on-surface-variant font-medium placeholder:text-outline/20 truncate"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Inspiraciones */}
                  <div className="col-span-4 flex flex-col min-h-0">
                    <div className="flex items-center justify-between p-3 border-b border-outline-variant/10 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px] text-primary">auto_awesome</span>
                        <h3 className="text-[9px] font-bold text-primary uppercase tracking-widest">Inspiración</h3>
                      </div>
                      <button 
                        onClick={handleAddInspiration}
                        className="text-[9px] font-bold text-surface-tint flex items-center gap-0.5 hover:opacity-80 px-1.5 py-0.5 rounded-md bg-white border border-outline-variant/10"
                      >
                        <span className="material-symbols-outlined text-xs">add</span> Ref
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                      <AnimatePresence>
                        {editedData.inspirations.map((ins: Inspiration) => (
                          <motion.div
                            key={ins.id}
                            initial={{ opacity: 0, y: 8 }}
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
