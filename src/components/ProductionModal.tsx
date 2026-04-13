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

  const handleChange = (field: string, value: string) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
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
              className="bg-white h-full w-full max-w-3xl flex flex-col pointer-events-auto overflow-hidden border-l border-outline-variant/10 shadow-2xl"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-6">
                  <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-surface-container-low text-outline-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                  
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={editedData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Título de la Pieza..."
                      className="text-xl font-headline font-bold text-primary tracking-tight bg-transparent border-none focus:ring-0 p-0 w-full placeholder:text-primary/20"
                    />
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e64394]"></span>
                      <span className="text-[10px] font-bold text-[#e64394] uppercase tracking-wider">
                        {isSaving ? "Guardando..." : "Editando Contenido"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button className="px-5 py-2 text-xs font-bold text-primary bg-surface-container-lowest hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/20 shadow-sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "..." : "Guardar"}
                  </button>
                  <button className="px-5 py-2 text-xs font-bold text-white bg-primary hover:opacity-90 rounded-lg transition-opacity shadow-lg shadow-primary/20">
                    Publicar
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10">
                
                {/* Briefing Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-xl text-primary">lightbulb</span>
                    <h3 className="text-lg font-headline font-bold text-primary">Briefing</h3>
                  </div>
                  
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Objetivo (Goal)</h4>
                    <textarea 
                      value={editedData.goal}
                      onChange={(e) => handleChange("goal", e.target.value)}
                      placeholder="Describe el objetivo estratégico de este contenido..."
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-700 leading-relaxed resize-none min-h-[80px] placeholder:text-slate-300"
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
                    <div className="md:col-span-2 bg-[#00174b] rounded-2xl p-8 flex flex-col justify-center relative overflow-hidden shadow-md">
                      <div className="relative z-10 text-center">
                        <textarea 
                          value={editedData.hook}
                          onChange={(e) => handleChange("hook", e.target.value)}
                          placeholder='"¿Qué pasaría si te dijera..."'
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-xl font-bold font-headline text-white italic tracking-tight text-center resize-none placeholder:text-white/20"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                      <div className="absolute top-3 left-4 text-[10px] font-bold text-white/50 uppercase tracking-widest">Hook (Gancho)</div>
                    </div>
                    
                    {/* Narrative Arc Card */}
                    <div className="md:col-span-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 flex flex-col shadow-sm">
                      <div className="flex-1 mb-8">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Arco Narrativo (Cuerpo)</h4>
                        <textarea 
                          value={editedData.narrative}
                          onChange={(e) => handleChange("narrative", e.target.value)}
                          placeholder="Describe el desarrollo del video, tomas, música..."
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-700 leading-relaxed resize-none min-h-[120px] placeholder:text-slate-300"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Call to Action (CTA)</span>
                        <div className="flex items-center gap-1">
                          <input 
                            type="text"
                            value={editedData.cta}
                            onChange={(e) => handleChange("cta", e.target.value)}
                            className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-primary text-right w-32 placeholder:text-primary/20"
                          />
                          <span className="material-symbols-outlined text-[14px] text-primary">arrow_outward</span>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50 grayscale">
                    <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-outline-variant">
                        <span className="material-symbols-outlined">link</span>
                      </div>
                      <span className="text-xs font-bold text-outline-variant">Próximamente...</span>
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
