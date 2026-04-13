"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { projectCampaigns } from "@/data/mock";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { projects, currentProject, setCurrentProject, hiddenCampaignIds, toggleCampaignVisibility } = useProject();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      className="hidden lg:flex flex-col h-full py-6 px-4 border-r border-transparent bg-slate-50 dark:bg-slate-950 shrink-0 relative overflow-hidden"
    >
      <div className="mb-8 px-2 flex flex-col gap-4 relative">
        <div 
          onClick={() => {
            if (!isOpen) setIsOpen(true);
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className={`flex items-center gap-3 p-2 rounded-xl transition-colors cursor-pointer hover:bg-slate-200/50 ${isOpen ? '' : 'justify-center'}`}
        >
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 overflow-hidden ${currentProject?.accent || 'ink-gradient'}`}>
            {currentProject ? (
              <img src={currentProject.logo} alt={currentProject.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined">dashboard_customize</span>
            )}
          </div>
          {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 whitespace-nowrap overflow-hidden">
              <div className="text-slate-900 dark:text-slate-100 text-sm font-bold truncate">{currentProject?.name || "Selector de Proyectos"}</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-widest font-semibold truncate">{currentProject?.category || "Gestión Multi-cliente"}</div>
            </motion.div>
          )}
          {isOpen && (
            <span className="material-symbols-outlined text-slate-400 text-sm shrink-0">unfold_more</span>
          )}
        </div>

        {/* Project Selector Dropdown */}
        <AnimatePresence>
          {isOpen && isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-16 left-2 right-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="py-2 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                Portafolio Activo
              </div>
              <div className="max-h-60 overflow-y-auto no-scrollbar">
                {projects.map((proj) => (
                  <div 
                    key={proj.id}
                    onClick={() => {
                      setCurrentProject(proj);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 ${currentProject?.id === proj.id ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  >
                    <img src={proj.logo} alt={proj.name} className="w-8 h-8 rounded-lg object-cover bg-slate-200 shrink-0" />
                    <div className="overflow-hidden">
                      <div className={`text-xs font-bold truncate ${currentProject?.id === proj.id ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{proj.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{proj.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-white/5">
                <Link href="/projects" onClick={() => setIsDropdownOpen(false)} className="w-full text-center py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors block">
                  Ver Todos los Mundos
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* 1. Main Navigation */}
      <nav className="space-y-1.5 px-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-2">Menú Principal</div>

        <Link href="/" className={`flex items-center gap-3 py-2.5 rounded-xl transition-colors hover:bg-slate-200/50 text-slate-500 font-medium ${isOpen ? 'px-3' : 'justify-center'}`} title="Dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          {isOpen && <span className="text-sm whitespace-nowrap overflow-hidden">Dashboard</span>}
        </Link>
        <Link href="/projects" className={`flex items-center gap-3 py-2.5 rounded-xl transition-colors hover:bg-slate-200/50 text-slate-500 font-medium ${isOpen ? 'px-3' : 'justify-center'}`} title="Proyectos">
          <span className="material-symbols-outlined">folder_shared</span>
          {isOpen && <span className="text-sm whitespace-nowrap overflow-hidden">Proyectos</span>}
        </Link>
        <Link href="/calendar" className={`flex items-center gap-3 py-2.5 rounded-xl transition-colors hover:bg-slate-200/50 text-slate-500 font-medium ${isOpen ? 'px-3' : 'justify-center'}`} title="Calendario">
          <span className="material-symbols-outlined">calendar_today</span>
          {isOpen && <span className="text-sm whitespace-nowrap overflow-hidden">Calendario</span>}
        </Link>
        <Link href="/finance" className={`flex items-center gap-3 py-2.5 rounded-xl transition-colors hover:bg-slate-200/50 text-slate-500 font-medium ${isOpen ? 'px-3' : 'justify-center'}`} title="Finanzas">
          <span className="material-symbols-outlined">payments</span>
          {isOpen && <span className="text-sm whitespace-nowrap overflow-hidden">Finanzas</span>}
        </Link>
        <Link href="/settings" className={`flex items-center gap-3 py-2.5 rounded-xl transition-colors hover:bg-slate-200/50 text-slate-500 font-medium ${isOpen ? 'px-3' : 'justify-center'}`} title="Ajustes">
          <span className="material-symbols-outlined">settings</span>
          {isOpen && <span className="text-sm whitespace-nowrap overflow-hidden">Ajustes</span>}
        </Link>
      </nav>

      {/* 2. Project Context Section (Layers + Actions) */}
      {isOpen && currentProject && (
        <div className="mt-10 px-2 animate-in fade-in slide-in-from-left-4 duration-500 flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capas Activas</span>
              <span className="material-symbols-outlined text-xs text-slate-400">layers</span>
            </div>
            <div className="space-y-3 px-1">
              {(projectCampaigns[currentProject.id] || []).map((camp) => {
                const isVisible = !hiddenCampaignIds.includes(camp.id);
                return (
                  <div 
                    key={camp.id}
                    onClick={() => toggleCampaignVisibility(camp.id)}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${isVisible ? 'bg-primary border-primary ring-2 ring-primary/20' : 'border-slate-300 dark:border-slate-800'}`}>
                      {isVisible && <span className="material-symbols-outlined text-[8px] text-white font-bold">check</span>}
                    </div>
                    <span className={`text-[11px] font-bold transition-colors ${isVisible ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500/60'}`}>
                      {camp.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full ink-gradient text-white py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-widest shadow-lg shadow-primary-container/10 flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all">
            <span className="material-symbols-outlined text-sm">add</span>
            Nueva Campaña
          </button>
        </div>
      )}

      
      <div className="mt-auto px-2 flex flex-col items-center gap-4 mb-4">
        {isOpen && (
          <div className="bg-slate-200/40 dark:bg-slate-900/50 border border-slate-300/30 dark:border-white/5 backdrop-blur-md p-3.5 rounded-2xl w-full relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-1.5 grayscale group-hover:grayscale-0 transition-all">
              <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
              <div className="text-[10px] font-extrabold text-on-surface uppercase tracking-tighter">Control de Realidad</div>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Cruzando márgenes tácticos hoy.</p>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined text-5xl">insights</span>
            </div>
          </div>
        )}
        
        {/* Toggle Button over the bottom */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 hover:text-slate-800 bg-surface-container-low hover:bg-surface-container rounded-full transition-colors flex items-center justify-center w-8 h-8"
          title="Colapsar menú"
        >
          <span className="material-symbols-outlined text-sm">{isOpen ? 'keyboard_double_arrow_left' : 'keyboard_double_arrow_right'}</span>
        </button>
      </div>
    </motion.aside>
  );
}
