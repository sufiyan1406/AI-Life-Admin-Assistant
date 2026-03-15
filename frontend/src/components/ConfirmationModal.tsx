'use client';

import React, { useState } from 'react';
import { X, Check, Calendar, Tag, AlertTriangle } from 'lucide-react';

interface TaskData {
    title: string;
    category: string;
    deadline: string | null;
    priority: string;
    description: string;
    confidence: number;
}

interface ConfirmationModalProps {
    isOpen: boolean;
    task: TaskData | null;
    onConfirm: (updatedTask: any) => void;
    onCancel: () => void;
}

export default function ConfirmationModal({ isOpen, task, onConfirm, onCancel }: ConfirmationModalProps) {
    const [editedTask, setEditedTask] = useState<any>(task);

    React.useEffect(() => {
        if (task) setEditedTask(task);
    }, [task]);

    if (!isOpen || !editedTask) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="text-amber-500 w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-200">Review AI Extraction</h3>
                            <p className="text-xs text-slate-500">Confidence: {(editedTask.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-slate-500 hover:text-slate-300 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Task Title</label>
                        <input
                            type="text"
                            value={editedTask.task_title || editedTask.title}
                            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                            <div className="relative">
                                <select
                                    value={editedTask.category}
                                    onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
                                    className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                                >
                                    {["Bills", "Study", "Appointments", "Subscriptions", "Personal", "Work"].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <Tag className="absolute right-4 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Priority</label>
                            <select
                                value={editedTask.priority}
                                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Deadline</label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                value={editedTask.deadline ? editedTask.deadline.substring(0, 16) : ""}
                                onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                            <Calendar className="absolute right-4 top-3.5 w-4 h-4 text-slate-600 pointer-events-none" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            value={editedTask.description || ""}
                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all resize-none text-sm"
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 rounded-xl border border-slate-800 text-slate-300 font-medium hover:bg-slate-800 transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={() => onConfirm(editedTask)}
                        className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Confirm Task
                    </button>
                </div>
            </div>
        </div>
    );
}
