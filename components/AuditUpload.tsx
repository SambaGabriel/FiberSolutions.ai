import React, { useState, useRef } from 'react';
import { Camera, UploadCloud, Check, X, AlertTriangle, Play, Sparkles, ScanLine, AlertCircle, ArrowRight } from 'lucide-react';
import { analyzeConstructionImage } from '../services/geminiService';
import { AuditResult, AuditStatus } from '../types';
import FiberLoader from './FiberLoader';

interface AuditUploadProps {
    onAnalysisComplete?: (result: AuditResult) => void;
}

const AuditUpload: React.FC<AuditUploadProps> = ({ onAnalysisComplete }) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AuditResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null); // Reset result on new image
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!selectedImage) return;
        
        setIsAnalyzing(true);
        try {
            const base64Data = selectedImage.split(',')[1];
            const auditResult = await analyzeConstructionImage(base64Data);
            setResult(auditResult);
            
            if (onAnalysisComplete) {
                onAnalysisComplete(auditResult);
            }

        } catch (error) {
            alert("Falha na análise. Tente novamente.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStatusColor = (status: AuditStatus) => {
        switch (status) {
            case AuditStatus.COMPLIANT: return 'text-fs-success bg-fs-success/10 border-fs-success/20';
            case AuditStatus.DIVERGENT: return 'text-fs-warning bg-fs-warning/10 border-fs-warning/20';
            case AuditStatus.CRITICAL: return 'text-fs-danger bg-fs-danger/10 border-fs-danger/20';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-bottom-6 duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fs-brand/10 border border-fs-brand/20 text-fs-brand text-[10px] font-bold uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Gemini 2.5 Vision Engine
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tighter">Auditoria Visual</h2>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Carregue fotos da rede para análise instantânea de hardware e conformidade.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Upload Section */}
                <div className="space-y-6">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all duration-300
                            flex flex-col items-center justify-center cursor-pointer overflow-hidden group
                            ${selectedImage 
                                ? 'border-fs-brand/50 bg-slate-900' 
                                : 'border-slate-700 hover:border-fs-brand/50 bg-slate-800/20 hover:bg-slate-800/40'
                            }
                        `}
                    >
                        {selectedImage ? (
                            <>
                                <img src={selectedImage} alt="Preview" className="w-full h-full object-contain opacity-90 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-transparent opacity-80"></div>
                            </>
                        ) : (
                            <div className="text-center p-8 relative z-10">
                                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300 border border-white/5">
                                    <Camera className="w-10 h-10 text-slate-400 group-hover:text-fs-brand" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Capturar ou Carregar</h3>
                                <p className="text-sm text-slate-500 font-medium">Formatos JPG, PNG suportados</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                        
                        {selectedImage && !isAnalyzing && (
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm">
                                 <span className="text-white font-bold flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full border border-white/20 hover:bg-white/20 transition-all">
                                     <UploadCloud className="w-5 h-5" /> Trocar imagem
                                 </span>
                             </div>
                        )}
                        
                        {isAnalyzing && (
                            <div className="absolute inset-0 bg-[#02040a]/90 backdrop-blur-md flex flex-col items-center justify-center z-20">
                                <FiberLoader size={100} text="Processando Imagem" />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={runAnalysis}
                        disabled={!selectedImage || isAnalyzing}
                        className={`
                            w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 uppercase tracking-wide
                            ${!selectedImage || isAnalyzing
                                ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800' 
                                : 'bg-action-gradient text-white shadow-glow hover:brightness-110 hover:-translate-y-1'
                            }
                        `}
                    >
                        {!isAnalyzing && <Sparkles className="w-5 h-5 fill-white" />}
                        {isAnalyzing ? 'Lashing...' : 'Executar Auditoria IA'}
                        {!isAnalyzing && <ArrowRight className="w-5 h-5" />}
                    </button>
                </div>

                {/* Results Section */}
                <div className="glass-panel rounded-3xl p-1 min-h-[600px] flex flex-col relative overflow-hidden border border-white/10">
                    
                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center bg-[#050914]">
                            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 opacity-50">
                                <ScanLine className="w-10 h-10 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Aguardando Input</h3>
                            <p className="text-sm text-slate-500 max-w-xs font-medium">Os dados técnicos e score de conformidade aparecerão aqui após a análise.</p>
                        </div>
                    ) : (
                        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right duration-500 relative z-10">
                            {/* Score Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-extrabold mb-1">Score de Qualidade</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-6xl font-extrabold tracking-tighter ${result.complianceScore > 80 ? 'text-white' : 'text-fs-warning'}`}>{result.complianceScore}</span>
                                        <span className="text-xl text-slate-500 font-bold">/100</span>
                                    </div>
                                </div>
                                <div className={`px-6 py-3 rounded-xl border flex items-center gap-3 font-bold uppercase tracking-wide shadow-lg ${getStatusColor(result.status)}`}>
                                    {result.status === AuditStatus.COMPLIANT && <Check className="w-6 h-6" />}
                                    {result.status === AuditStatus.DIVERGENT && <AlertTriangle className="w-6 h-6" />}
                                    {result.status === AuditStatus.CRITICAL && <AlertCircle className="w-6 h-6" />}
                                    <span>{result.status}</span>
                                </div>
                            </div>

                            {/* AI Summary Box */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-fs-brand to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative bg-[#0a0f1e] p-6 rounded-2xl border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sparkles className="w-4 h-4 text-fs-brand" />
                                        <h4 className="text-[10px] font-extrabold text-white uppercase tracking-widest">Diagnóstico IA</h4>
                                    </div>
                                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                        {result.aiSummary}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#0b1121] p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Check className="w-3 h-3" /> Hardware Detectado
                                    </h4>
                                    <ul className="space-y-3">
                                        {result.detectedItems.map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-slate-200 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-fs-accent shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-[#0b1121] p-6 rounded-2xl border border-white/5">
                                    <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" /> Pontos de Atenção
                                    </h4>
                                    <ul className="space-y-3">
                                        {result.issues.length > 0 ? result.issues.map((issue, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-rose-300 font-medium bg-rose-500/5 p-2 rounded">
                                                <X className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                                                <span className="opacity-90">{issue}</span>
                                            </li>
                                        )) : (
                                            <li className="text-fs-success text-sm flex items-center gap-2 font-bold p-2 bg-fs-success/5 rounded">
                                                <Check className="w-4 h-4" /> Instalação 100% Conforme
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditUpload;