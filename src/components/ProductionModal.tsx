"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: any; // We'll type this properly later or just use any for mock
}

export default function ProductionModal({ isOpen, onClose, eventData }: ProductionModalProps) {
  if (!eventData) return null;

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
                  
                  <div>
                    <h2 className="text-xl font-headline font-bold text-primary tracking-tight">{eventData?.title || "Título del Video"}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e64394]"></span>
                      <span className="text-[10px] font-bold text-[#e64394] uppercase tracking-wider">Editando</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button className="px-4 py-2 text-xs font-bold text-primary bg-surface-container-low hover:bg-surface-container rounded-lg transition-colors border border-outline-variant/10">
                    Duplicar para otra plataforma
                  </button>
                  <button className="px-5 py-2 text-xs font-bold text-primary bg-surface-container-lowest hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/20 shadow-sm">
                    Guardar
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
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">
                      Impulsar reservas para el próximo lanzamiento principal. El contenido debe enfatizar la exclusividad y la disponibilidad limitada para desencadenar una acción del usuario de alta intención.
                    </p>
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
                    <div className="md:col-span-2 bg-[#00174b] rounded-2xl p-8 flex items-center justify-center relative overflow-hidden shadow-md">
                      <div className="relative z-10 text-center">
                        <p className="text-xl font-bold font-headline text-white italic tracking-tight">"¿Qué pasaría si te dijera..."</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                      <div className="absolute top-3 left-4 text-[10px] font-bold text-white/50 uppercase tracking-widest">Hook (Gancho)</div>
                    </div>
                    
                    {/* Narrative Arc Card */}
                    <div className="md:col-span-3 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 flex flex-col shadow-sm">
                      <div className="flex-1 mb-8">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Arco Narrativo (Cuerpo)</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          Tomas cinemáticas de la cocina preparando platos emblemáticos. Cortes rápidos sincronizados con una pista rítmica y percusiva. Enfoque en texturas: fuego, acero y guarniciones delicadas.
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">Call to Action (CTA)</span>
                        <span className="text-sm font-bold text-primary flex items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity">
                          Link en bio <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Resources Section */}
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
                    {/* Resource item 1 */}
                    <div className="bg-surface-container-low rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-[#497cff] shadow-sm">
                        <span className="material-symbols-outlined">folder_shared</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary group-hover:text-surface-tint transition-colors">Raw Footage - B-Roll</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium">Google Drive • 1.2 GB</p>
                      </div>
                    </div>
                    
                    {/* Resource item 2 */}
                    <div className="bg-[#f2f9f5] border border-[#a3d9b8] rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer group">
                      <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-[#2ECC71] shadow-sm">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-primary group-hover:text-[#27ae60] transition-colors">Final Export v2</h4>
                        <p className="text-[10px] text-on-surface-variant font-medium">Google Drive • 48 MB</p>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Inspiration Section */}
                <section className="pb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-xl text-primary">auto_awesome</span>
                    <h3 className="text-lg font-headline font-bold text-primary">Inspiración</h3>
                  </div>
                  
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 shadow-sm flex items-start gap-4 hover:border-outline-variant transition-colors cursor-pointer">
                    <div className="w-16 h-24 bg-slate-900 rounded-lg shrink-0 overflow-hidden relative group">
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">play_arrow</span>
                      </div>
                      {/* Simulating a video cover */}
                      <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=300&fit=crop" className="w-full h-full object-cover" alt="Inspiration" />
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">Referencia 01</h4>
                      <p className="text-sm font-bold text-primary leading-tight line-clamp-2">Estilo de cortes rápidos y tipografía cinética agresiva.</p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#ff0050]">
                         <span className="material-symbols-outlined text-sm">open_in_new</span> Ver en TikTok
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
