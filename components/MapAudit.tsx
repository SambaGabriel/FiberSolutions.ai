
import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Ruler, DollarSign, Calculator, AlertCircle, Scan, FileText, Globe, Mountain } from 'lucide-react';
import { analyzeMapBoQ } from '../services/geminiService';
import { MapAnalysisResult, UnitRates } from '../types';
import FiberLoader from './FiberLoader';

interface MapAuditProps {
    rates?: UnitRates;
}

const MapAudit: React.FC<MapAuditProps> = ({ rates }) => {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [rawKml, setRawKml] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'pdf' | 'kml'>('image');
    const [fileName, setFileName] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<MapAnalysisResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setResult(null);
            
            if (file.name.endsWith('.kml') || file.name.endsWith('.kmz')) {
                setFileType('kml');
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Note: In a real app, KMZ needs unzip. Here we treat text reading for KML
                    const text = e.target?.result as string;
                    setRawKml(text);
                    setSelectedFile('kml-placeholder'); 
                };
                if (file.name.endsWith('.kml')) {
                     reader.readAsText(file);
                } else {
                     setSelectedFile('kml-placeholder');
                     setRawKml("MOCKED KMZ CONTENT");
                }
            } else if (file.type === 'application/pdf') {
                setFileType('pdf');
                const reader = new FileReader();
                reader.onloadend = () => setSelectedFile(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setFileType('image');
                const reader = new FileReader();
                reader.onloadend = () => setSelectedFile(reader.result as string);
                reader.readAsDataURL(file);
            }
        }
    };

    const runAnalysis = async () => {
        if (!selectedFile) return;
        setIsAnalyzing(true);
        try {
            if (fileType === 'kml' && rawKml) {
                const data = await analyzeMapBoQ(rawKml, 'application/vnd.google-earth.kml+xml', rates);
                setResult(data);
            } else {
                const parts = selectedFile?.split(',') || [];
                const meta = parts[0];
                const base64Data = parts[1] || 'mocked_base64'; 
                const mimeType = meta ? meta.split(':')[1].split(';')[0] : 'application/octet-stream';
                const data = await analyzeMapBoQ(base64Data, mimeType, rates);
                setResult(data);
            }
        } catch (error) {
            alert("Erro ao processar o arquivo.");
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Upload & Preview */}
                <div className="lg:col-span-5 space-y-6">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative aspect-[3/4] rounded-3xl border-2 border-dashed transition-all duration-300
                            flex flex-col items-center justify-center cursor-pointer overflow-hidden group bg-slate-900/50
                            ${selectedFile ? 'border-blue-500/50' : 'border-slate-700 hover:border-blue-500/50'}
                        `}
                    >
                        {selectedFile ? (
                            <>
                                {fileType === 'pdf' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 p-4">
                                        <FileText className="w-20 h-20 text-red-400 mb-4" />
                                        <p className="text-white font-medium text-center break-all px-4">{fileName}</p>
                                        <p className="text-xs text-slate-400 mt-2 uppercase font-bold">PDF Pronto</p>
                                    </div>
                                )}
                                {fileType === 'kml' && (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 p-4 relative overflow-hidden">
                                        {/* Brand Image: Digital Network/Map Abstract */}
                                        <div 
                                            className="absolute inset-0 opacity-30 bg-cover bg-center animate-spin" 
                                            style={{ 
                                                backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')",
                                                animationDuration: '120s'
                                            }}
                                        ></div>
                                        <Globe className="w-24 h-24 text-blue-400 mb-4 relative z-10" />
                                        <p className="text-white font-medium text-center break-all px-4 relative z-10">{fileName}</p>
                                        <p className="text-xs text-blue-300 mt-2 uppercase font-bold relative z-10 flex items-center gap-1">
                                            <Mountain className="w-3 h-3" /> Dados Geospaciais Ativos
                                        </p>
                                    </div>
                                )}
                                {fileType === 'image' && (
                                    <img src={selectedFile} alt="Map Preview" className="w-full h-full object-contain p-2" />
                                )}
                                
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10">
                                    <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 text-white font-medium">
                                        <UploadCloud className="w-5 h-5" /> Alterar Arquivo
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-blue-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Carregar Projeto</h3>
                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                    Suporte para <strong>KML/KMZ</strong> (Google Earth), <strong>PDF</strong> ou Imagem.
                                </p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*,application/pdf,.kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz" 
                            className="hidden" 
                        />
                    </div>

                    <button
                        onClick={runAnalysis}
                        disabled={!selectedFile || isAnalyzing}
                        className={`
                            w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                            ${!selectedFile || isAnalyzing
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-glow hover:-translate-y-1'
                            }
                        `}
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center gap-3">
                                <FiberLoader size={24} showText={false} />
                                <span>Espinar Dados...</span>
                            </div>
                        ) : (
                            <><Calculator className="w-6 h-6" /> Auditar Projeto</>
                        )}
                    </button>
                </div>

                {/* Right Col: Results */}
                <div className="lg:col-span-7">
                    {!result ? (
                        <div className="h-full glass-panel rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-50 min-h-[400px]">
                            {isAnalyzing ? (
                                <FiberLoader size={120} text="Processando Topografia..." />
                            ) : (
                                <>
                                    <Globe className="w-16 h-16 text-slate-500 mb-4" />
                                    <h3 className="text-xl font-medium text-white">Engenharia OSP</h3>
                                    <p className="text-slate-400 mt-2 max-w-md">
                                        A IA utilizará as <strong>taxas do contrato</strong> para calcular o custo estimado e gerar o BoQ.
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Cabo Total ({result.cableType})</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">{result.totalCableLength.toLocaleString()}</span>
                                        <span className="text-sm text-emerald-400 font-medium">pés</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">{result.spanCount} vãos identificados</p>
                                </div>
                                <div className="glass-panel p-5 rounded-2xl border-l-4 border-blue-500">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Custo Estimado (Labor)</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">{formatCurrency(result.financials.estimatedLaborCost)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">Baseado no Contrato Ativo</p>
                                </div>
                            </div>

                            {/* Potential Savings Alert */}
                            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/20 rounded-full">
                                        <DollarSign className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Potencial de Economia</h4>
                                        <p className="text-sm text-amber-200/70">Diferença estimada vs. padrão</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-amber-400">{formatCurrency(result.financials.potentialSavings)}</span>
                                </div>
                            </div>

                            {/* Equipment Table */}
                            <div className="glass-panel rounded-2xl overflow-hidden">
                                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                                    <Scan className="w-4 h-4 text-blue-400" />
                                    <h4 className="text-sm font-bold text-white">Equipamentos Detectados</h4>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {result.equipmentCounts.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                                <span className="text-sm text-slate-300 font-medium">{item.name}</span>
                                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold">
                                                    {item.quantity} un
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapAudit;
