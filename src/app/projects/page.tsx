"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/context/ProjectContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PROJECT_KPIS } from "@/data/kpis";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCENT_OPTIONS = [
  { label: "Naranja",  value: "bg-[#E67E22]", hex: "#E67E22" },
  { label: "Azul",     value: "bg-[#3498DB]", hex: "#3498DB" },
  { label: "Verde",    value: "bg-[#2ECC71]", hex: "#2ECC71" },
  { label: "Morado",   value: "bg-[#9B59B6]", hex: "#9B59B6" },
  { label: "Rosa",     value: "bg-[#E91E63]", hex: "#E91E63" },
  { label: "Rojo",     value: "bg-[#E74C3C]", hex: "#E74C3C" },
  { label: "Cyan",     value: "bg-[#1ABC9C]", hex: "#1ABC9C" },
  { label: "Amarillo", value: "bg-[#F1C40F]", hex: "#F1C40F" },
];

const CATEGORY_OPTIONS = [
  "Gastronomía", "Construcción", "Creatividad", "FinTech",
  "Ecommerce", "Salud", "Moda", "Educación", "Retail", "Tecnología", "Otro",
];

// ─── Sortable Card ────────────────────────────────────────────────────────────

function SortableCard({
  project,
  isActive,
  isDraggingAny,
  onSelect,
  onEdit,
  onDeleteRequest,
}: {
  project: any;
  isActive: boolean;
  isDraggingAny: boolean;
  onSelect: (p: any) => void;
  onEdit: (p: any) => void;
  onDeleteRequest: (p: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/card">
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2.5 right-2.5 z-10 p-1 rounded-lg cursor-grab active:cursor-grabbing text-outline/30 hover:text-outline/70 hover:bg-surface-container transition-all opacity-0 group-hover/card:opacity-100"
        title="Arrastrar"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="material-symbols-outlined text-[14px]">drag_indicator</span>
      </div>

      {/* Action buttons (edit / delete) — appear on hover */}
      <div className="absolute bottom-2.5 right-2 z-10 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-all">
        {/* Edit */}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(project); }}
          className="p-1 rounded-lg bg-surface-container/80 backdrop-blur-sm hover:bg-primary/10 hover:text-primary text-outline/50 transition-all"
          title="Editar proyecto"
        >
          <span className="material-symbols-outlined text-[13px]">edit</span>
        </button>
        {/* Delete */}
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteRequest(project); }}
          className="p-1 rounded-lg bg-surface-container/80 backdrop-blur-sm hover:bg-red-50 hover:text-red-500 text-outline/50 transition-all"
          title="Eliminar proyecto"
        >
          <span className="material-symbols-outlined text-[13px]">delete</span>
        </button>
      </div>

      {/* Card body */}
      <div
        onClick={() => !isDraggingAny && onSelect(project)}
        className={`relative bg-surface-container-lowest rounded-2xl p-4 pt-3 cursor-pointer transition-all duration-200 overflow-hidden border-2 select-none ${
          isActive
            ? "border-primary shadow-lg shadow-primary/10"
            : "border-transparent hover:border-outline-variant/20 hover:shadow-md"
        }`}
      >
        {/* Color strip */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${project.accent} rounded-t-2xl`} />

        {/* Active badge */}
        {isActive && (
          <div className="absolute top-3 left-3 bg-primary text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider">
            Activo
          </div>
        )}

        {/* Logo */}
        <div className={`mb-2 ${isActive ? "mt-5" : "mt-3"}`}>
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-container-low shadow-sm">
            <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <h3 className="text-[13px] font-extrabold text-primary leading-tight truncate mb-0.5 pr-5">
          {project.name}
        </h3>
        <p className="text-[10px] text-outline truncate">{project.category}</p>

        {/* Color palette */}
        <div className="flex gap-1 mt-2.5">
          {project.colors?.slice(0, 4).map((color: string, idx: number) => (
            <div key={idx} className={`w-4 h-1.5 rounded-full ${color}`} />
          ))}
        </div>

        {/* Mini KPI chips */}
        {(() => {
          const kpis = (PROJECT_KPIS[project.id] || []).slice(0, 3);
          if (!kpis.length) return null;
          return (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {kpis.map((kpi) => {
                const isCost = kpi.unit === 'S/' && kpi.label.toLowerCase().includes('costo');
                const good = isCost ? kpi.trend <= 0 : kpi.trend >= 0;
                return (
                  <span key={kpi.id} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[8px] font-black ${good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    <span className="material-symbols-outlined text-[8px]">{good ? 'arrow_upward' : 'arrow_downward'}</span>
                    {kpi.value}
                  </span>
                );
              })}
            </div>
          );
        })()}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Ghost preview card ───────────────────────────────────────────────────────

function DragPreviewCard({ project }: { project: any }) {
  return (
    <div className="relative bg-surface-container-lowest rounded-2xl p-4 border-2 border-primary/40 shadow-2xl shadow-primary/20 opacity-95 rotate-2 scale-105 min-w-[140px]">
      <div className={`absolute top-0 left-0 right-0 h-1 ${project.accent} rounded-t-2xl`} />
      <div className="mt-3 mb-2">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-container-low shadow-sm">
          <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
        </div>
      </div>
      <h3 className="text-[13px] font-extrabold text-primary leading-tight truncate">{project.name}</h3>
      <p className="text-[10px] text-outline truncate">{project.category}</p>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmDeleteModal({
  project,
  onConfirm,
  onCancel,
  busy,
}: {
  project: any;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: "spring", damping: 28, stiffness: 350 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 pointer-events-auto text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-red-500 text-xl">delete_forever</span>
          </div>
          <h3 className="text-base font-extrabold text-primary mb-1">¿Eliminar proyecto?</h3>
          <p className="text-sm text-outline mb-1">
            Vas a eliminar <span className="font-bold text-primary">{project.name}</span>.
          </p>
          <p className="text-xs text-outline/60 mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-outline-variant/20 text-sm font-bold text-outline hover:bg-surface-container-low transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={busy}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Sí, eliminar
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Project Form Modal (create & edit) ──────────────────────────────────────

function ProjectFormModal({
  initial,
  onSave,
  onClose,
  busy,
}: {
  initial: { name: string; category: string; subtitle: string; accent: typeof ACCENT_OPTIONS[0] } | null;
  onSave: (data: any) => void;
  onClose: () => void;
  busy: boolean;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial ?? { name: "", category: "Gastronomía", subtitle: "", accent: ACCENT_OPTIONS[0] }
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md p-6 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-extrabold text-primary font-headline">
                {isEdit ? "Editar Proyecto" : "Crear Proyecto"}
              </h3>
              <p className="text-[11px] text-outline mt-0.5">
                {isEdit ? "Modifica los datos del proyecto" : "Nuevo mundo en el portafolio"}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container-low transition-colors text-outline">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 block">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && onSave(form)}
                placeholder="Ej: Sunset Lounge Bar"
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm font-bold text-primary placeholder:text-outline/40 border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                autoFocus
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 block">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm font-bold text-primary border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              >
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 block">Subtítulo</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                placeholder="Ej: Gastronomía Latina y Coctelería"
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm font-bold text-primary placeholder:text-outline/40 border border-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5 block">Color de Acento</label>
              <div className="flex gap-2 flex-wrap">
                {ACCENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, accent: opt })}
                    title={opt.label}
                    className={`w-7 h-7 rounded-full ${opt.value} transition-all ${
                      form.accent.value === opt.value
                        ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                        : "hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-5 p-3 rounded-2xl border border-outline-variant/10 bg-surface-container-lowest flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${form.accent.value} flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0`}>
              {form.name ? form.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase() : "?"}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-extrabold text-primary truncate">{form.name || "Nombre del Proyecto"}</div>
              <div className="text-[10px] text-outline truncate">{form.category}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-outline-variant/20 text-sm font-bold text-outline hover:bg-surface-container-low transition-colors">
              Cancelar
            </button>
            <button
              onClick={() => onSave(form)}
              disabled={!form.name.trim() || busy}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">{isEdit ? "save" : "add"}</span>
                  {isEdit ? "Guardar" : "Crear"}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Projects() {
  const router = useRouter();
  const { projects, currentProject, setCurrentProject } = useProject();

  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);

  // Sync order from localStorage
  useEffect(() => {
    if (projects.length === 0) return;
    const saved = localStorage.getItem("mrk-project-order");
    if (saved) {
      const parsed: string[] = JSON.parse(saved);
      const existingIds = projects.map((p) => p.id);
      const merged = [
        ...parsed.filter((id) => existingIds.includes(id)),
        ...existingIds.filter((id) => !parsed.includes(id)),
      ];
      setOrderedIds(merged);
    } else {
      setOrderedIds(projects.map((p) => p.id));
    }
  }, [projects]);

  const orderedProjects = orderedIds
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean) as any[];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIdx = orderedIds.indexOf(active.id as string);
    const newIdx = orderedIds.indexOf(over.id as string);
    const newOrder = arrayMove(orderedIds, oldIdx, newIdx);
    setOrderedIds(newOrder);
    localStorage.setItem("mrk-project-order", JSON.stringify(newOrder));
    window.dispatchEvent(new Event("project-order-changed"));
  };

  const handleSelectProject = (proj: any) => {
    setCurrentProject(proj);
    router.push("/");
  };

  // ── CREATE ──
  const handleCreate = async (form: any) => {
    setBusy(true);
    try {
      const id = Date.now().toString();
      const initials = form.name.split(" ").map((w: string) => w[0]).join("").slice(0, 3).toUpperCase();
      const hex = form.accent.hex.replace("#", "");
      const newProject = {
        id,
        name: form.name.trim(),
        category: form.category,
        subtitle: form.subtitle.trim() || form.category,
        accent: form.accent.value,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${hex}&color=fff`,
        colors: [form.accent.value, "bg-slate-800", "bg-slate-100", "bg-white"],
      };
      await setDoc(doc(db, "projects", id), newProject);
      setShowCreate(false);
    } finally {
      setBusy(false);
    }
  };

  // ── EDIT ──
  const handleEdit = async (form: any) => {
    if (!editTarget) return;
    setBusy(true);
    try {
      const initials = form.name.split(" ").map((w: string) => w[0]).join("").slice(0, 3).toUpperCase();
      const hex = form.accent.hex.replace("#", "");
      const updates = {
        name: form.name.trim(),
        category: form.category,
        subtitle: form.subtitle.trim() || form.category,
        accent: form.accent.value,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${hex}&color=fff`,
        colors: [form.accent.value, "bg-slate-800", "bg-slate-100", "bg-white"],
      };
      await updateDoc(doc(db, "projects", editTarget.id), updates);
      setEditTarget(null);
    } finally {
      setBusy(false);
    }
  };

  // ── DELETE ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, "projects", deleteTarget.id));
      if (currentProject?.id === deleteTarget.id) setCurrentProject(null);
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  // Build initial values for edit modal
  const editInitial = editTarget
    ? {
        name: editTarget.name,
        category: editTarget.category,
        subtitle: editTarget.subtitle || "",
        accent: ACCENT_OPTIONS.find((o) => o.value === editTarget.accent) ?? ACCENT_OPTIONS[0],
      }
    : null;

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <section className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight text-primary">Portafolio</h2>
            <p className="text-secondary text-sm mt-0.5 flex items-center gap-1.5">
              {projects.length} {projects.length === 1 ? "proyecto activo" : "proyectos activos"}
              <span className="text-[10px] text-outline/60 font-medium">• Arrastra para reordenar</span>
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nuevo Proyecto
          </button>
        </div>

        {/* Drag-and-drop grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={orderedIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {orderedProjects.map((project) => (
                <SortableCard
                  key={project.id}
                  project={project}
                  isActive={currentProject?.id === project.id}
                  isDraggingAny={!!activeId}
                  onSelect={handleSelectProject}
                  onEdit={setEditTarget}
                  onDeleteRequest={setDeleteTarget}
                />
              ))}

              {/* Add new */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
                className="group border-2 border-dashed border-outline-variant/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:bg-primary/[0.03] transition-all min-h-[145px]"
              >
                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-sm">add</span>
                </div>
                <span className="text-xs font-bold text-outline group-hover:text-primary transition-colors">Nuevo</span>
              </motion.div>
            </div>
          </SortableContext>

          <DragOverlay>
            {activeProject ? <DragPreviewCard project={activeProject} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <ProjectFormModal
            key="create"
            initial={null}
            onSave={handleCreate}
            onClose={() => setShowCreate(false)}
            busy={busy}
          />
        )}
        {editTarget && (
          <ProjectFormModal
            key="edit"
            initial={editInitial}
            onSave={handleEdit}
            onClose={() => setEditTarget(null)}
            busy={busy}
          />
        )}
        {deleteTarget && (
          <ConfirmDeleteModal
            key="delete"
            project={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            busy={busy}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
