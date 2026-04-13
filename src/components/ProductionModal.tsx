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

  useEffect(() => {
    const url = inspiration.url;
    if (!url || !url.startsWith("http")) return;

    const timer = setTimeout(async () => {
      if (url.includes("tiktok.com") || url.includes("youtube.com") || url.includes("youtu.be")) {
        setIsFetching(true);
        try {
          const res = await fetch(`/api/proxy/oembed?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.thumbnail_url) {
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
  const { updateContent } = useProject();
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (eventData) {
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
              <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-5">
                  <button onClick={onClose} className="p-1.5 -ml-1 rounded-full hover:bg-surface-container-low text-outline-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                  
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={editedData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Título de la Pieza..."
                      className="text-lg font-headline font-bold text-primary tracking-tight bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-primary/20"
                    />
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e64394]"></span>
                      <span className="text-[9px] font-bold text-[#e64394] uppercase tracking-wider">
                        {isSaving ? "Guardando..." : "Editando Contenido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="px-4 py-1.5 text-[11px] font-bold text-primary bg-surface-container-lowest hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/20 shadow-sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "..." : "Guardar"}
                  </button>
                  <button className="px-4 py-1.5 text-[11px] font-bold text-white bg-primary hover:opacity-90 rounded-lg transition-opacity shadow-lg shadow-primary/20">
                    Publicar
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-surface-container-lowest/30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column */}
                  <div className="lg:col-span-7 space-y-6">
                    <section className="bg-white rounded-2xl border border-outline-variant/10 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-lg text-primary">lightbulb</span>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-tight">Briefing</h3>
                      </div>
                      <div className="bg-surface-container-lowest border border-outline-variant/5 rounded-xl p-3">
                        <h4 className="text-[8px] font-bold uppercase tracking-widest text-outline mb-1">Objetivo Estratégico</h4>
                        <textarea 
                          value={editedData.goal}
                          onChange={(e) => handleChange("goal", e.target.value)}
                          placeholder="Describe el objetivo..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] font-medium text-slate-700 leading-snug resize-none min-h-[40px] placeholder:text-slate-300"
                        />
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-outline-variant/10 p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-lg text-primary">dynamic_feed</span>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-tight">Estrategia</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-[#00174b] rounded-xl p-4 relative overflow-hidden shadow-md">
                          <h4 className="absolute top-2 left-3 text-[8px] font-bold text-white/40 uppercase tracking-widest">Hook (Gancho)</h4>
                          <textarea 
                            value={editedData.hook}
                            onChange={(e) => handleChange("hook", e.target.value)}
                            placeholder='"¿Qué pasaría si te dijera..."'
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-base font-bold font-headline text-white italic tracking-tight text-center resize-none mt-2 placeholder:text-white/10"
                            rows={2}
                          />
                        </div>
                        <div className="bg-surface-container-lowest border border-outline-variant/5 rounded-xl p-3">
                          <h4 className="text-[8px] font-bold uppercase tracking-widest text-outline mb-1.5">Arco Narrativo (Cuerpo)</h4>
                          <textarea 
                            value={editedData.narrative}
                            onChange={(e) => handleChange("narrative", e.target.value)}
                            placeholder="Desarrollo del contenido..."
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-[13px] text-slate-700 leading-relaxed resize-none min-h-[160px] placeholder:text-slate-300"
                          />
                          <div className="flex items-center justify-between border-t border-outline-variant/5 pt-2 mt-2">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-outline">CTA</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="text"
                                value={editedData.cta}
                                onChange={(e) => handleChange("cta", e.target.value)}
                                className="bg-transparent border-none focus:ring-0 p-0 text-xs font-bold text-primary text-right w-24 placeholder:text-primary/20"
                              />
                              <span className="material-symbols-outlined text-[10px] text-primary">arrow_outward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-5 space-y-6">
                    <section className="bg-white rounded-2xl border border-outline-variant/10 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-primary">folder</span>
                          <h3 className="text-sm font-bold text-primary uppercase tracking-tight">Recursos</h3>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-surface-container-lowest rounded-xl p-3 flex items-center gap-3 border border-outline-variant/5">
                          <div className="h-8 w-8 bg-surface-container-high rounded-lg flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-base">link</span>
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h4 className="text-[9px] font-bold text-primary uppercase tracking-tight">Raw Footage</h4>
                            <input 
                              type="text"
                              value={editedData.resources?.drive || ""}
                              onChange={(e) => handleNestedChange("resources", "drive", e.target.value)}
                              placeholder="Link de Drive..."
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-on-surface-variant font-medium placeholder:text-outline/20"
                            />
                          </div>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-3 flex items-center gap-3 border border-outline-variant/5">
                          <div className="h-8 w-8 bg-surface-container-high rounded-lg flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                          </div>
                          <div className="flex-1 flex flex-col">
                            <h4 className="text-[9px] font-bold text-primary uppercase tracking-tight">Export Final</h4>
                            <input 
                              type="text"
                              value={editedData.resources?.export || ""}
                              onChange={(e) => handleNestedChange("resources", "export", e.target.value)}
                              placeholder="Link del export..."
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-on-surface-variant font-medium placeholder:text-outline/20"
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-outline-variant/10 p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-primary">auto_awesome</span>
                          <h3 className="text-sm font-bold text-primary uppercase tracking-tight">Inspiración</h3>
                        </div>
                        <button 
                          onClick={handleAddInspiration}
                          className="text-[10px] font-bold text-surface-tint flex items-center gap-0.5 hover:opacity-80 px-2 py-1 rounded-md bg-surface-container-lowest border border-outline-variant/10"
                        >
                          <span className="material-symbols-outlined text-sm">add</span> Add Ref
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <AnimatePresence>
                          {editedData.inspirations.map((ins: Inspiration) => (
                            <motion.div
                              key={ins.id}
                              initial={{ opacity: 0, y: 10 }}
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
                    </section>
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
