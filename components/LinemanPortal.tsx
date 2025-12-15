import React, { useState, useRef, useMemo } from 'react';
import { HardHat, Camera, UploadCloud, Map as MapIcon, Plus, Minus, Send, Ruler, BoxSelect, Wallet, ArrowDownLeft, History, GitMerge, Lightbulb, ChevronRight, DollarSign, Calculator } from 'lucide-react';
import { analyzeMapBoQ } from '../services/geminiService';
import { MapAnalysisResult, Transaction, Invoice, UnitRates } from '../types';

interface LinemanPortalProps {
    transactions: Transaction[];
    onSubmitWork: (invoice: Partial<Invoice>) => void;
    rates: UnitRates;
}

const AssetCounter = ({ label, count, onChange }: { label: string, count: number, onChange: (val: number) => void }) => (
    <div className="flex items-center justify-between bg-[#02040a] p-4 rounded-xl border border-white/5 group hover:border-fs-brand/30 transition-colors">
        <span className="font-bold text-slate-300 text-sm uppercase tracking-wide group-hover:text-white transition-colors">{label}</span>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => onChange(Math.max(0, count - 1))}
                className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 active:scale-95 transition-all border border-white/5"
            >
                <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-xl text-white font-mono">{count}</span>
            <button 
                onClick={() => onChange(count + 1)}
                className="w-10 h-10 rounded-lg bg-fs-brand flex items-center justify-center text-white hover:bg-fs-brandHover active:scale-95 transition-all shadow-glow"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const LinemanPortal: React.FC<LinemanPortalProps> = ({ transactions, onSubmitWork, rates }) => {
    // Form States
    const [routeId, setRouteId] = useState('');
    const [fiberType, setFiberType] = useState('48ct');
    const [footage, setFootage] = useState('');
    
    // Asset States (Starts at 0)
    const [anchors, setAnchors] = useState(0);
    const [snowshoes, setSnowshoes] = useState(0);
    const [coils, setCoils] = useState(0);
    const [risers, setRisers] = useState(0);

    // Map Upload & AI Check
    const [selectedMap, setSelectedMap] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [aiCheckResult, setAiCheckResult] = useState<MapAnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dynamic Wallet Calculation
    const currentBalance = useMemo(() => {
        return transactions.reduce((acc, curr) => acc + curr.netAmount, 0);
    }, [transactions]);

    // Live Estimation Calculation
    const estimatedEarnings = useMemo(() => {
        const ft = parseFloat(footage) || 0;
        const footagePay = ft * rates.fiber;
        const assetsPay = (anchors * rates.anchor) + (snowshoes * rates.snowshoe);
        return footagePay + assetsPay;
    }, [footage, anchors, snowshoes, rates]);

    const handleMapUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setSelectedMap(base64);
                
                // Trigger AI Verification immediately
                setIsVerifying(true);
                const result = await analyzeMapBoQ(base64.split(',')[1]);
                setAiCheckResult(result);
                
                // 1. Auto-fill footage if AI detects it
                if (result.totalCableLength && result.totalCableLength > 0) {
                    setFootage(result.totalCableLength.toString());
                }

                // 2. Auto-fill Fiber Type if detected
                if (result.cableType && result.cableType !== 'Desconhecido') {
                    // Try to match basic types, otherwise keep default
                    if (result.cableType.includes('288')) setFiberType('288ct');
                    else if (result.cableType.includes('144')) setFiberType('144ct');
                    else if (result.cableType.includes('96')) setFiberType('96ct');
                    else if (result.cableType.includes('24')) setFiberType('24ct');
                    else if (result.cableType.includes('12')) setFiberType('12ct');
                }

                // 3. Auto-fill Assets (Counters)
                if (result.equipmentCounts && result.equipmentCounts.length > 0) {
                    let s = 0, a = 0, c = 0, r = 0;
                    
                    result.equipmentCounts.forEach(item => {
                        const name = item.name.toLowerCase();
                        const qty = item.quantity || 0;

                        if (name.includes('snowshoe') || name.includes('reserva')) s += qty;
                        if (name.includes('anchor') || name.includes('ancora') || name.includes('guy')) a += qty;
                        if (name.includes('coil')) c += qty;
                        if (name.includes('riser') || name.includes('guard') || name.includes('descida')) r += qty;
                    });

                    setSnowshoes(s);
                    setAnchors(a);
                    setCoils(c);
                    setRisers(r);
                } else {
                    // Reset if nothing found to ensure we don't hold stale data
                    setSnowshoes(0);
                    setAnchors(0);
                    setCoils(0);
                    setRisers(0);
                }

                setIsVerifying(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!routeId || !footage) {
            alert("Preencha o ID da rota e a metragem.");
            return;
        }

        const workData: Partial<Invoice> = {
            routeId,
            totalFootage: parseFloat(footage),
            items: {
                snowshoes,
                anchors,
                coils,
                risers
            }
        };

        onSubmitWork(workData);

        // Reset Form
        setRouteId('');
        setFootage('');
        setAnchors(0);
        setSnowshoes(0);
        setCoils(0);
        setRisers(0);
        setSelectedMap(null);
        setAiCheckResult(null);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="glass-panel p-6 rounded-3xl border-l-4 border-l-fs-brand flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Diário de Campo</h2>
                    <p className="text-slate-400 font-medium text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-fs-success animate-pulse"></span>
                        Crew Alpha • {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="bg-fs-brand/10 p-3 rounded-xl border border-fs-brand/20">
                    <HardHat className="w-8 h-8 text-fs-brand" />
                </div>
            </div>

            {/* WALLET SECTION */}
            <div className="bg-gradient-to-br from-[#1a1f2e] to-[#02040a] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-fs-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-fs-brand/10 transition-colors"></div>
                
                <div className="flex justify-between items-start relative z-10 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Wallet className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Saldo Disponível</span>
                        </div>
                        <h3 className="text-4xl font-bold text-white tracking-tighter">{formatCurrency(currentBalance)}</h3>
                    </div>
                    <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors border border-white/5">
                        Ver Extrato
                    </button>
                </div>
            </div>

            {/* AI MAP ANALYSIS SECTION - PROMINENT */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                 <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between">
                     <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                        <MapIcon className="w-4 h-4 text-purple-400" /> Análise de Mapa & Fusão
                     </h3>
                     {isVerifying && <span className="text-xs text-purple-300 font-bold animate-pulse">PROCESSANDO...</span>}
                 </div>
                 
                 <div className="p-6 space-y-6">
                     {/* Upload Area */}
                     {!selectedMap ? (
                         <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-2xl p-8 text-center cursor-pointer transition-all group"
                         >
                             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-white/5">
                                <UploadCloud className="w-8 h-8 text-purple-400" />
                             </div>
                             <h4 className="text-white font-bold mb-1">Carregar Mapa (PDF/IMG)</h4>
                             <p className="text-sm text-slate-400">A IA irá calcular metragens e sugerir o ponto de fusão.</p>
                             <input type="file" ref={fileInputRef} onChange={handleMapUpload} accept="image/*,application/pdf" className="hidden" />
                         </div>
                     ) : (
                         <div className="space-y-6">
                             {/* Map Preview */}
                             <div className="relative h-48 rounded-xl overflow-hidden bg-[#02040a] border border-white/10">
                                 <img src={selectedMap} alt="Map" className="w-full h-full object-contain opacity-60" />
                                 <div className="absolute bottom-2 right-2">
                                     <button onClick={() => setSelectedMap(null)} className="bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 font-bold rounded-lg hover:bg-red-500/80 transition-colors border border-white/10">
                                         Remover
                                     </button>
                                 </div>
                             </div>

                             {/* AI RESULTS */}
                             {aiCheckResult && (
                                 <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
                                     {/* 1. Technical Count */}
                                     <div className="grid grid-cols-2 gap-3">
                                         <div className="bg-[#02040a] p-4 rounded-xl border border-white/10">
                                             <p className="text-[10px] text-slate-400 uppercase font-extrabold mb-1">Total Metragem</p>
                                             <p className="text-xl font-bold text-white font-mono">{aiCheckResult.totalCableLength} ft</p>
                                         </div>
                                         <div className="bg-[#02040a] p-4 rounded-xl border border-white/10">
                                             <p className="text-[10px] text-slate-400 uppercase font-extrabold mb-1">Tipo Fibra</p>
                                             <p className="text-xl font-bold text-purple-400">{aiCheckResult.cableType}</p>
                                         </div>
                                     </div>

                                     {/* 2. SPLICE OPTIMIZATION (THE NEW FEATURE) */}
                                     {aiCheckResult.spliceRecommendation ? (
                                         <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-5 rounded-2xl border border-purple-500/30 relative overflow-hidden">
                                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                                 <GitMerge className="w-20 h-20 text-white" />
                                             </div>
                                             
                                             <div className="flex items-center gap-2 mb-3">
                                                 <Lightbulb className="w-5 h-5 text-yellow-400" />
                                                 <h4 className="font-bold text-white uppercase tracking-wider text-sm">Sugestão de Fusão (IA)</h4>
                                             </div>
                                             
                                             <div className="space-y-3 relative z-10">
                                                 <div className="flex items-start gap-3">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0"></div>
                                                     <div>
                                                         <p className="text-xs text-purple-300 font-bold uppercase">Localização Ideal</p>
                                                         <p className="text-lg font-bold text-white">{aiCheckResult.spliceRecommendation.location}</p>
                                                     </div>
                                                 </div>
                                                 <div className="flex items-start gap-3">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                                                     <div>
                                                         <p className="text-xs text-blue-300 font-bold uppercase">Análise de Engenharia</p>
                                                         <p className="text-sm text-slate-300 leading-relaxed font-medium">{aiCheckResult.spliceRecommendation.reason}</p>
                                                     </div>
                                                 </div>
                                                 
                                                 <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                                                     <span className="text-xs font-bold text-slate-400">Ação Recomendada:</span>
                                                     <span className="bg-purple-500 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg shadow-purple-500/20 uppercase tracking-wide">
                                                         {aiCheckResult.spliceRecommendation.action}
                                                     </span>
                                                 </div>
                                             </div>
                                         </div>
                                     ) : (
                                         <div className="p-4 rounded-xl border border-white/5 bg-white/5 text-center">
                                             <p className="text-xs text-slate-500">Nenhum dado extraído ou análise falhou. Tente uma imagem mais nítida.</p>
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
            </div>

            {/* Main Form */}
            <div className="space-y-6">
                
                {/* Route & Fiber Info */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                        <MapIcon className="w-4 h-4 text-fs-brand" /> Detalhes da Execução
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase ml-1 block mb-2">Rota ID</label>
                            <input 
                                type="text" 
                                value={routeId}
                                onChange={(e) => setRouteId(e.target.value)}
                                placeholder="ex: R-705" 
                                className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-fs-brand outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-bold uppercase ml-1 block mb-2">Tipo Fibra</label>
                            <div className="relative">
                                <select 
                                    value={fiberType}
                                    onChange={(e) => setFiberType(e.target.value)}
                                    className="w-full bg-[#02040a] border border-white/10 rounded-xl p-3 text-white focus:border-fs-brand outline-none appearance-none transition-colors"
                                >
                                    <option value="12ct">12ct Flat</option>
                                    <option value="24ct">24ct ADSS</option>
                                    <option value="48ct">48ct ADSS</option>
                                    <option value="96ct">96ct ADSS</option>
                                    <option value="144ct">144ct Ribbon</option>
                                    <option value="288ct">288ct Ribbon</option>
                                    <option value="mst-2p">MST / Drop (2 Portas)</option>
                                    <option value="mst-4p">MST / Drop (4 Portas)</option>
                                    <option value="mst-6p">MST / Drop (6 Portas)</option>
                                    <option value="mst-8p">MST / Drop (8 Portas)</option>
                                </select>
                                <ChevronRight className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rotate-90" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase ml-1 block mb-2">Metragem Instalada (Pés)</label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input 
                                type="number" 
                                value={footage}
                                onChange={(e) => setFootage(e.target.value)}
                                placeholder="0" 
                                className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-lg focus:border-fs-brand outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Assets Counter */}
                <div className="glass-panel p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
                        <BoxSelect className="w-4 h-4 text-fs-brand" /> Ativos Instalados (Auto-Fill IA)
                    </h3>
                    <div className="space-y-3">
                        <AssetCounter label="Snowshoes (Reserva)" count={snowshoes} onChange={setSnowshoes} />
                        <AssetCounter label="Âncoras (Guy Wire)" count={anchors} onChange={setAnchors} />
                        <AssetCounter label="Coils" count={coils} onChange={setCoils} />
                        <AssetCounter label="Risers / U-Guards" count={risers} onChange={setRisers} />
                    </div>
                </div>

                {/* ESTIMATED EARNINGS CARD */}
                <div className="bg-[#02040a] border border-white/10 p-5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Calculator className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase">Faturamento Estimado</p>
                            <p className="text-xs text-slate-500">Baseado nas taxas atuais</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white tracking-tighter">{formatCurrency(estimatedEarnings)}</p>
                    </div>
                </div>

                {/* Submit Button - Aggressive Orange */}
                <button 
                    onClick={handleSubmit}
                    className="w-full bg-action-gradient py-5 rounded-2xl font-bold text-white text-lg shadow-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wide"
                >
                    <Send className="w-5 h-5" /> Enviar Relatório Diário
                </button>

            </div>
        </div>
    );
};

export default LinemanPortal;