import React from 'react';
import Link from 'next/link';
import { Home, Calendar, CheckSquare, Settings } from 'lucide-react';

const Sidebar = () => {
    return (
        <aside className="w-64 h-full bg-slate-900 border-r border-slate-700/50 flex flex-col pt-8 pb-4 px-4 sticky top-0 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <CheckSquare className="text-white h-6 w-6" />
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    LifeAdmin AI
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem href="/" icon={<Home size={20} />} label="Dashboard" active />
                <NavItem href="/tasks" icon={<CheckSquare size={20} />} label="All Tasks" />
                <NavItem href="/calendar" icon={<Calendar size={20} />} label="Calendar" />
            </nav>

            <div className="mt-auto pt-4 border-t border-slate-700/50">
                <NavItem href="/settings" icon={<Settings size={20} />} label="Settings" />
                <div className="mt-4 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-700/50 shadow-inner">
                    <p className="text-xs text-slate-400 font-medium">System Status</p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse"></div>
                        <span className="text-xs text-emerald-400/90 font-medium">All systems operational</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

const NavItem = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => {
    return (
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
        </Link>
    );
};

export default Sidebar;
