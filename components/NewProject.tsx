
import React, { useState, useRef } from 'react';
import { LayoutDashboard, Save, UploadCloud, Map as MapIcon, Calendar, Users, Briefcase, FileText, CheckCircle2, AlertTriangle, ArrowRight, Zap, HardHat, FileJson, Package, DollarSign, ListTodo } from 'lucide-react';
import FiberLoader from './FiberLoader';
import { analyzeMapBoQ } from '../services/geminiService';
import { UnitRates, MapAnalysisResult } from '../types';

interface NewProjectProps {
    onCancel: () => void;
    onSubmit: (data: any) => void;
    rates: UnitRates;
}

const NewProject: React.FC<NewProjectProps> = ({ onCancel, onSubmit, rates }) => {
    const [step, setStep] = useState<1 | 2>(1); // Step 1: Data, Step 2: Map/Materials
    const [isLoading, setIsLoading] = useState(false);
    
    // Map Analysis State
    const [mapFile, setMapFile] = useState<File | null>(null);
    const [analysisResult, setAnalysisResult] = useState<MapAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        routeId: '',
        name: '',
        type: 'CONSTRUCTION',
        crew: '',
        priority: 'NORMAL',
        deadline: '',
        description: ''
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMapSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setMapFile(e.target.files[0]);
            setAnalysisResult(null); // Reset analysis if new file
        }
    };

    const handleAnalyzeMap = async () => {
        if (!mapFile) return;
        setIsAnalyzing(true);
        
        try {
            // Convert File to Base64 or Text
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target?.result as string;
                let dataToSend = content;
                let mime = mapFile.type;

                // Simple check for base64 vs text
                if (mapFile.name.endsWith('.kml') || mapFile.name.endsWith('.xml')) {
                     // If it read as dataURL, decode it, or just readAsText above (cleaner: check ext before read)
                     // Re-reading as text for KML simplicity
                     const textReader = new FileReader();
                     textReader.onload = async (ev) => {
                         const text = ev.target?.result as string;
                         const result = await analyzeMapBoQ(text, 'text/xml', rates);
                         setAnalysisResult(result);
                         setIsAnalyzing(false);
                     };
                     textReader.readAsText(mapFile);
                     return;
                } else if (!mime) {
                    mime = 'image/jpeg'; // Fallback
                }
                
                // Image/PDF case
                const base64Data = content.split(',')[1];
                const result = await analyzeMapBoQ(base64Data, mime, rates);
                setAnalysisResult(result);
                setIsAnalyzing(false);
            };
            reader.readAsDataURL(mapFile);

        } catch (err) {
            console.error(err);
            setIsAnalyzing(false);
            alert("Erro ao analisar mapa.");
        }
    };

    const handleSubmit = () => {
        if (!formData.routeId || !formData.name || !formData.crew) {
            alert("Por favor, preencha os campos obrigatórios (ID, Nome e Equipe).");
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onSubmit({ ...formData, analysisResult });
        }, 1500);
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <Zap className="w-8 h-8 text-fs-brand" />
                        Nova Ordem de Serviço
                    </h2>
                    <p className="text-slate-400 text-lg mt-1">
                        {step === 1 ? 'Configuração do Pacote de Trabalho' : 'Análise de Materiais & Custos'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 font-bold transition-all uppercase tracking-wide text-sm"
                    >
                        Cancelar
                    </button>
                    
                    {step === 1 ? (
                        <button 
                            onClick={() => setStep(2)}
                            disabled={!formData.routeId || !formData.name}
                            className="px-8 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all uppercase tracking-wide text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            Próximo: Materiais <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 font-bold hover:text-white transition-all uppercase text-sm"
                            >
                                Voltar
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
                    )}
                </div>
            </div>

            {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-left duration-500">
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

                    {/* RIGHT COLUMN - RESOURCES */}
                    <div className="space-y-6">
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
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="animate-in slide-in-from-right duration-500 grid grid-cols-1 lg:grid-cols-12 gap-8">
                     {/* LEFT: UPLOAD & ANALYSIS */}
                     <div className="lg:col-span-5 space-y-6">
                         <div className="glass-panel p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                <MapIcon className="w-4 h-4 text-emerald-400" /> Upload de Mapa (KML/IMG)
                             </h3>
                             
                             {!mapFile ? (
                                 <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-2xl p-10 text-center cursor-pointer transition-all group"
                                 >
                                     <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-emerald-400 mx-auto mb-4 transition-colors" />
                                     <p className="text-white font-bold mb-1">Clique para carregar</p>
                                     <p className="text-xs text-slate-500">Suporte a KML, KMZ, PDF ou Imagem</p>
                                     <input ref={fileInputRef} type="file" className="hidden" onChange={handleMapSelect} accept=".kml,.kmz,.pdf,image/*" />
                                 </div>
                             ) : (
                                 <div className="bg-[#02040a] rounded-xl p-4 border border-white/10">
                                     <div className="flex items-center justify-between mb-4">
                                         <div className="flex items-center gap-3">
                                             <div className="p-2 bg-slate-800 rounded-lg"><FileJson className="w-5 h-5 text-emerald-400" /></div>
                                             <div>
                                                 <p className="text-sm font-bold text-white truncate max-w-[180px]">{mapFile.name}</p>
                                                 <p className="text-[10px] text-slate-500 uppercase">Pronto para Análise</p>
                                             </div>
                                         </div>
                                         <button onClick={() => { setMapFile(null); setAnalysisResult(null); }} className="text-xs text-rose-500 font-bold hover:underline">Remover</button>
                                     </div>
                                     
                                     <button 
                                        onClick={handleAnalyzeMap}
                                        disabled={isAnalyzing}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wide text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                                     >
                                         {isAnalyzing ? (
                                             <>Processando Geometria...</>
                                         ) : (
                                             <><Zap className="w-4 h-4 fill-white" /> Analisar BoQ & Custos</>
                                         )}
                                     </button>
                                 </div>
                             )}
                         </div>

                         {/* RATES SUMMARY CARD */}
                         <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.02]">
                             <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Tarifas Aplicadas (Contrato)</h4>
                             <div className="space-y-2 text-sm">
                                 <div className="flex justify-between">
                                     <span className="text-slate-500">Strand / Fiber</span>
                                     <span className="text-white font-mono">{formatCurrency(rates.fiber)} / ft</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-slate-500">Anchor (Guy)</span>
                                     <span className="text-white font-mono">{formatCurrency(rates.anchor)} / un</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-slate-500">Composite</span>
                                     <span className="text-white font-mono">{formatCurrency(rates.composite)} / un</span>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* RIGHT: RESULTS & MATERIAL LIST */}
                     <div className="lg:col-span-7">
                         {isAnalyzing ? (
                             <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-3xl">
                                 <FiberLoader size={80} text="Lendo Mapa e Calculando Custos..." />
                             </div>
                         ) : !analysisResult ? (
                             <div className="h-full min-h-[400px] flex flex-col items-center justify-center glass-panel rounded-3xl border border-white/10 opacity-60">
                                 <Package className="w-16 h-16 text-slate-600 mb-4" />
                                 <p className="text-slate-400 font-medium">Carregue um mapa para gerar a lista de materiais.</p>
                             </div>
                         ) : (
                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                 {/* FINANCIAL SUMMARY */}
                                 <div className="bg-gradient-to-br from-[#0f172a] to-[#02040a] border border-white/10 p-6 rounded-3xl relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                         <DollarSign className="w-24 h-24 text-emerald-400" />
                                     </div>
                                     <div className="relative z-10">
                                         <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">Custo Estimado (Labor)</p>
                                         <h3 className="text-4xl font-extrabold text-white tracking-tighter mb-4">
                                             {formatCurrency(analysisResult.financials.estimatedLaborCost)}
                                         </h3>
                                         <div className="flex gap-4 text-sm text-slate-400">
                                             <span><span className="text-white font-bold">{analysisResult.totalCableLength.toLocaleString()}</span> ft de Rede</span>
                                             <span>•</span>
                                             <span><span className="text-white font-bold">{analysisResult.spanCount}</span> Vãos</span>
                                         </div>
                                     </div>
                                 </div>

                                 {/* MATERIAL PICK LIST */}
                                 <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
                                     <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                         <h4 className="font-bold text-white flex items-center gap-2 text-sm uppercase">
                                             <ListTodo className="w-4 h-4 text-fs-brand" /> Warehouse Pick List
                                         </h4>
                                         <span className="text-[10px] bg-fs-brand/20 text-fs-brand px-2 py-1 rounded border border-fs-brand/20 font-bold uppercase">
                                             Para Retirada
                                         </span>
                                     </div>
                                     <div className="p-0">
                                         <table className="w-full text-left text-sm">
                                             <thead className="text-xs text-slate-500 uppercase bg-[#02040a]">
                                                 <tr>
                                                     <th className="px-6 py-3 font-bold">Item</th>
                                                     <th className="px-6 py-3 font-bold text-right">Qtd</th>
                                                     <th className="px-6 py-3 font-bold text-center">Unidade</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="divide-y divide-white/5 text-slate-300">
                                                 {analysisResult.materialList && analysisResult.materialList.length > 0 ? (
                                                     analysisResult.materialList.map((mat, idx) => (
                                                         <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                             <td className="px-6 py-3 font-medium text-white">{mat.item}</td>
                                                             <td className="px-6 py-3 text-right font-mono text-emerald-400 font-bold">{mat.quantity}</td>
                                                             <td className="px-6 py-3 text-center text-xs uppercase text-slate-500">{mat.unit}</td>
                                                         </tr>
                                                     ))
                                                 ) : (
                                                     // Fallback if AI didn't return list structure properly, construct from counts
                                                     <>
                                                         <tr className="hover:bg-white/5">
                                                             <td className="px-6 py-3 font-medium text-white">Fiber Optic Cable ({analysisResult.cableType})</td>
                                                             <td className="px-6 py-3 text-right font-mono text-emerald-400 font-bold">{Math.round(analysisResult.totalCableLength * 1.05)}</td>
                                                             <td className="px-6 py-3 text-center text-xs uppercase text-slate-500">FT</td>
                                                         </tr>
                                                         {analysisResult.equipmentCounts.map((eq, i) => (
                                                             <tr key={i} className="hover:bg-white/5">
                                                                 <td className="px-6 py-3 font-medium text-white">{eq.name}</td>
                                                                 <td className="px-6 py-3 text-right font-mono text-emerald-400 font-bold">{eq.quantity}</td>
                                                                 <td className="px-6 py-3 text-center text-xs uppercase text-slate-500">UN</td>
                                                             </tr>
                                                         ))}
                                                     </>
                                                 )}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             </div>
                         )}
                     </div>
                </div>
            )}
        </div>
    );
};

export default NewProject;
