"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Bell, Leaf, User, Plus, ChevronRight, Droplets, Sun, Flower2, MapPin, RefreshCw, Download } from "lucide-react";
import { SpecimenSummaryCard } from "../specimens/specimen-summary-card";
import { SpecimenListSkeleton } from "../ui/skeleton";
import { SystemSuggestions } from "./system-suggestions";
import { useSpecimenData } from "@/hooks/use-specimen-data";
import { useTaskData } from "@/hooks/use-task-data";
import { aggregateDashboardStats } from "@/lib/services/dashboard-stats";
import type { Specimen } from "@/types/specimen";
import type { SpecimenRow } from "@/app/actions/types";
import type { TaskRow } from "@/app/actions/tasks";
import { KPIStrip } from "./kpi-strip";
import { Sidebar } from "../layout/sidebar";
import { TipsSection } from "./tips-section";
import { AddSpecimenForm } from "../plants/add-specimen-form";
import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import NextImage from "next/image";

const ARTICLE_IMAGES = [
  "https://images.unsplash.com/photo-1585829319212-0a19af8e37d1?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1597055181300-e3633a207519?auto=format&fit=crop&q=80&w=800",
];

const FALLBACK_DETAIL_IMG =
  "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800";

function useClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function CommandCenter({
  initialSpecimens,
  initialTasks = [],
  errorMessage,
}: {
  initialSpecimens?: Specimen[];
  initialTasks?: TaskRow[];
  errorMessage?: string;
}) {
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string | null>(null);
  const [isAddWizardOpen, setIsAddWizardOpen] = useState(false);

  const {
    specimens: specimensFromHook,
    loading: specimensLoading,
    syncQueueSize,
    reconcile,
    isSyncing,
    errorMessage: specimenError,
  } = useSpecimenData(initialSpecimens as SpecimenRow[]);

  const specimens = specimensFromHook || initialSpecimens || [];
  const displayError = specimenError || errorMessage;

  const { tasks, loading: tasksLoading } = useTaskData(initialTasks);
  const stats = useMemo(
    () => aggregateDashboardStats(specimens as Specimen[], tasks),
    [specimens, tasks]
  );

  const exportQueuedData = useCallback(async () => {
    const { operationsDB } = await import("@/lib/pouchdb");
    const ops = await operationsDB.find({ selector: { status: "QUEUED_LOCAL" } });
    const data = JSON.stringify(ops.docs, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growkeeper_queue_${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const selectedSpecimen = useMemo(
    () =>
      (specimens.find((s) => s.id === selectedSpecimenId) ||
        specimens[0]) as SpecimenRow | undefined,
    [specimens, selectedSpecimenId]
  );

  const pendingTasks = useMemo(
    () =>
      tasks
        .filter((t: TaskRow) => t.specimen_id === selectedSpecimen?.id && !t.completed)
        .slice(0, 3),
    [tasks, selectedSpecimen]
  );

  const clock = useClock();

  return (
    <div className="flex h-screen bg-[#f5f3ee] font-sans overflow-hidden">
      <Sidebar />

      {/* Main area (everything right of sidebar) */}
      <div className="flex-1 flex flex-col ml-64 min-w-0 overflow-hidden">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-full flex items-center justify-center">
              <Sun className="w-5 h-5 text-yellow-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Welcome Back!</h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Sun className="w-4 h-4 text-yellow-400" />
            <span>{clock} · Sunny | 75°F</span>
          </div>

          <div className="flex items-center gap-3">
            {syncQueueSize > 0 && (
              <button
                type="button"
                onClick={reconcile}
                disabled={isSyncing}
                title={`${syncQueueSize} changes pending sync`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium hover:bg-amber-100 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                {syncQueueSize} pending
              </button>
            )}
            <button type="button" title="Notifications" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button type="button" title="Plants" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors">
              <Leaf className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center border border-slate-200">
              <User className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* ── Body: scrollable main + fixed right panel ── */}
        <div className="flex flex-1 min-h-0">

          {/* Scrollable main content */}
          <main className="flex-1 overflow-y-auto p-8 space-y-8">

            {/* KPI Strip */}
            <KPIStrip kpis={stats.kpis} />

            {/* Plant Overview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800">Plant Overview</h2>
                <button
                  type="button"
                  onClick={() => setIsAddWizardOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Plant
                </button>
              </div>

              {(specimensLoading || tasksLoading) ? (
                <SpecimenListSkeleton />
              ) : displayError && specimens.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
                  <p className="text-slate-500 text-sm mb-4">{displayError}</p>
                  {syncQueueSize > 0 && (
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={reconcile}
                        disabled={isSyncing}
                        className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-xl text-sm font-medium hover:bg-green-800 transition-colors"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                        Sync now
                      </button>
                      <button
                        type="button"
                        onClick={exportQueuedData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    </div>
                  )}
                </div>
              ) : specimens.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm mb-4">No plants yet. Add your first one!</p>
                  <SystemSuggestions onStartWizard={() => setIsAddWizardOpen(true)} />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {specimens.slice(0, 8).map((s) => (
                    <SpecimenSummaryCard
                      key={s.id}
                      specimen={s}
                      onClick={() => setSelectedSpecimenId(s.id)}
                      active={selectedSpecimenId === s.id || (!selectedSpecimenId && specimens[0]?.id === s.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Tips & Articles */}
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-4">Tips &amp; Articles</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "Propagation Tips", img: ARTICLE_IMAGES[0] },
                  { title: "Low Light Plants", img: ARTICLE_IMAGES[1] },
                ].map((article) => (
                  <button
                    key={article.title}
                    type="button"
                    className="group relative h-40 rounded-2xl overflow-hidden text-left"
                  >
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                      <NextImage src={article.img} alt={article.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-5 py-4">
                      <span className="text-sm font-bold text-white">{article.title}</span>
                      <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                        <ChevronRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </main>

          {/* ── Right Panel: Plant Details ── */}
          <aside className="w-72 flex-shrink-0 bg-white border-l border-slate-100 overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-800">Plant Details</h2>
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
              </div>

              {selectedSpecimen ? (
                <>
                  {/* Plant photo */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100">
                    <Image
                      src={selectedSpecimen.image_url || FALLBACK_DETAIL_IMG}
                      alt={selectedSpecimen.nickname}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  {/* Name */}
                  <h3 className="font-bold text-slate-800 text-base leading-tight">
                    {selectedSpecimen.nickname}
                  </h3>
                  {selectedSpecimen.species_name && (
                    <p className="text-xs text-slate-400 mt-0.5 mb-4">
                      {selectedSpecimen.species_name}
                    </p>
                  )}

                  {/* Care details */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 mb-4">
                    {[
                      {
                        icon: MapPin,
                        iconBg: "bg-green-100",
                        iconColor: "text-green-600",
                        label: "Location",
                        value: selectedSpecimen.location || "Not set",
                      },
                      {
                        icon: Sun,
                        iconBg: "bg-yellow-100",
                        iconColor: "text-yellow-600",
                        label: "Light",
                        value: (selectedSpecimen as SpecimenRow & { light?: string }).light || "Bright, Indirect",
                      },
                      {
                        icon: Droplets,
                        iconBg: "bg-blue-100",
                        iconColor: "text-blue-500",
                        label: "Watering",
                        value: (selectedSpecimen as SpecimenRow & { watering?: string }).watering || "Every 1 Week",
                      },
                      {
                        icon: Flower2,
                        iconBg: "bg-orange-100",
                        iconColor: "text-orange-500",
                        label: "Fertilizer",
                        value: (selectedSpecimen as SpecimenRow & { fertilizer?: string }).fertilizer || "Monthly",
                      },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${row.iconBg}`}>
                          <row.icon className={`w-3.5 h-3.5 ${row.iconColor}`} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-slate-500">{row.label}: </span>
                          <span className="text-xs text-slate-700 font-semibold">{row.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Care Reminders */}
                  {pendingTasks.length > 0 && (
                    <div className="border-t border-slate-100 pt-4">
                      <h4 className="text-xs font-bold text-slate-700 mb-3">Care Reminders</h4>
                      <div className="space-y-2.5">
                        {pendingTasks.map((t: TaskRow) => {
                          const daysUntil = t.due_date
                            ? Math.ceil((new Date(t.due_date).getTime() - Date.now()) / 86400000)
                            : null;
                          const overdue = daysUntil !== null && daysUntil < 0;
                          return (
                            <div key={t.id} className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${overdue ? "bg-red-100" : "bg-blue-100"}`}>
                                <Droplets className={`w-3.5 h-3.5 ${overdue ? "text-red-500" : "text-blue-500"}`} />
                              </div>
                              <span className="text-xs text-slate-700 font-medium flex-1 capitalize">{t.task_type}</span>
                              {daysUntil !== null && (
                                <span className={`text-xs font-semibold ${overdue ? "text-red-500" : "text-slate-400"}`}>
                                  {overdue ? `${Math.abs(daysUntil)}d late` : daysUntil === 0 ? "Today" : `in ${daysUntil}d`}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <Leaf className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-sm text-slate-400">Select a plant to see details</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Add plant wizard */}
      <AnimatePresence>
        {isAddWizardOpen && (
          <AddSpecimenForm
            isOpen={isAddWizardOpen}
            onClose={() => setIsAddWizardOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
