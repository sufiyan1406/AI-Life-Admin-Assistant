'use client';

import React, { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/tasks`);
            if (response.ok) setTasks(await response.json());
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const nextMonth = () => setCurrentDate(addDays(currentDate, 31));
    const prevMonth = () => setCurrentDate(addDays(currentDate, -31));

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }

    const getTasksForDay = (d: Date) => {
        return tasks.filter(t => t.deadline && isSameDay(parseISO(t.deadline), d) && t.status !== 'completed');
    };

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 pt-20 md:pt-16 uppercase-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shadow-lg shadow-purple-500/5">
                        <CalendarIcon className="text-purple-400 w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-200">Calendar Planner</h1>
                        <p className="text-slate-500 text-xs mt-0.5">Manage your time visually</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-1 shadow-xl self-stretch sm:self-auto justify-between sm:justify-start">
                    <button onClick={prevMonth} className="p-3 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white" aria-label="Previous Month">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-base font-bold min-w-32 text-center text-slate-200">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-3 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white" aria-label="Next Month">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                    <div className="overflow-x-auto no-scrollbar">
                        <div className="min-w-[800px]">
                            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/30">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                                    <div key={d} className="py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 auto-rows-fr">
                                {days.map((d, i) => {
                                    const dayTasks = getTasksForDay(d);
                                    const isToday = isSameDay(d, new Date());
                                    const isCurrentMonth = isSameMonth(d, monthStart);

                                    return (
                                        <div
                                            key={d.toISOString()}
                                            className={`min-h-[140px] p-3 border-r border-b border-slate-800/40 transition-colors relative group
                            ${!isCurrentMonth ? 'bg-slate-950/40 text-slate-700' : 'text-slate-300 hover:bg-slate-800/30'}
                            ${isToday ? 'bg-indigo-500/5' : ''}
                          `}
                                        >
                                            <div className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-lg mb-3
                            ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-200'}
                          `}>
                                                {format(d, 'd')}
                                            </div>

                                            <div className="space-y-1.5">
                                                {dayTasks.map((t, idx) => (
                                                    <div key={idx} className="text-[10px] px-2 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold truncate hover:bg-indigo-500/20 transition-colors pointer-events-none">
                                                        {format(parseISO(t.deadline!), 'h:mm a')} • {t.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {/* Visual indicator for horizontal scroll on mobile */}
                    <div className="md:hidden flex items-center justify-center gap-2 py-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-slate-950/50 border-t border-slate-800">
                        <span>Scroll horizontally to view calendar</span>
                    </div>
                </div>
            )}
        </div>
    );
}
