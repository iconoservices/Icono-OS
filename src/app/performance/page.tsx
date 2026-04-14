"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import {
  PROJECT_OKRS, PROJECT_KPIS,
  getOKRProgress, getKRProgress, statusConfig,
  type OKR, type KPI,
} from "@/data/kpis";

// ─── Progress Ring SVG ────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 64, stroke = 5, color = "stroke-primary" }: {
  pct: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-outline-variant/10" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
        strokeDasharray={circ} strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className={color}
      />
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ kpi }: { kpi: KPI }) {
  const isPositive = kpi.trend >= 0;
  // For cost metrics, down is good
  const isCostMetric = kpi.unit === "S/" && kpi.label.toLowerCase().includes("costo");
  const goodTrend = isCostMetric ? !isPositive : isPositive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-[18px] ${kpi.iconColor}`}>{kpi.icon}</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
          goodTrend ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }`}>
          <span className="material-symbols-outlined text-[10px]">{isPositive ? "arrow_upward" : "arrow_downward"}</span>
          {Math.abs(kpi.trend)}%
        </span>
      </div>
      <div className="text-2xl font-extrabold text-primary font-headline leading-none mb-1">{kpi.value}</div>
      <div className="text-[10px] font-bold text-outline uppercase tracking-widest">{kpi.label}</div>

      {/* Mini activity bar */}
      <div className="mt-3 flex gap-0.5 items-end h-6">
        {[40, 65, 50, 80, 60, 90, 75, 82, 70, 95, 85, 100].map((h, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.03, duration: 0.4 }}
            className={`flex-1 rounded-sm origin-bottom ${goodTrend ? 'bg-emerald-400/40' : 'bg-red-400/40'}`}
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── OKR Card ─────────────────────────────────────────────────────────────────

function OkrCard({ okr }: { okr: OKR }) {
  const progress = getOKRProgress(okr);
  const sc = statusConfig(okr.status);
  const ringColor = okr.status === "achieved" ? "stroke-primary" : okr.status === "on-track" ? "stroke-emerald-500" : "stroke-red-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="relative shrink-0">
          <ProgressRing pct={progress} size={58} stroke={5} color={ringColor} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-primary">{progress}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${sc.bg} ${sc.text} flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
            <span className="text-[9px] font-bold text-outline">{okr.quarter}</span>
          </div>
          <h3 className="text-sm font-extrabold text-primary leading-snug">{okr.objective}</h3>
        </div>
      </div>

      {/* Key Results */}
      <div className="space-y-3">
        {okr.keyResults.map((kr) => {
          const pct = getKRProgress(kr);
          const done = pct >= 100;
          return (
            <div key={kr.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-on-surface-variant truncate pr-2 flex items-center gap-1.5">
                  {done && <span className="material-symbols-outlined text-[12px] text-emerald-500">check_circle</span>}
                  {kr.metric}
                </span>
                <span className="text-[10px] font-black text-primary shrink-0">
                  {kr.current.toLocaleString("es-PE")}{kr.unit !== "#" && kr.unit !== "%" ? ` ${kr.unit}` : kr.unit === "%" ? "%" : ""} / {kr.target.toLocaleString("es-PE")}
                </span>
              </div>
              <div className="h-1.5 w-full bg-outline-variant/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full ${done ? "bg-emerald-500" : okr.status === "at-risk" ? "bg-red-400" : "bg-primary"}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Channel Bar ──────────────────────────────────────────────────────────────

function ChannelBars() {
  const channels = [
    { name: "TikTok",    pct: 38, color: "bg-slate-900",   icon: "music_note" },
    { name: "Instagram", pct: 29, color: "bg-rose-500",    icon: "photo_camera" },
    { name: "Facebook",  pct: 18, color: "bg-blue-600",    icon: "social_leaderboard" },
    { name: "YouTube",   pct: 10, color: "bg-red-500",     icon: "smart_display" },
    { name: "LinkedIn",  pct: 5,  color: "bg-blue-800",    icon: "work" },
  ];
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
      <h3 className="text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">pie_chart</span>
        Distribución por Canal
      </h3>
      <div className="space-y-3">
        {channels.map((ch) => (
          <div key={ch.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-outline">{ch.icon}</span>
                <span className="text-xs font-bold text-on-surface-variant">{ch.name}</span>
              </div>
              <span className="text-xs font-black text-primary">{ch.pct}%</span>
            </div>
            <div className="h-2 bg-outline-variant/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ch.pct}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`h-full rounded-full ${ch.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Heatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap() {
  // 5 weeks × 7 days = 35 cells
  const activity = [
    0,1,2,3,1,0,0,
    1,2,3,2,1,2,0,
    0,1,2,3,3,1,0,
    2,3,3,2,2,3,1,
    1,2,1,3,2,0,0,
  ];
  const colors = ["bg-outline-variant/10", "bg-primary/20", "bg-primary/50", "bg-primary"];
  const days = ["L","M","M","J","V","S","D"];

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
      <h3 className="text-sm font-extrabold text-primary mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">calendar_month</span>
        Actividad del Mes
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map((d) => <div key={d} className="text-center text-[9px] font-bold text-outline">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {activity.map((level, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.015, duration: 0.2 }}
            className={`h-6 rounded-md ${colors[level]} hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer`}
            title={`${level} piezas`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[9px] text-outline font-medium">Menos</span>
        {colors.map((c, i) => <div key={i} className={`w-3 h-3 rounded ${c}`} />)}
        <span className="text-[9px] text-outline font-medium">Más</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Performance() {
  const { projects, currentProject, setCurrentProject } = useProject();
  const [activeTab, setActiveTab] = useState<"okrs" | "kpis">("okrs");

  const pid = currentProject?.id || "2";
  const okrs = PROJECT_OKRS[pid] || [];
  const kpis = PROJECT_KPIS[pid] || [];

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-primary font-headline leading-none mb-1">
              Control de Rendimiento
            </h1>
            <p className="text-sm text-secondary font-medium">OKRs y KPIs del portafolio activo</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Project selector chips */}
            <div className="flex gap-2 flex-wrap">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setCurrentProject(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${
                    currentProject?.id === p.id
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "border-outline-variant/20 text-on-surface-variant hover:border-primary/30 hover:text-primary"
                  }`}
                >
                  <img src={p.logo} alt="" className="w-4 h-4 rounded-full" />
                  {p.name}
                </button>
              ))}
            </div>

            {/* Tab switcher */}
            <div className="flex bg-surface-container-low p-0.5 rounded-full border border-outline-variant/10">
              <button
                onClick={() => setActiveTab("okrs")}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "okrs" ? "bg-white shadow-sm text-primary" : "text-outline hover:text-on-surface"
                }`}
              >
                OKRs
              </button>
              <button
                onClick={() => setActiveTab("kpis")}
                className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                  activeTab === "kpis" ? "bg-white shadow-sm text-primary" : "text-outline hover:text-on-surface"
                }`}
              >
                KPIs
              </button>
            </div>
          </div>
        </div>

        {/* ── Summary Chips ── */}
        {currentProject && (
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
              <div className={`w-6 h-6 rounded-lg ${currentProject.accent} flex items-center justify-center`}>
                <img src={currentProject.logo} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-outline uppercase tracking-widest">Proyecto Activo</div>
                <div className="text-xs font-extrabold text-primary">{currentProject.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
              <span className="material-symbols-outlined text-sm text-emerald-500">track_changes</span>
              <div>
                <div className="text-[9px] font-bold text-outline uppercase tracking-widest">OKRs Activos</div>
                <div className="text-xs font-extrabold text-primary">{okrs.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
              <span className="material-symbols-outlined text-sm text-blue-500">monitoring</span>
              <div>
                <div className="text-[9px] font-bold text-outline uppercase tracking-widest">KPIs Monitoreados</div>
                <div className="text-xs font-extrabold text-primary">{kpis.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── OKRs Tab ── */}
        {activeTab === "okrs" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {okrs.length > 0 ? okrs.map((okr) => (
              <OkrCard key={okr.id} okr={okr} />
            )) : (
              <div className="col-span-2 text-center py-16 border-2 border-dashed border-outline-variant/20 rounded-2xl">
                <span className="material-symbols-outlined text-4xl text-outline-variant/30 mb-2 block">track_changes</span>
                <p className="text-sm text-outline font-medium">Selecciona un proyecto para ver sus OKRs</p>
              </div>
            )}
          </div>
        )}

        {/* ── KPIs Tab ── */}
        {activeTab === "kpis" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
              {kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ChannelBars />
              <ActivityHeatmap />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
