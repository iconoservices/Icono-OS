"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useProject } from "@/context/ProjectContext";

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: any;
}

export default function ProductionModal({ isOpen, onClose, eventData }: ProductionModalProps) {
  const { updateContent } = useProject();
  const [editedData, setEditedData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingThumbnail, setIsFetchingThumbnail] = useState(false);

  // Initialize local state when modal opens with new data
  useEffect(() => {
    if (eventData) {
      setEditedData({
        ...eventData,
        title: eventData.title || "",
        goal: eventData.goal || "",
        hook: eventData.hook || "",
        narrative: eventData.narrative || "",
        cta: eventData.cta || "Link en bio",
        resources: eventData.resources || { drive: "", export: "" },
        inspiration: eventData.inspiration || { 
          title: "Referencia 01", 
          description: "Estilo de cortes rápidos y tipografía cinética agresiva.",
          url: "",
          imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=300&fit=crop"
        }
      });
    }
  }, [eventData]);

  // Auto-fetch thumbnail when link changes
  useEffect(() => {
    const url = editedData?.inspiration?.url;
    if (!url || !url.startsWith("http")) return;

    // Simple debounce/check to avoid too many requests
    const timer = setTimeout(async () => {
      if (url.includes("tiktok.com") || url.includes("youtube.com") || url.includes("youtu.be")) {
        setIsFetchingThumbnail(true);
        try {
          const res = await fetch(`/api/proxy/oembed?url=${encodeURIComponent(url)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.thumbnail_url) {
              handleNestedChange("inspiration", "imageUrl", data.thumbnail_url);
              // Also update title if empty
              if (!editedData.inspiration.description) {
                handleNestedChange("inspiration", "description", data.title || "");
              }
            }
          }
        } catch (error) {
          console.error("Error fetching thumbnail:", error);
        } finally {
          setIsFetchingThumbnail(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [editedData?.inspiration?.url]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
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
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Briefing Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-xl text-primary">lightbulb</span>
                    <h3 className="text-lg font-headline font-bold text-primary">Briefing</h3>
                  </div>
                  
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1.5">Objetivo (Goal)</h4>
                    <textarea 
                      value={editedData.goal}
                      onChange={(e) => handleChange("goal", e.target.value)}
                      placeholder="Describe el objetivo estratégico de este contenido..."
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-700 leading-relaxed resize-none min-h-[60px] placeholder:text-slate-300"
                    />
                  </div>
                </section>

                {/* Strategy Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-xl text-primary">dynamic_feed</span>
                    <h3 className="text-lg font-headline font-bold text-primary">Estrategia</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Hook Card */}
                    <div className="md:col-span-2 bg-[#00174b] rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden shadow-md">
                      <div className="relative z-10 text-center">
                        <textarea 
                          value={editedData.hook}
                          onChange={(e) => handleChange("hook", e.target.value)}
                          placeholder='"¿Qué pasaría si te dijera..."'
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-bold font-headline text-white italic tracking-tight text-center resize-none placeholder:text-white/20"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                      <div className="absolute top-3 left-4 text-[9px] font-bold text-white/50 uppercase tracking-widest">Hook (Gancho)</div>
                    </div>
                    
                    {/* Narrative Arc Card */}
                    <div className="md:col-span-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 flex flex-col shadow-sm">
                      <div className="flex-1 mb-4">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-outline mb-2">Arco Narrativo (Cuerpo)</h4>
                        <textarea 
                          value={editedData.narrative}
                          onChange={(e) => handleChange("narrative", e.target.value)}
                          placeholder="Describe el desarrollo del video, tomas, música..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700 leading-relaxed resize-none min-h-[100px] placeholder:text-slate-300"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3 mt-auto">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Call to Action (CTA)</span>
                        <div className="flex items-center gap-1">
                          <input 
                            type="text"
                            value={editedData.cta}
                            onChange={(e) => handleChange("cta", e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-primary text-right w-24 placeholder:text-primary/20"
                          />
                          <span className="material-symbols-outlined text-[12px] text-primary">arrow_outward</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Resources Section - Keeping static for now as it needs a more complex schema */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-primary">folder</span>
                      <h3 className="text-lg font-headline font-bold text-primary">Recursos</h3>
                    </div>
                    <button className="text-sm font-bold text-surface-tint flex items-center gap-1 hover:opacity-80 transition-opacity">
                      <span className="material-symbols-outlined text-[18px]">add</span> Add Link
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group border border-transparent focus-within:border-primary/20">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined">link</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[11px] font-bold text-primary">Raw Footage (Drive)</h4>
                        <input 
                          type="text"
                          value={editedData.resources?.drive || ""}
                          onChange={(e) => handleNestedChange("resources", "drive", e.target.value)}
                          placeholder="Pega el link aquí..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-on-surface-variant font-medium placeholder:text-outline/30"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group border border-transparent focus-within:border-primary/20">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm shrink-0">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[11px] font-bold text-primary">Export Final</h4>
                        <input 
                          type="text"
                          value={editedData.resources?.export || ""}
                          onChange={(e) => handleNestedChange("resources", "export", e.target.value)}
                          placeholder="Pega el link del export..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[10px] text-on-surface-variant font-medium placeholder:text-outline/30"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Inspiration Section */}
                <section className="pb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-xl text-primary">auto_awesome</span>
                    <h3 className="text-lg font-headline font-bold text-primary">Inspiración</h3>
                  </div>
                  
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-sm flex items-start gap-4 hover:border-outline-variant transition-colors focus-within:border-primary/30">
                    <div className="w-16 h-24 bg-slate-900 rounded-lg shrink-0 overflow-hidden relative group border border-outline-variant/10 shadow-inner">
                      {isFetchingThumbnail && (
                        <div className="absolute inset-0 z-20 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img 
                        src={editedData.inspiration?.imageUrl} 
                        className={`w-full h-full object-cover transition-all duration-500 ${isFetchingThumbnail ? 'blur-sm scale-110' : 'blur-0 scale-100'}`} 
                        alt="Inspiration" 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white text-base">image</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col">
                        <input 
                          type="text"
                          value={editedData.inspiration?.title || ""}
                          onChange={(e) => handleNestedChange("inspiration", "title", e.target.value)}
                          placeholder="Título de referencia..."
                          className="text-[9px] font-bold uppercase tracking-widest text-outline bg-transparent border-none focus:ring-0 p-0"
                        />
                        <textarea 
                          value={editedData.inspiration?.description || ""}
                          onChange={(e) => handleNestedChange("inspiration", "description", e.target.value)}
                          placeholder="Describe el estilo o referencia..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-[11px] font-medium text-primary leading-tight mt-1 resize-none"
                          rows={2}
                        />
                      </div>
                      
                      <div className="pt-2 border-t border-outline-variant/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px] text-[#ff0050]">link</span>
                        <input 
                          type="text"
                          value={editedData.inspiration?.url || ""}
                          onChange={(e) => handleNestedChange("inspiration", "url", e.target.value)}
                          placeholder="Link de TikTok / Referencia"
                          className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-[10px] font-bold text-[#ff0050] placeholder:text-[#ff0050]/20"
                        />
                      </div>
                    </div>
                  </div>
                </section>
                
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
