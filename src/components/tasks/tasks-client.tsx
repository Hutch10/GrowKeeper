"use client";

import { useState, useTransition, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { SpecimenDetailPanel } from "@/components/dashboard/specimen-detail-panel";
import { CheckCircle2, Clock, Calendar, CheckCircle, Search, Leaf } from "lucide-react";
import { markTaskComplete } from "@/app/actions/tasks";
import { formatDate } from "@/lib/date";
import type { SpecimenRow } from "@/app/actions/types";
import { type Database } from "@/types/database";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

interface TasksClientProps {
  initialTasks: TaskRow[];
  specimens: SpecimenRow[];
}

const TASK_CONFIG: Record<string, { emoji: string; label: string }> = {
  watered: { emoji: "💧", label: "Watering" },
  fertilized: { emoji: "🌱", label: "Fertilizing" },
  prune: { emoji: "✂️", label: "Pruning" },
  repot: { emoji: "🪴", label: "Repotting" },
  inspect: { emoji: "🔍", label: "Inspection" },
};

export function TasksClient({ initialTasks, specimens }: TasksClientProps) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [activeTab, setActiveTab] = useState<"todo" | "completed">("todo");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    tasks.find(t => !t.completed)?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);
  const selectedSpecimen = specimens.find((p) => p.id === selectedTask?.specimen_id);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const isStatusMatch = activeTab === "todo" ? !t.completed : t.completed;
      const specimen = specimens.find((p) => p.id === t.specimen_id);
      const isSearchMatch = 
        t.task_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        specimen?.nickname.toLowerCase().includes(searchQuery.toLowerCase());
      return isStatusMatch && isSearchMatch;
    });
  }, [tasks, activeTab, searchQuery, specimens]);

  const handleComplete = async (taskId: string, plantId: string) => {
    startTransition(async () => {
      const result = await markTaskComplete(taskId, plantId);
      if (result.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: true } : t));
        if (selectedTaskId === taskId) {
          setSelectedTaskId(null);
        }
      }
    });
  };

  return (
    <div className="flex h-screen bg-brand-cream overflow-hidden text-brand-forest">
      <Sidebar className="w-72 shrink-0 border-r border-brand-forest/10" />

      <main className="flex-1 flex flex-col min-w-0 bg-white/40 backdrop-blur-xl">
        <DashboardHeader title="Task Manager" />

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">My Tasks</h1>
                <p className="text-brand-forest/60 font-bold">Manage your botanical care routine</p>
              </div>

              <div className="flex bg-brand-forest/5 p-1 rounded-2xl border border-brand-forest/10 p-1.5 self-start">
                <button
                  onClick={() => setActiveTab("todo")}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
                    activeTab === "todo" 
                      ? "bg-white text-brand-forest shadow-xl scale-105" 
                      : "text-brand-forest/40 hover:text-brand-forest"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  To Do
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${
                    activeTab === "completed" 
                      ? "bg-white text-brand-forest shadow-xl scale-105" 
                      : "text-brand-forest/40 hover:text-brand-forest"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-forest/30 group-focus-within:text-brand-pink-dark transition-colors" />
                <input
                  type="text"
                  placeholder="Search tasks or specimens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-brand-forest/5 rounded-3xl outline-none focus:border-brand-pink-dark focus:ring-4 focus:ring-brand-pink-light/20 transition-all font-bold placeholder:text-brand-forest/20"
                />
              </div>
            </div>

            {/* Task List */}
            <div className="grid gap-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const config = TASK_CONFIG[task.task_type] || { emoji: "📋", label: task.task_type };
                  const specimen = specimens.find((p) => p.id === task.specimen_id);
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;
                  const isSelected = selectedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`group relative flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all cursor-pointer overflow-hidden ${
                        isSelected 
                          ? "bg-white border-brand-pink shadow-2xl shadow-brand-pink/10 scale-[1.02]" 
                          : "bg-white/60 border-brand-forest/5 hover:border-brand-pink/30 hover:bg-white"
                      }`}
                    >
                      {/* Completion status indicator */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!task.completed) handleComplete(task.id, task.specimen_id);
                        }}
                        disabled={isPending || task.completed}
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all border-2 shrink-0 ${
                          task.completed 
                            ? "bg-brand-green border-brand-green text-white" 
                            : isOverdue
                              ? "bg-red-50 border-red-200 text-red-400 hover:border-red-500"
                              : "bg-brand-pink-light/30 border-brand-pink/20 text-brand-pink-dark hover:border-brand-pink-dark hover:bg-white"
                        }`}
                      >
                        {task.completed ? <CheckCircle className="w-6 h-6" /> : <div className="w-3 h-3 rounded-full bg-current" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{config.emoji}</span>
                          <h3 className={`text-xl font-black ${task.completed ? "text-brand-forest/40 line-through" : "text-brand-forest"}`}>
                            {config.label}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold flex items-center gap-1.5 text-brand-forest/60">
                            <Leaf className="w-4 h-4 text-brand-green" />
                            {specimen?.nickname || "Unknown Specimen"}
                          </span>
                          {task.due_date && (
                            <span className={`text-sm font-bold flex items-center gap-1.5 ${isOverdue ? "text-red-500" : "text-brand-forest/40"}`}>
                              <Calendar className="w-4 h-4" />
                              {formatDate(task.due_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      {isOverdue && (
                        <div className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full rotate-12 absolute -right-2 -top-2">
                          Overdue
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-24 h-24 bg-brand-pink-light rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-12 h-12 text-brand-pink-dark" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-dark mb-2">
                    {searchQuery ? "No matching tasks" : activeTab === "todo" ? "All caught up!" : "No completed tasks yet"}
                  </h3>
                  <p className="text-brand-dark/40 font-bold max-w-md">
                    {searchQuery ? "Try a different search term" : "Your specimens are happy and healthy."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="flex items-start sticky top-0 h-screen p-4 pr-6 shrink-0 border-l border-brand-forest/10">
        <SpecimenDetailPanel 
          specimen={selectedSpecimen}
        />
      </div>
    </div>
  );
}
