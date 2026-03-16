'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircle2, Circle, Clock, Tag, X, Pencil } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    category: string;
    deadline: string | null;
    priority: string;
    description: string | null;
    status: string;
    confidence: number;
    created_at: string;
}

interface TaskListProps {
    tasks: Task[];
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}

export default function TaskList({ tasks, onComplete, onDelete, onEdit }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 py-20 bg-slate-900/50 rounded-3xl border border-slate-800/50 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-300 mb-2">You're all caught up!</h3>
                <p className="text-slate-500">Upload a new document or voice note to generate tasks.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={onComplete} 
                    onDelete={onDelete} 
                    onEdit={onEdit} 
                />
            ))}
        </div>
    );
}

const TaskCard = ({ task, onComplete, onDelete, onEdit }: { 
    task: Task; 
    onComplete: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (task: Task) => void;
}) => {
    const isCompleted = task.status === 'completed';

    const priorityColors = {
        high: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
        medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        low: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    };

    const pColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium;

    return (
        <div className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${isCompleted
                ? 'bg-slate-900/30 border-slate-800/30 opacity-60'
                : 'bg-slate-900 border-slate-800 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5'
            }`}>
            <button
                onClick={() => !isCompleted && onComplete(task.id)}
                disabled={isCompleted}
                className="mt-1.5 flex-shrink-0 transition-transform hover:scale-110 focus:outline-none"
            >
                {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                ) : (
                    <Circle className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <h4 className={`text-base md:text-lg font-bold truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                    </h4>
                    
                    {!isCompleted && (
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onEdit(task)}
                                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-xl transition-all"
                                title="Edit Task"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => onDelete(task.id)}
                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
                                title="Delete Task"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {task.description && (
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                        {task.description}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-auto">
                    {task.deadline && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/50 px-2.5 py-1.5 rounded-xl border border-slate-800/50">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{format(parseISO(task.deadline), 'MMM d, h:mm a')}</span>
                        </div>
                    )}

                    <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl border ${pColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        {task.priority}
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/50 px-2.5 py-1.5 rounded-xl border border-slate-800/50">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" />
                        {task.category || 'General'}
                    </div>
                </div>
            </div>
        </div>
    );
};
