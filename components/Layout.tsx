
import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Notification, User } from '../types';
import { LayoutDashboard, Map as MapIcon, Menu, X, Bell, CheckCheck, AlertTriangle, Info, AlertCircle, ChevronRight, Calculator, HardHat, Building2, ArrowLeft, Zap, Bot, User as UserIcon, LogOut, Settings, CheckCircle, MailCheck, Shield, CheckCircle2 } from 'lucide-react';
import Logo from './Logo';

interface LayoutProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    children: React.ReactNode;
    notifications: Notification[];
    onMarkAllRead: () => void;
    user: User | null;
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children, notifications, onMarkAllRead, user, onLogout }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    
    // Profile Modal State
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalTab, setModalTab] = useState<'account' | 'info'>('account');

    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setIsNotifOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { id: ViewState.DASHBOARD, label: 'Visão Geral', icon: LayoutDashboard },
        { id: ViewState.LINEMAN, label: 'Portal Lineman', icon: HardHat },
        { id: ViewState.ADMIN, label: 'Gestão & Financeiro', icon: Building2 },
        { id: ViewState.ENGINEERING, label: 'Engenharia & Qualidade', icon: Calculator }, 
        { id: ViewState.MAPS, label: 'Mapas', icon: MapIcon },
        { id: ViewState.AI_ASSISTANT, label: 'AI Assistant', icon: Bot },
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
            
            <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
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

    const UserMenu = () => (
        <div className="absolute right-0 mt-4 w-72 glass-panel rounded-2xl shadow-2xl z-50 overflow-hidden transform transition-all animate-in fade-in slide-in-from-top-2 border border-white/10">
            {/* Header with User Info */}
            <div className="p-5 border-b border-white/5 bg-[#0a0f1e] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <UserIcon className="w-20 h-20 text-white" />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-fs-brand/20 border border-fs-brand/30 flex items-center justify-center text-fs-brand font-bold text-lg">
                        {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm truncate max-w-[160px]">{user?.name}</p>
                        <p className="text-slate-500 text-xs truncate max-w-[160px]">{user?.email}</p>
                    </div>
                </div>
                {/* Email Verification Badge */}
                <div className="mt-3 flex items-center gap-2 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded w-fit border border-emerald-500/20 font-bold uppercase tracking-wide">
                    <MailCheck className="w-3 h-3" /> Email Confirmado
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 bg-[#02040a]">
                <button 
                    onClick={() => {
                        setModalTab('account');
                        setShowProfileModal(true);
                        setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium text-left"
                >
                    <UserIcon className="w-4 h-4" /> Minha Conta
                </button>
                <button 
                    onClick={() => {
                        setModalTab('info');
                        setShowProfileModal(true);
                        setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium text-left"
                >
                    <Info className="w-4 h-4" /> Informações do Sistema
                </button>
                
                <div className="h-px bg-white/5 my-1" />
                
                <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-sm font-medium text-left"
                >
                    <LogOut className="w-4 h-4" /> Sair
                </button>
            </div>
        </div>
    );

    const ProfileModal = () => (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#0b1121] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a0f1e]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {modalTab === 'account' ? <UserIcon className="w-5 h-5 text-fs-brand" /> : <Info className="w-5 h-5 text-fs-brand" />}
                        {modalTab === 'account' ? 'Minha Conta' : 'Sobre o Sistema'}
                    </h3>
                    <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {modalTab === 'account' ? (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fs-brand to-orange-600 p-1 mb-4 shadow-glow">
                                    <div className="w-full h-full rounded-full bg-[#02040a] flex items-center justify-center">
                                        <span className="text-4xl font-bold text-white">{user?.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-white">{user?.name}</h4>
                                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-300 mt-2 uppercase tracking-wide">
                                    {user?.role}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-[#02040a] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Email Corporativo</p>
                                        <p className="text-white font-medium">{user?.email}</p>
                                    </div>
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="bg-[#02040a] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-slate-500 font-bold uppercase">Status da Conta</p>
                                        <p className="text-emerald-400 font-bold">Ativo / Verificado</p>
                                    </div>
                                    <Shield className="w-5 h-5 text-emerald-500" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 mb-6">
                                <Logo className="w-16 h-16 mx-auto mb-4" showText={false} />
                                <h4 className="text-2xl font-black text-white tracking-tighter">FIBER<span className="text-fs-brand">SOLUTIONS.ai</span></h4>
                                <p className="text-slate-500 text-sm mt-2">Versão 2.4.0 (Build 2024)</p>
                            </div>
                            
                            <div className="text-left space-y-4">
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Módulos Ativos</h5>
                                <ul className="space-y-2 text-sm text-slate-300">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Gemini 3.0 Pro Vision (Audit)</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Google Maps Geospatial (BoQ)</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Veo Video Generation</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Payments Gateway</li>
                                </ul>
                            </div>
                            
                            <p className="text-xs text-slate-600 mt-8">
                                © 2024 Fiber Solutions Inc. Todos os direitos reservados.
                            </p>
                        </div>
                    )}
                </div>
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
                   <span className="font-extrabold text-lg tracking-tight text-white">FIBER<span className="text-fs-brand">SOLUTIONS.ai</span></span>
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
                        {/* Mobile Logout Button in Menu */}
                        <div className="absolute bottom-4 left-0 w-full px-6">
                            <button 
                                onClick={onLogout}
                                className="w-full py-3 bg-rose-500/10 text-rose-400 font-bold rounded-xl border border-rose-500/20 flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Sair
                            </button>
                        </div>
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
                        
                        {/* USER DROPDOWN TRIGGER */}
                        <div className="relative" ref={userMenuRef}>
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="hidden md:flex flex-col items-end mr-2 hover:bg-white/5 px-3 py-1 rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-white/5"
                            >
                                <span className="text-xs font-bold text-white group-hover:text-fs-brand transition-colors">{user?.name}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{user?.role}</span>
                            </button>
                            {isUserMenuOpen && <UserMenu />}
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

                {/* Render Profile Modal */}
                {showProfileModal && <ProfileModal />}
            </main>
        </div>
    );
};

export default Layout;
