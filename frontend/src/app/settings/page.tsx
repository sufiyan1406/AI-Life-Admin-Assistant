'use client';

import React, { useState } from 'react';
import { Settings, Bell, Mail, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
    const [name, setName] = useState('User');
    const [email, setEmail] = useState('user@example.com');
    const [emailReminders, setEmailReminders] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        
        // Simulating save
        setTimeout(() => {
            setMessage({ type: 'success', text: 'Settings saved locally!' });
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }, 800);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 pt-16 md:pt-12">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                    <Settings className="text-slate-400 w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">App Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your application preferences</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
                        <Bell className="text-indigo-400 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-200">Preferences</h2>
                    </div>
                    <div className="p-8">
                        <div className="flex items-center justify-between group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-colors">
                                    <Mail className="text-slate-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200">Email Reminders</h4>
                                    <p className="text-sm text-slate-500 max-w-sm mt-1">Receive automated alerts 24h, 3h, and 30m before your task deadlines.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={emailReminders}
                                    onChange={(e) => setEmailReminders(e.target.checked)}
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    {message && (
                        <div className={`flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {message.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                            {message.text}
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> Save Preferences
                    </button>
                </div>
            </div>
        </div>
    );
}
