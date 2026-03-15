'use client';

import React, { useEffect, useState } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, format, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export default function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/tasks');
                if (response.ok) setTasks(await response.json());
            } catch (error) {
                console.error('Failed to fetch tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };
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
        <div className="max-w-6xl mx-auto px-8 py-10 pt-16">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <CalendarIcon className="text-purple-400 w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-200">Calendar Planner</h1>
                </div>

                <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-lg p-1 shadow-sm">
                    <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-lg font-bold min-w-32 text-center text-slate-200">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-md transition text-slate-400 hover:text-white">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800/50">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="py-3 text-center text-sm font-bold text-slate-500 uppercase tracking-wider">
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
                                    className={`min-h-[120px] p-2 border-r border-b border-slate-800/50 transition-colors
                    ${!isCurrentMonth ? 'bg-slate-950/50 text-slate-600' : 'text-slate-300 hover:bg-slate-800/30'}
                    ${isToday ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : ''}
                  `}
                                >
                                    <div className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2
                    ${isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : ''}
                  `}>
                                        {format(d, 'd')}
                                    </div>

                                    <div className="space-y-1">
                                        {dayTasks.map((t, idx) => (
                                            <div key={idx} className="text-xs truncate px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                                                {format(parseISO(t.deadline!), 'h:mm a')} • {t.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
