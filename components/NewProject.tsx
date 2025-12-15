import React, { useState } from 'react';
import { LayoutDashboard, Save, UploadCloud, Map as MapIcon, Calendar, Users, Briefcase, FileText, CheckCircle2, AlertTriangle, ArrowRight, Zap, HardHat, FileJson } from 'lucide-react';
import FiberLoader from './FiberLoader';

interface NewProjectProps {
    onCancel: () => void;
    onSubmit: (data: any) => void;
}

const NewProject: React.FC<NewProjectProps> = ({ onCancel, onSubmit }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        routeId: '',
        name: '',
        type: 'CONSTRUCTION',
        crew: '',
        priority: 'NORMAL',
        deadline: '',
        description: '',
        kmlFile: null as File | null
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFormData(prev => ({ ...prev, kmlFile: e.target.files![0] }));
        }
    };

    const handleSubmit = () => {
        if (!formData.routeId || !formData.name || !formData.crew) {
            alert("Por favor, preencha os campos obrigatórios (ID, Nome e Equipe).");
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onSubmit(formData);
        }, 1500);
    };

    return (
        <div className="max-w-5xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Zap className="w-8 h-8 text-fs-brand" />
                        Nova Ordem de Serviço
                    </h2>
                    <p className="text-slate-400 text-lg mt-1">Criação de pacote de trabalho e setup de rota.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold transition-all uppercase tracking-wide text-sm"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-action-gradient text-white font-bold shadow-glow hover:brightness-110 transition-all uppercase tracking-wide text-sm flex items-center gap-2"
                    >
                        {isLoading ? (
                            <FiberLoader size={20} showText={false} />
                        ) : (
                            <><Save className="w-4 h-4" /> Criar Projeto</>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN - OPERATIONAL DATA */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl border border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-fs-brand" /> Dados do Projeto
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">ID da Rota (Route ID) *</label>
                                <input 
                                    type="text" 
                                    placeholder="ex: R-2024-SP01"
                                    value={formData.routeId}
                                    onChange={e => handleChange('routeId', e.target.value)}
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-fs-brand outline-none transition-colors font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nome do Projeto *</label>
                                <input 
                                    type="text" 
                                    placeholder="ex: Expansão Norte - Backbone"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-fs-brand outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                             <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipo de Serviço</label>
                                <div className="relative">
                                    <select 
                                        value={formData.type}
                                        onChange={e => handleChange('type', e.target.value)}
                                        className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-fs-brand outline-none appearance-none transition-colors"
                                    >
                                        <option value="CONSTRUCTION">Construção (New Build)</option>
                                        <option value="MAINTENANCE">Manutenção Preventiva</option>
                                        <option value="EMERGENCY">Reparo Emergencial</option>
                                        <option value="AUDIT">Auditoria Externa</option>
                                    </select>
                                    <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prioridade</label>
                                <div className="flex gap-2">
                                    {['NORMAL', 'HIGH', 'CRITICAL'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => handleChange('priority', p)}
                                            className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all
                                                ${formData.priority === p 
                                                    ? p === 'CRITICAL' ? 'bg-fs-danger text-white border-fs-danger shadow-glow' : 'bg-white/10 text-white border-white/30'
                                                    : 'bg-[#02040a] text-slate-500 border-white/5 hover:border-white/10'
                                                }
                                            `}
                                        >
                                            {p === 'CRITICAL' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descrição / Escopo</label>
                            <textarea 
                                rows={4}
                                placeholder="Descreva os detalhes da obra, pontos de atenção e referências..."
                                value={formData.description}
                                onChange={e => handleChange('description', e.target.value)}
                                className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-fs-brand outline-none transition-colors resize-none"
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN - RESOURCES & ENGINEERING */}
                <div className="space-y-6">
                    
                    {/* CREW ASSIGNMENT */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/10">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" /> Alocação de Recursos
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Equipe Responsável (Crew) *</label>
                            <div className="relative">
                                <select 
                                    value={formData.crew}
                                    onChange={e => handleChange('crew', e.target.value)}
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none appearance-none transition-colors"
                                >
                                    <option value="">Selecione uma equipe...</option>
                                    <option value="ALPHA">Crew Alpha (FTTH)</option>
                                    <option value="BETA">Crew Beta (Backbone)</option>
                                    <option value="GAMMA">Crew Gamma (Civil)</option>
                                    <option value="DELTA">Crew Delta (Splicing)</option>
                                </select>
                                <HardHat className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prazo Estimado</label>
                            <div className="relative">
                                <input 
                                    type="date" 
                                    value={formData.deadline}
                                    onChange={e => handleChange('deadline', e.target.value)}
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-blue-500 outline-none transition-colors"
                                />
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* ENGINEERING FILES */}
                    <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <MapIcon className="w-24 h-24 text-white" />
                        </div>
                        
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2 relative z-10">
                            <MapIcon className="w-4 h-4 text-emerald-400" /> Engenharia (Geometria)
                        </h3>

                        <div className="relative z-10">
                            <label className="block w-full cursor-pointer group">
                                <div className={`
                                    border-2 border-dashed rounded-xl p-6 text-center transition-all
                                    ${formData.kmlFile 
                                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                                        : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
                                    }
                                `}>
                                    {formData.kmlFile ? (
                                        <div className="flex flex-col items-center">
                                            <FileJson className="w-8 h-8 text-emerald-400 mb-2" />
                                            <span className="text-sm font-bold text-white truncate max-w-[200px]">{formData.kmlFile.name}</span>
                                            <span className="text-xs text-emerald-500 font-bold uppercase mt-1">KML Vinculado</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-white mb-2 transition-colors" />
                                            <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">Vincular Projeto KML</span>
                                            <span className="text-[10px] text-slate-500 mt-1">Opcional para inicialização</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" className="hidden" accept=".kml,.kmz" onChange={handleFileChange} />
                            </label>

                            <div className="mt-4 flex items-start gap-2 bg-[#02040a] p-3 rounded-lg border border-white/5">
                                <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5" />
                                <p className="text-xs text-slate-400">
                                    Ao vincular um KML, a rota será desenhada automaticamente no mapa dos técnicos e auditores.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default NewProject;