
import React, { useState } from 'react';
import { DollarSign, CheckCircle, AlertOctagon, FileText, TrendingUp, Search, Filter, CreditCard, X, ShieldCheck, Zap, Settings, Save, ScrollText } from 'lucide-react';
import { Invoice, Transaction, UnitRates } from '../types';

interface AdminPortalProps {
    invoices: Invoice[];
    onPayInvoice: (invoiceId: string, transaction: Transaction) => void;
    rates: UnitRates;
    onUpdateRates: (rates: UnitRates) => void;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ invoices, onPayInvoice, rates, onUpdateRates }) => {
    const [activeTab, setActiveTab] = useState<'invoices' | 'rates'>('invoices');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [filterText, setFilterText] = useState('');
    
    // Rate Editing State
    const [tempRates, setTempRates] = useState<UnitRates>(rates);
    const [isSaved, setIsSaved] = useState(false);

    // Constants
    const TRANSACTION_FEE_PERCENTAGE = 0.0069; // 0.69%

    // Calculate Totals based on real props
    const totalWIP = invoices.filter(i => i.status === 'PENDING_QC' || i.status === 'DRAFT').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalApproved = invoices.filter(i => i.status === 'APPROVED').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalQCBlocked = invoices.filter(i => i.qcStatus === 'FAILED').reduce((acc, curr) => acc + curr.totalAmount, 0);

    const filteredInvoices = invoices.filter(inv => 
        inv.crewName.toLowerCase().includes(filterText.toLowerCase()) ||
        inv.routeId.toLowerCase().includes(filterText.toLowerCase()) ||
        inv.id.toLowerCase().includes(filterText.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'PAID': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'APPROVED': return 'bg-fs-brand/10 text-fs-brand border-fs-brand/20'; // ORANGE
            case 'PENDING_QC': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'DRAFT': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    const getQCColor = (status: string) => {
        switch(status) {
            case 'PASSED': return 'text-emerald-400';
            case 'FAILED': return 'text-fs-brand'; // ORANGE for fail to grab attention
            default: return 'text-slate-500';
        }
    };

    const handlePayClick = (invoice: Invoice) => {
        if (invoice.status === 'APPROVED') {
            setSelectedInvoice(invoice);
        }
    };

    const confirmPayment = () => {
        if (!selectedInvoice) return;
        setIsProcessingPayment(true);
        
        setTimeout(() => {
            const fee = selectedInvoice.totalAmount * TRANSACTION_FEE_PERCENTAGE;
            const net = selectedInvoice.totalAmount - fee;

            const newTransaction: Transaction = {
                id: `TX-${Date.now()}`,
                date: new Date().toISOString(),
                amount: selectedInvoice.totalAmount,
                fee: fee,
                netAmount: net,
                status: 'COMPLETED',
                type: 'PAYOUT',
                description: `Pagamento Invoice ${selectedInvoice.id}`
            };

            onPayInvoice(selectedInvoice.id, newTransaction);
            setIsProcessingPayment(false);
            setSelectedInvoice(null);
        }, 1500); 
    };

    const handleRateChange = (key: keyof UnitRates, value: string) => {
        setTempRates(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }));
        setIsSaved(false);
    };

    const saveRates = () => {
        onUpdateRates(tempRates);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Gestão & Financeiro</h2>
                    <p className="text-slate-400 text-lg font-light">Controle de Invoices, Produção e Auditoria Interna.</p>
                </div>
                
                {/* Tabs - Updated to Orange Branding */}
                <div className="flex bg-[#0b1121] p-1 rounded-xl border border-white/5 shadow-sharp">
                    <button 
                        onClick={() => setActiveTab('invoices')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'invoices' ? 'bg-fs-brand text-white shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Invoices
                    </button>
                    <button 
                        onClick={() => setActiveTab('rates')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'rates' ? 'bg-fs-brand text-white shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <ScrollText className="w-4 h-4" /> Contrato & Tarifas
                    </button>
                </div>
            </div>

            {activeTab === 'invoices' ? (
                <>
                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-fs-brand/30 transition-colors">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <DollarSign className="w-24 h-24 text-white" />
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Receita Pendente (WIP)</p>
                            <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{formatCurrency(totalWIP)}</h3>
                            <div className="mt-4 flex items-center gap-2 text-amber-500 text-sm font-bold bg-amber-500/10 w-fit px-2 py-1 rounded">
                                <AlertOctagon className="w-4 h-4" />
                                <span>Aguardando QC</span>
                            </div>
                        </div>

                        {/* Highlighted Card */}
                        <div className="relative p-6 rounded-2xl overflow-hidden shadow-glow border border-fs-brand bg-gradient-to-br from-[#1a0f0a] to-[#02040a]">
                             <div className="absolute top-0 right-0 p-6 opacity-10">
                                <CheckCircle className="w-24 h-24 text-fs-brand" />
                            </div>
                            <p className="text-xs text-fs-brand font-bold uppercase tracking-widest">Aprovado para Pagamento</p>
                            <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{formatCurrency(totalApproved)}</h3>
                            <div className="mt-4 flex items-center gap-2 text-white text-sm font-bold bg-fs-brand/20 w-fit px-2 py-1 rounded border border-fs-brand/20">
                                <TrendingUp className="w-4 h-4" />
                                <span>Pronto para Faturar</span>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-colors">
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <AlertOctagon className="w-24 h-24 text-white" />
                            </div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Retido por Qualidade (QC)</p>
                            <h3 className="text-4xl font-extrabold text-white mt-2 tracking-tight">{formatCurrency(totalQCBlocked)}</h3>
                            <div className="mt-4 flex items-center gap-2 text-rose-500 text-sm font-bold bg-rose-500/10 w-fit px-2 py-1 rounded">
                                <AlertOctagon className="w-4 h-4" />
                                <span>Ação Necessária</span>
                            </div>
                        </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-fs-brand" /> Histórico de Produção
                            </h3>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="relative flex-1 md:w-72">
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text" 
                                        value={filterText}
                                        onChange={(e) => setFilterText(e.target.value)}
                                        placeholder="Buscar Crew, Rota ou ID..." 
                                        className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-fs-brand/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#050914] text-slate-400 text-[10px] uppercase tracking-widest border-b border-white/5">
                                        <th className="p-4 font-bold whitespace-nowrap">ID / Data</th>
                                        <th className="p-4 font-bold whitespace-nowrap">Equipe (Crew)</th>
                                        <th className="p-4 font-bold whitespace-nowrap">Rota</th>
                                        <th className="p-4 font-bold text-right whitespace-nowrap">Produção (ft)</th>
                                        <th className="p-4 font-bold text-right whitespace-nowrap">Valor ($)</th>
                                        <th className="p-4 font-bold text-center whitespace-nowrap">Status QC</th>
                                        <th className="p-4 font-bold text-center whitespace-nowrap">Status Fatura</th>
                                        <th className="p-4 font-bold text-center whitespace-nowrap">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm text-slate-200 divide-y divide-white/5">
                                    {filteredInvoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="font-bold text-white group-hover:text-fs-brand transition-colors">{inv.id}</div>
                                                <div className="text-slate-500 text-xs font-mono">{inv.date}</div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap font-medium">{inv.crewName}</td>
                                            <td className="p-4 whitespace-nowrap">
                                                <span className="bg-[#02040a] px-2 py-1 rounded text-xs border border-white/10 font-mono text-slate-300">
                                                    {inv.routeId}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right font-mono whitespace-nowrap text-slate-300">{inv.totalFootage.toLocaleString()} ft</td>
                                            <td className="p-4 text-right font-bold text-white whitespace-nowrap tracking-tight">{formatCurrency(inv.totalAmount)}</td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <div className={`font-bold text-xs flex items-center justify-center gap-1 ${getQCColor(inv.qcStatus)}`}>
                                                    {inv.qcStatus === 'PASSED' && <CheckCircle className="w-3 h-3" />}
                                                    {inv.qcStatus === 'FAILED' && <AlertOctagon className="w-3 h-3" />}
                                                    {inv.qcStatus === 'NOT_STARTED' && <span className="text-slate-600 font-bold">-</span>}
                                                    {inv.qcStatus === 'NOT_STARTED' ? 'Aguardando' : inv.qcStatus}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(inv.status)}`}>
                                                    {inv.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center whitespace-nowrap">
                                                {inv.status === 'APPROVED' ? (
                                                    <button 
                                                        onClick={() => handlePayClick(inv)}
                                                        className="bg-fs-brand hover:bg-fs-brandHover text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide shadow-glow transition-all flex items-center gap-2 mx-auto"
                                                    >
                                                        <DollarSign className="w-3 h-3" /> Pagar
                                                    </button>
                                                ) : inv.status === 'PAID' ? (
                                                    <span className="text-emerald-500 text-xs flex items-center justify-center gap-1 font-bold">
                                                        <CheckCircle className="w-3 h-3" /> Pago
                                                    </span>
                                                ) : (
                                                    <button className="text-slate-600 cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border border-white/5 bg-white/[0.02] mx-auto">
                                                        Aguardando
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* RATES / CONTRACT TAB */
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                <ScrollText className="w-6 h-6 text-fs-brand" /> Contrato Digital
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Defina os valores unitários (Unit Rates). A IA usará estes dados para calcular orçamentos.
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-fs-brand/10 border border-fs-brand/20 rounded-lg text-fs-brand text-xs font-bold uppercase tracking-wide">
                            Contrato Ativo
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* AERIAL CONSTRUCTION */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
                            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between">
                                <span>Construção Aérea</span>
                                <span className="text-slate-500">Valor p/ Pé (ft)</span>
                            </h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex justify-between">
                                        Strand (Cordoalha)
                                        <span className="text-emerald-400 font-mono text-[10px]">Aerial</span>
                                    </label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="0.01" 
                                            value={tempRates.strand}
                                            onChange={e => handleRateChange('strand', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors text-lg font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex justify-between">
                                        Fibra Óptica (Lashing)
                                        <span className="text-emerald-400 font-mono text-[10px]">Aerial</span>
                                    </label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="0.01" 
                                            value={tempRates.fiber}
                                            onChange={e => handleRateChange('fiber', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors text-lg font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 flex justify-between">
                                        Overlash
                                        <span className="text-emerald-400 font-mono text-[10px]">Aerial</span>
                                    </label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="0.01" 
                                            value={tempRates.overlash}
                                            onChange={e => handleRateChange('overlash', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors text-lg font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ASSETS & HARDWARE */}
                        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
                            <h4 className="text-xs font-extrabold text-white uppercase tracking-widest border-b border-white/10 pb-2 flex justify-between">
                                <span>Hardware & Ativos</span>
                                <span className="text-slate-500">Valor Unitário (un)</span>
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block truncate">Âncora (Down Guy)</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="1.00" 
                                            value={tempRates.anchor}
                                            onChange={e => handleRateChange('anchor', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-2 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block truncate">Snowshoe (Reserva)</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="1.00" 
                                            value={tempRates.snowshoe}
                                            onChange={e => handleRateChange('snowshoe', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-2 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block truncate">Composite (Make Ready)</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="0.50" 
                                            value={tempRates.composite}
                                            onChange={e => handleRateChange('composite', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-2 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase mb-1 block truncate">Riser / U-Guard</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-fs-brand transition-colors" />
                                        <input 
                                            type="number" step="1.00" 
                                            value={tempRates.riser}
                                            onChange={e => handleRateChange('riser', e.target.value)}
                                            className="w-full bg-[#02040a] border border-white/10 rounded-xl pl-9 pr-2 py-3 text-white focus:border-fs-brand outline-none font-mono transition-colors font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-4 z-20 flex justify-end">
                        <button 
                            onClick={saveRates}
                            className={`
                                px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-2xl transform hover:-translate-y-1
                                ${isSaved 
                                    ? 'bg-emerald-600 text-white cursor-default scale-105' 
                                    : 'bg-action-gradient text-white shadow-glow'
                                }
                            `}
                        >
                            {isSaved ? (
                                <><CheckCircle className="w-5 h-5" /> Taxas Salvas & Sincronizadas</>
                            ) : (
                                <><Save className="w-5 h-5" /> Salvar Alterações de Contrato</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* PAYMENT MODAL (Same as before but darkened) */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#0b1121] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl p-6 relative overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-fs-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-fs-brand" /> Realizar Pagamento
                            </h3>
                            <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center p-4 bg-[#02040a] rounded-xl border border-white/5">
                                <span className="text-slate-400 text-sm font-medium">Beneficiário</span>
                                <span className="text-white font-bold">{selectedInvoice.crewName}</span>
                            </div>

                            <div className="space-y-2 py-4 border-y border-white/5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Valor Bruto (Invoice)</span>
                                    <span className="text-white font-mono">{formatCurrency(selectedInvoice.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 flex items-center gap-1">
                                        Taxa de Processamento <span className="bg-slate-800 px-1 rounded text-[10px] text-slate-300 font-bold">0.69%</span>
                                    </span>
                                    <span className="text-rose-400 font-mono">- {formatCurrency(selectedInvoice.totalAmount * TRANSACTION_FEE_PERCENTAGE)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-2 border-t border-dashed border-white/10">
                                    <span className="text-emerald-400 font-bold">Líquido a Receber</span>
                                    <span className="text-2xl font-bold text-white font-mono">
                                        {formatCurrency(selectedInvoice.totalAmount * (1 - TRANSACTION_FEE_PERCENTAGE))}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500 bg-[#02040a] p-3 rounded-lg border border-white/5">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span>Pagamento via Instant Transfer seguro. O valor cairá na conta do Lineman em até 30min.</span>
                            </div>
                        </div>

                        <button 
                            onClick={confirmPayment}
                            disabled={isProcessingPayment}
                            className="w-full bg-action-gradient hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                            {isProcessingPayment ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processando...
                                </span>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 fill-current" /> Confirmar Transferência
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPortal;
