import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Notification } from '../types';
import { LayoutDashboard, Camera, Map as MapIcon, Menu, X, Bell, CheckCheck, AlertTriangle, Info, AlertCircle, ChevronRight, Calculator, HardHat, Building2, ArrowLeft, Zap } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    children: React.ReactNode;
    notifications: Notification[];
    onMarkAllRead: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children, notifications, onMarkAllRead }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { id: ViewState.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
        { id: ViewState.LINEMAN, label: 'Portal Lineman', icon: HardHat },
        { id: ViewState.ADMIN, label: 'Gestão & Financeiro', icon: Building2 },
        { id: ViewState.AUDIT, label: 'Auditoria Visual', icon: Camera },
        { id: ViewState.MAP_AUDIT, label: 'Auditoria BoQ', icon: Calculator },
        { id: ViewState.MAPS, label: 'Mapas de Campo', icon: MapIcon },
    ];

    const getIconForType = (type: string) => {
        switch(type) {
            case 'critical': return <AlertCircle className="w-4 h-4 text-fs-danger" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-fs-warning" />;
            case 'success': return <CheckCheck className="w-4 h-4 text-fs-success" />;
            default: return <Info className="w-4 h-4 text-fs-accent" />;
        }
    };

    const NavContent = () => (
        <div className="flex flex-col h-full bg-[#050914] border-r border-white/5 shadow-2xl">
            <div className="p-8">
                <Logo className="w-12 h-12 mb-2" showText={true} />
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-2">
                <p className="px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 opacity-60">Centro de Comando</p>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onChangeView(item.id);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`group w-full flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-300 border border-transparent ${
                            currentView === item.id 
                            ? 'bg-gradient-to-r from-[#ff5500]/20 to-transparent text-white border-l-[#ff5500] border-l-4' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`w-5 h-5 transition-transform duration-300 ${currentView === item.id ? 'text-fs-brand scale-110' : 'group-hover:text-white group-hover:scale-110'}`} />
                            <span className={`font-medium text-sm tracking-wide ${currentView === item.id ? 'font-bold' : ''}`}>{item.label}</span>
                        </div>
                        {currentView === item.id && <ChevronRight className="w-4 h-4 text-fs-brand" />}
                    </button>
                ))}
            </nav>

            <div className="p-6">
                <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-xl p-5 border border-white/10 shadow-lg group hover:border-fs-brand/30 transition-colors">
                    <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-fs-brand" /> System Status
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fs-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fs-success"></span>
                        </span>
                        <span className="text-xs text-slate-200 font-bold tracking-tight">AI CORE ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const NotificationPanel = () => (
        <div className="absolute right-0 mt-4 w-80 md:w-96 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 border border-white/10">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0a0f1e]">
                <h3 className="font-bold text-white text-sm tracking-wide">Notificações</h3>
                {unreadCount > 0 && (
                    <button 
                        onClick={onMarkAllRead}
                        className="text-[10px] bg-fs-brand/10 text-fs-brand border border-fs-brand/20 px-3 py-1 rounded-full hover:bg-fs-brand/20 transition-colors uppercase font-bold tracking-wide"
                    >
                        Marcar lidas
                    </button>
                )}
            </div>
            <div className="max-h-[400px] overflow-y-auto bg-[#02040a]">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <div className="bg-slate-900 p-4 rounded-full mb-3 border border-white/5">
                            <Bell className="w-6 h-6 opacity-40" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide opacity-50">Sem alertas recentes</p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif.id} 
                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-fs-brand/5 border-l-2 border-l-fs-brand' : ''}`}
                        >
                            <div className="flex gap-4">
                                <div className={`mt-1 p-2 rounded-lg bg-slate-900 border border-white/5 shrink-0 h-fit`}>
                                    {getIconForType(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-sm font-bold ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-slate-600 whitespace-nowrap ml-2 font-mono">
                                            {notif.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex font-sans text-slate-200 selection:bg-fs-brand/30 selection:text-white bg-fs-bg">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 h-screen sticky top-0 z-40">
                <NavContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full glass-panel border-b border-white/5 z-50 px-4 py-3 flex items-center justify-between bg-[#02040a]/90">
                <div className="flex items-center gap-3">
                    {/* MOBILE BACK BUTTON */}
                    {currentView !== ViewState.DASHBOARD && (
                        <button 
                            onClick={() => onChangeView(ViewState.DASHBOARD)} 
                            className="p-2 -ml-2 rounded-full text-slate-300 hover:bg-white/10 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    
                   <Logo className="w-8 h-8" showText={false} />
                   <span className="font-extrabold text-lg tracking-tight text-white">FIBER<span className="text-fs-brand">SOLUTIONS</span></span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative" ref={notifRef}>
                        <button onClick={() => setIsNotifOpen(!isNotifOpen)} className="relative p-2 rounded-full hover:bg-white/5 text-slate-300">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fs-brand rounded-full ring-2 ring-[#02040a]"></span>
                            )}
                        </button>
                        {isNotifOpen && <NotificationPanel />}
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/5"
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/90 backdrop-blur-sm z-40 animate-in fade-in duration-200" onClick={() => setIsMobileMenuOpen(false)}>
                    <div 
                        className="w-4/5 max-w-xs h-full shadow-2xl animate-in slide-in-from-left duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <NavContent />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8 mt-16 lg:mt-0 overflow-y-auto h-screen scrollbar-hide relative bg-[#02040a]">
                 {/* Desktop Header/Utility Bar - NOW STICKY */}
                 <div className="hidden lg:flex justify-between items-center mb-8 sticky top-0 z-30 py-4 -mt-4 bg-[#02040a]/80 backdrop-blur-md border-b border-white/5 w-full" ref={notifRef}>
                    <div className="flex items-center gap-4">
                        {/* DESKTOP BACK BUTTON */}
                        {currentView !== ViewState.DASHBOARD ? (
                            <button
                                onClick={() => onChangeView(ViewState.DASHBOARD)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-white/10 hover:border-white/20 hover:-translate-x-1 group uppercase tracking-wide"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Voltar
                            </button>
                        ) : (
                             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                <div className="w-2 h-2 rounded-full bg-fs-success animate-pulse"></div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="relative flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end mr-2">
                             <span className="text-xs font-bold text-white">Supervisão Central</span>
                             <span className="text-[10px] text-fs-brand uppercase font-bold tracking-widest">Administrator</span>
                        </div>
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className={`p-3 rounded-xl border border-white/10 transition-all duration-300 relative group
                                ${isNotifOpen ? 'bg-fs-brand text-white shadow-glow' : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-fs-brand rounded-full border-2 border-[#02040a] flex items-center justify-center text-[8px] font-bold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {isNotifOpen && <NotificationPanel />}
                    </div>
                 </div>

                {children}
            </main>
        </div>
    );
};

export default Layout;