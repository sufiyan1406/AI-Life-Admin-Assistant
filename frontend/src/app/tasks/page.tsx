'use client';

import React, { useEffect, useState } from 'react';
import TaskList from '@/components/TaskList';
import { ListTodo, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AllTasks() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/tasks`);
            if (response.ok) {
                setTasks(await response.json());
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

    const handleTaskComplete = async (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
        try {
            await fetch(`${API_BASE_URL}/api/v1/tasks/${id}/complete`, { method: 'PATCH' });
        } catch (error) {
            console.error('Failed to complete:', error);
            fetchTasks();
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/v1/tasks/${id}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t.id !== id));
        } catch (e) {
            console.error(e);
            fetchTasks();
        }
    };

    const handleEditTask = (task: any) => {
        window.location.href = '/'; // Simple redirection to home where edit modal exists
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true;
        return t.status === filter;
    });

    return (
        <div className="max-w-5xl mx-auto px-8 py-10 pt-16">
            <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <ListTodo className="text-indigo-400 w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-200">All Master Tasks</h1>
                </div>

                <div className="flex bg-slate-900 rounded-lg border border-slate-800 p-1">
                    {['all', 'pending', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${filter === f
                                    ? 'bg-indigo-500 text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            ) : (
                <TaskList 
                    tasks={filteredTasks} 
                    onComplete={handleTaskComplete} 
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                />
            )}
        </div>
    );
}
