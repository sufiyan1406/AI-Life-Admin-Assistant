'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, CheckSquare, Settings, Menu, X, LogOut, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

const Sidebar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleSidebar}
                    className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 shadow-xl"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800/50 flex flex-col pt-8 pb-4 px-4 
                transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <CheckSquare className="text-white h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            LifeAdmin AI
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Intelligent Productivity</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    <NavItem 
                        href="/" 
                        icon={<Home size={20} />} 
                        label="Dashboard" 
                        active={pathname === '/'} 
                        onClick={() => setIsOpen(false)}
                    />
                    <NavItem 
                        href="/tasks" 
                        icon={<CheckSquare size={20} />} 
                        label="All Tasks" 
                        active={pathname === '/tasks'} 
                        onClick={() => setIsOpen(false)}
                    />
                    <NavItem 
                        href="/calendar" 
                        icon={<Calendar size={20} />} 
                        label="Calendar" 
                        active={pathname === '/calendar'} 
                        onClick={() => setIsOpen(false)}
                    />
                </nav>

                <div className="mt-auto pt-4 space-y-1.5 border-t border-slate-800/50">
                    <NavItem 
                        href="/settings" 
                        icon={<Settings size={20} />} 
                        label="Settings" 
                        active={pathname === '/settings'} 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-300 group"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-sm">Sign Out</span>
                    </button>

                    {user && (
                        <div className="mt-4 px-4 py-3 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                <User size={16} className="text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-200 truncate">
                                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">Free Plan</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

const NavItem = ({ href, icon, label, active = false, onClick }: NavItemProps) => {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
        ${active
                    ? 'bg-indigo-500/10 text-indigo-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
        >
            <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110 group-hover:text-indigo-400'}`}>
                {icon}
            </div>
            <span className="font-medium text-sm">{label}</span>
            {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            )}
        </Link>
    );
};

export default Sidebar;
