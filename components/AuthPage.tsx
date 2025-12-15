import React, { useState } from 'react';
import { User, Lock, Mail, ArrowRight, ShieldCheck, HardHat, Briefcase, Glasses, CheckCircle2 } from 'lucide-react';
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
            }, 2500); // Aumentei um pouco para dar tempo de ver a animação legal
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
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
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
        <div className="min-h-screen bg-[#02040a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-radial-gradient from-[#1a1f2e] to-[#02040a]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-fs-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-[#0b1121]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative z-10 min-h-[600px]">
                
                {/* Left Side - Visual (Desktop Only) */}
                <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0f172a] to-[#02040a] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                    
                    <div className="relative z-10">
                        {/* WRAPPER DIV for Spacing */}
                        <div className="mb-8">
                            <Logo className="w-20 h-20" showText={true} />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
                            Inteligência Artificial para <br/>
                            <span className="text-fs-brand">Redes de Fibra Óptica</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-sm">
                            Supervisão, auditoria e pagamentos automatizados para operações FTTH de alta performance.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                            <div className="p-2 bg-white/5 rounded-lg"><ShieldCheck className="w-5 h-5 text-emerald-400" /></div>
                            <span>Auditoria IA com 98% de precisão</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                            <div className="p-2 bg-white/5 rounded-lg"><Briefcase className="w-5 h-5 text-blue-400" /></div>
                            <span>Pagamentos Automatizados & BoQ</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-8 lg:p-12 flex flex-col justify-center relative z-20">
                    
                    {/* MOBILE LOGO (Visible only on small screens) */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Logo className="w-12 h-12" showText={true} />
                    </div>

                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {mode === 'LOGIN' ? 'Acesse sua Conta' : 'Crie sua conta'}
                        </h2>
                        <p className="text-slate-500">
                            {mode === 'LOGIN' ? 'Insira suas credenciais para continuar.' : 'Comece a otimizar suas rotas hoje mesmo.'}
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
                                        className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-fs-brand outline-none transition-colors"
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
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-fs-brand outline-none transition-colors"
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
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:border-fs-brand outline-none transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {mode === 'REGISTER' && (
                             <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Perfil de Acesso</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setRole('OWNER')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'OWNER' ? 'bg-fs-brand/20 border-fs-brand text-white' : 'bg-[#02040a] border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <Briefcase className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">Proprietário</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setRole('SUPERVISOR')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'SUPERVISOR' ? 'bg-fs-brand/20 border-fs-brand text-white' : 'bg-[#02040a] border-white/10 text-slate-500 hover:border-white/20'}`}
                                    >
                                        <Glasses className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase">Supervisor</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setRole('LINEMAN')}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${role === 'LINEMAN' ? 'bg-fs-brand/20 border-fs-brand text-white' : 'bg-[#02040a] border-white/10 text-slate-500 hover:border-white/20'}`}
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
                            {mode === 'LOGIN' ? 'Ainda não tem conta?' : 'Já possui cadastro?'}
                            <button 
                                onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                                className="ml-2 text-fs-brand font-bold hover:underline"
                            >
                                {mode === 'LOGIN' ? 'Cadastre-se' : 'Fazer Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;