
import React, { useState } from 'react';
import { Camera, Map as MapIcon, Calculator } from 'lucide-react';
import AuditUpload from './AuditUpload';
import MapAudit from './MapAudit';
import { AuditResult, UnitRates } from '../types';

interface EngineeringHubProps {
    onAnalysisComplete: (result: AuditResult) => void;
    rates: UnitRates;
}

const EngineeringHub: React.FC<EngineeringHubProps> = ({ onAnalysisComplete, rates }) => {
    const [activeTab, setActiveTab] = useState<'photos' | 'maps'>('maps');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Calculator className="w-8 h-8 text-fs-brand" />
                        Engenharia & Qualidade
                    </h2>
                    <p className="text-slate-400 font-medium text-sm mt-1">
                        Central unificada para auditoria visual e análise de projetos.
                    </p>
                </div>

                <div className="flex bg-[#0b1121] p-1 rounded-xl border border-white/5 shadow-sharp self-start md:self-auto">
                    <button 
                        onClick={() => setActiveTab('maps')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'maps' ? 'bg-fs-brand text-white shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <MapIcon className="w-4 h-4" /> Projetos (BoQ)
                    </button>
                    <button 
                        onClick={() => setActiveTab('photos')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'photos' ? 'bg-fs-brand text-white shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Camera className="w-4 h-4" /> Fotos de Campo
                    </button>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'maps' ? (
                    <MapAudit rates={rates} />
                ) : (
                    <AuditUpload onAnalysisComplete={onAnalysisComplete} />
                )}
            </div>
        </div>
    );
};

export default EngineeringHub;
