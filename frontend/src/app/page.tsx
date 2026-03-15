'use client';

import React, { useEffect, useState, useMemo } from 'react';
import UploadPanel from '@/components/UploadPanel';
import TaskList from '@/components/TaskList';
import ConfirmationModal from '@/components/ConfirmationModal';
import { Activity, CalendarDays, CheckCircle2, Filter, Info, ShieldCheck } from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingConfirmationTask, setPendingConfirmationTask] = useState<any>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  const fetchTasks = async (category?: string) => {
    setIsLoading(true);
    try {
      const url = category 
        ? `http://localhost:8000/api/v1/tasks?category=${category}`
        : 'http://localhost:8000/api/v1/tasks';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUploadComplete = (task: any) => {
    if (task.confidence < 0.7) {
      setPendingConfirmationTask(task);
      setIsEditingExisting(false);
      setIsModalOpen(true);
    } else {
      fetchTasks();
    }
  };

  const handleConfirmTask = async (task: any) => {
    try {
      if (isEditingExisting) {
        // Update existing
        const response = await fetch(`http://localhost:8000/api/v1/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        if (!response.ok) throw new Error("Failed to update task");
      } else {
        // This was a low-confidence upload that we are now confirming
        // In this simple implementation, the backend already saved it as 'pending'.
        // We just need to update it with the user's edits and set confidence to 1.0
        const response = await fetch(`http://localhost:8000/api/v1/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...task, confidence: 1.0 })
        });
        if (!response.ok) throw new Error("Failed to confirm task");
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await fetch(`http://localhost:8000/api/v1/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      fetchTasks();
    }
  };

  const handleEditTask = (task: any) => {
    setPendingConfirmationTask(task);
    setIsEditingExisting(true);
    setIsModalOpen(true);
  };

  const handleTaskComplete = async (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
    try {
      await fetch(`http://localhost:8000/api/v1/tasks/${id}/complete`, { method: 'PATCH' });
    } catch (error) {
      console.error('Failed to mark task as complete:', error);
      fetchTasks();
    }
  };

  const categories = ["Bills", "Study", "Appointments", "Subscriptions", "Personal", "Work"];

  // Filter logic
  const filteredPending = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && (!selectedCategory || t.category === selectedCategory));
  }, [tasks, selectedCategory]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => t.status === 'completed' && (!selectedCategory || t.category === selectedCategory));
  }, [tasks, selectedCategory]);

  // Upcoming Widget Logic
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'completed' && t.deadline)
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 3);
  }, [tasks]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 pt-16">
      <ConfirmationModal 
        isOpen={isModalOpen}
        task={pendingConfirmationTask}
        onConfirm={handleConfirmTask}
        onCancel={() => setIsModalOpen(false)}
      />

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-indigo-400 mb-2 mt-4 inline-block">
            Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Intelligent Life Administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatBadge icon={<Activity className="w-5 h-5 text-indigo-400" />} label="Pending" value={tasks.filter(t => t.status !== 'completed').length} />
          <StatBadge icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} label="Done" value={tasks.filter(t => t.status === 'completed').length} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        <div className="lg:col-span-5 flex flex-col gap-10">
          <UploadPanel onUploadComplete={handleUploadComplete} />

          {/* Upcoming tasks widget */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col gap-4 overflow-hidden relative">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-slate-200 font-bold">Upcoming</h3>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Priority View</span>
             </div>
             
             <div className="space-y-3">
                {upcomingTasks.length > 0 ? upcomingTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/50">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-indigo-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {isToday(parseISO(t.deadline)) ? <span className="text-amber-500">Today</span> : 
                         isTomorrow(parseISO(t.deadline)) ? "Tomorrow" : 
                         format(parseISO(t.deadline), 'MMM d')}
                      </p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic py-2">No upcoming deadlines.</p>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-col gap-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-200">Action Items</h2>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 bg-slate-800/30 px-3 py-2 rounded-full border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> AI Confidence Active
              </div>
            </div>

            {/* Category selection */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
               <button 
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${!selectedCategory ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
               >
                 All Tasks
               </button>
               {categories.map(cat => (
                 <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${selectedCategory === cat ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800/50"></div>
              <div className="h-32 bg-slate-900 rounded-2xl border border-slate-800/50 opacity-70"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredPending.length > 0 ? (
                <TaskList 
                  tasks={filteredPending} 
                  onComplete={handleTaskComplete} 
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
              ) : (
                <div className="py-20 text-center bg-slate-900/40 rounded-3xl border border-slate-800/40 border-dashed">
                   <Filter className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                   <p className="text-slate-500 font-medium">No tasks found in this category.</p>
                </div>
              )}

              {completedTasks.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5" /> History
                  </h3>
                  <div className="opacity-70 grayscale">
                    <TaskList 
                      tasks={completedTasks} 
                      onComplete={handleTaskComplete} 
                      onDelete={handleDeleteTask}
                      onEdit={handleEditTask}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const StatBadge = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm">
    <div className="bg-slate-800/50 p-1.5 rounded-lg">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold leading-none text-slate-200">{value}</p>
    </div>
  </div>
);
