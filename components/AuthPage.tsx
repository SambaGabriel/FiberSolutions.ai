
import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, HardHat, Briefcase, Glasses, CheckCircle2, TrendingUp, Wallet, Ruler } from 'lucide-react';
import Logo from './Logo';
import FiberLoader from './FiberLoader';

interface AuthPageProps {
    onLogin: (user: any) => void;
}

type AuthMode = 'LOGIN' | 'REGISTER';
type UserRole = 'OWNER' | 'SUPERVISOR' | 'LINEMAN';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<AuthMode>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('LINEMAN');
    const [isLoading, setIsLoading] = useState(false);
    
    // Email Confirmation State
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (mode === 'REGISTER' && !isEmailSent) {
            // Simulate sending email
            setTimeout(() => {
                setIsEmailSent(true);
                setIsLoading(false);
            }, 2500);
            return;
        }

        // Simulate Login / Complete Registration
        setTimeout(() => {
            setIsLoading(false);
            onLogin({ email, name: name || 'Usuário', role });
        }, 2000);
    };

    if (isEmailSent && mode === 'REGISTER') {
        return (
            <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4 relative overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544197150-b99a580bbcbf?q=80&w=2071&auto=format&fit=crop')" }}
                ></div>
                <div className="w-full max-w-md bg-[#0b1121] border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Mail className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verifique seu Email</h2>
                    <p className="text-slate-400 mb-8">
                        Enviamos um link de confirmação para <span className="text-white font-bold">{email}</span>. Clique no link para ativar sua conta.
                    </p>
                    <button 
                        onClick={() => handleAuth({ preventDefault: () => {} } as any)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all"
                    >
                        Já confirmei meu email
                    </button>
                    <button 
                        onClick={() => setIsEmailSent(false)}
                        className="mt-4 text-slate-500 text-sm hover:text-white"
                    >
                        Voltar / Reenviar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* FULL PAGE BACKGROUND IMAGE */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2069&auto=format&fit=crop')" }}
            >
                {/* Heavy Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-[#02040a]/85 backdrop-blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#02040a] via-[#02040a]/90 to-transparent"></div>
            </div>
            
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-[#0b1121]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative z-10 min-h-[650px]">
                
                {/* Left Side - Value Proposition (Desktop Only) */}
                <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
                    
                    {/* Header Branding - Balanced Proportion */}
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                            <Logo className="w-10 h-10" showText={false} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tighter leading-none font-sans">
                                FIBER<span className="text-fs-brand">SOLUTIONS.ai</span>
                            </h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Management System</p>
                        </div>
                    </div>
                    
                    {/* Main Copy */}
                    <div className="relative z-10 mt-8">
                        <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
                            Gestão Integrada para <br/>
                            <span className="text-fs-brand">Construção de Redes</span>
                        </h2>
                        <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                            A plataforma definitiva para Empresas e Linemans. Centralize projetos, controle custos, automatize auditorias e pagamentos.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="relative z-10 grid grid-cols-2 gap-6 mt-12">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <div className="p-1.5 bg-blue-500/20 rounded text-blue-400"><Briefcase className="w-4 h-4" /></div>
                                Gestão de Projetos
                            </div>
                            <p className="text-xs text-slate-400">Organize rotas e materiais (BoQ).</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <div className="p-1.5 bg-emerald-500/20 rounded text-emerald-400"><Wallet className="w-4 h-4" /></div>
                                Controle Financeiro
                            </div>
                            <p className="text-xs text-slate-400">Invoices e pagamentos transparentes.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <div className="p-1.5 bg-fs-brand/20 rounded text-fs-brand"><ShieldCheck className="w-4 h-4" /></div>
                                Auditoria de Qualidade
                            </div>
                            <p className="text-xs text-slate-400">Validação técnica automatizada.</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                <div className="p-1.5 bg-purple-500/20 rounded text-purple-400"><HardHat className="w-4 h-4" /></div>
                                Portal do Lineman
                            </div>
                            <p className="text-xs text-slate-400">Facilidade para quem está em campo.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-[#02040a]/80 border-l border-white/5 relative z-20">
                    
                    {/* MOBILE LOGO */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                         <Logo className="w-10 h-10" showText={false} />
                         <span className="text-xl font-black text-white tracking-tighter">FIBER<span className="text-fs-brand">SOLUTIONS.ai</span></span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {mode === 'LOGIN' ? 'Acesse sua Conta' : 'Comece Agora'}
                        </h2>
                        <p className="text-slate-500">
                            {mode === 'LOGIN' ? 'Gerencie suas operações de fibra com eficiência.' : 'Junte-se à plataforma líder em OSP.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {mode === 'REGISTER' && (
                             <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#0b1121] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-fs-brand outline-none transition-colors"
                                        placeholder="Seu nome"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#0b1121] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-fs-brand outline-none transition-colors"
                                    placeholder="ex: nome@empresa.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#0b1121] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-fs-brand outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {mode === 'REGISTER' && (
                             <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Selecione seu Perfil</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setRole('OWNER')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'OWNER' ? 'bg-fs-brand/20 border-fs-brand text-white' : 'bg-[#0b1121] border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <Briefcase className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">Dono/Admin</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setRole('SUPERVISOR')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'SUPERVISOR' ? 'bg-fs-brand/20 border-fs-brand text-white' : 'bg-[#0b1121] border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <Glasses className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">Supervisor</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setRole('LINEMAN')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'LINEMAN' ? 'bg-fs-brand/20 border-fs-brand text-white' : 'bg-[#0b1121] border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <HardHat className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">Lineman</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className={`
                                w-full font-bold py-4 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 mt-4
                                ${isLoading ? 'bg-slate-800 cursor-not-allowed border border-white/10' : 'bg-action-gradient hover:brightness-110 text-white'}
                            `}
                        >
                            {isLoading ? (
                                <FiberLoader size={24} showText={false} />
                            ) : (
                                <>
                                    {mode === 'LOGIN' ? 'Entrar no Sistema' : 'Criar Conta'} <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {mode === 'LOGIN' ? 'Novo na plataforma?' : 'Já possui conta?'}
                            <button 
                                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                                className="ml-2 text-fs-brand font-bold hover:underline"
                            >
                                {mode === 'LOGIN' ? 'Criar Cadastro' : 'Fazer Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
