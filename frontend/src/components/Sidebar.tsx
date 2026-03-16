'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, CheckSquare, Settings } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <>
            {/* ===== DESKTOP SIDEBAR (unchanged, hidden on mobile) ===== */}
            <aside className="hidden md:flex fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800/50 flex-col pt-8 pb-4 px-4 md:relative">
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
                    <DesktopNavItem href="/" icon={<Home size={20} />} label="Dashboard" active={pathname === '/'} />
                    <DesktopNavItem href="/tasks" icon={<CheckSquare size={20} />} label="All Tasks" active={pathname === '/tasks'} />
                    <DesktopNavItem href="/calendar" icon={<Calendar size={20} />} label="Calendar" active={pathname === '/calendar'} />
                </nav>

                <div className="mt-auto pt-4 space-y-1.5 border-t border-slate-800/50">
                    <DesktopNavItem href="/settings" icon={<Settings size={20} />} label="Settings" active={pathname === '/settings'} />
                </div>
            </aside>

            {/* ===== MOBILE BOTTOM NAV BAR (visible only on phones) ===== */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/60 safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-1">
                    <MobileNavItem href="/" icon={<Home size={20} />} label="Home" active={pathname === '/'} />
                    <MobileNavItem href="/tasks" icon={<CheckSquare size={20} />} label="Tasks" active={pathname === '/tasks'} />
                    <MobileNavItem href="/calendar" icon={<Calendar size={18} />} label="Calendar" active={pathname === '/calendar'} />
                    <MobileNavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === '/settings'} />
                </div>
            </nav>
        </>
    );
};

/* ===== Desktop Nav Item (full sidebar style) ===== */
const DesktopNavItem = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link
        href={href}
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

/* ===== Mobile Nav Item (compact bottom bar style) ===== */
const MobileNavItem = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link
        href={href}
        className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all min-w-[60px]
            ${active
                ? 'text-indigo-400'
                : 'text-slate-500'
            }`}
    >
        <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-indigo-500/15 scale-110' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] font-bold ${active ? 'text-indigo-400' : 'text-slate-500'}`}>{label}</span>
    </Link>
);

export default Sidebar;
