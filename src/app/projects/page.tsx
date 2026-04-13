"use client";

import Image from "next/image";
import { useProject } from "@/context/ProjectContext";

export default function Projects() {
  const { projects } = useProject();
  return (
    <section className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto">
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-headline font-extrabold tracking-tight text-primary">Mundos del Portafolio</h2>
            <p className="text-secondary max-w-lg text-lg">Curaduría de paisajes estratégicos activos. Gestiona tus huellas digitales con precisión.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200 flex items-center justify-center text-[10px] font-bold">12</div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-300"></div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-400"></div>
            </div>
            <span className="text-xs font-bold text-outline tracking-wider uppercase">Equipos Activos</span>
          </div>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`group bg-surface-container-lowest rounded-xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col relative overflow-hidden ${
                project.large ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${project.accent}`}></div>
              <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center overflow-hidden">
                  <img alt={project.name} src={project.logo} className="w-full h-full object-cover" />
                </div>
                <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  {project.category}
                </span>
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-headline font-bold text-primary mb-1">{project.name}</h3>
                <p className="text-slate-500 text-sm">{project.subtitle}</p>
              </div>
              <div className="mt-auto">
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3">Identidad de Color</p>
                <div className="flex gap-2">
                  {project.colors.map((color, idx) => (
                    <div key={idx} className={`w-8 h-4 rounded-sm ${color}`}></div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add New World Placeholder */}
          <div className="group border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary-fixed-dim hover:bg-surface-container-low transition-all">
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-outline group-hover:text-primary">add</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-slate-700">Crear Nuevo Mundo</h3>
            <p className="text-slate-400 text-xs mt-1 max-w-[140px]">Inicia un nuevo proyecto curado para un cliente</p>
          </div>
        </div>

        {/* Secondary Strategy Timeline */}
        <div className="mt-20 border-t border-outline-variant/10 pt-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-headline font-extrabold text-primary">Hitos Estratégicos</h3>
            <span className="text-xs font-bold text-outline tracking-wider uppercase">Hoja de Ruta Q4</span>
          </div>
          <div className="relative pl-8 border-l border-outline-variant/20 space-y-12 pb-12">
            <div className="relative">
              <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-surface shadow-sm"></div>
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm inline-block max-w-md ml-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-0.5 rounded">12 Oct</span>
                  <h4 className="font-bold text-primary">Lanzamiento EcoConstruct</h4>
                </div>
                <p className="text-secondary text-sm">Lanzamiento inicial de marca y sincronización de presencia social.</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -left-[37px] top-1 w-4 h-4 rounded-full bg-surface-variant border-4 border-surface shadow-sm"></div>
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm inline-block max-w-md ml-4 opacity-60">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded">04 Nov</span>
                  <h4 className="font-bold text-primary">Auditoría Visual Lumina</h4>
                </div>
                <p className="text-secondary text-sm">Revisión exhaustiva de métricas de medios experimentales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
