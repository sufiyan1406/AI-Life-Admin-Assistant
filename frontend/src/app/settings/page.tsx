'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { User, Bell, Mail, Shield, Save, Loader2, CheckCircle2, Settings } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [emailReminders, setEmailReminders] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.user_metadata?.full_name || '');
            setEmail(user.email || '');
            // In a real app, emailReminders would be fetched from a 'profiles' table
            // For now we'll mock it or use user metadata
            setEmailReminders(user.user_metadata?.email_reminders !== false);
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            data: { 
                full_name: name,
                email_reminders: emailReminders
            }
        });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        }
        setIsSaving(false);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 pt-16 md:pt-12">
            <div className="flex items-center gap-4 mb-10 border-b border-slate-800 pb-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
                    <Settings className="text-slate-400 w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">App Settings</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your account and notification preferences</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Profile Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
                        <User className="text-indigo-400 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-200">Account Profile</h2>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2 opacity-60">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email (Read Only)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                                <input
                                    type="email"
                                    disabled
                                    value={email}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-400 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
                        <Bell className="text-emerald-400 w-5 h-5" />
                        <h2 className="text-lg font-bold text-slate-200">Notifications</h2>
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

                {/* Security Info */}
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-start gap-4">
                    <Shield className="text-indigo-400 w-6 h-6 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-indigo-300 text-sm">Data Security</h4>
                        <p className="text-xs text-indigo-400/70 mt-1 leading-relaxed">
                            Your tasks are protected with Supabase Row Level Security (RLS). 
                            Only you can access your data. We use industry-standard encryption for your personal information.
                        </p>
                    </div>
                </div>

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
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
