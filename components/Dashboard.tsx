import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, DollarSign, Activity, TrendingDown, ArrowUpRight, Zap, Calendar, Download, ChevronDown } from 'lucide-react';
import { ViewState, Invoice, Transaction } from '../types';

interface DashboardProps {
    onNavigate: (view: ViewState) => void;
    invoices: Invoice[];
    transactions: Transaction[];
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, highlight = false }: any) => (
    <div className={`
        relative overflow-hidden group hover:-translate-y-1 transition-all duration-300
        p-6 rounded-2xl border
        ${highlight 
            ? 'bg-gradient-to-br from-[#ff5500] to-[#cc4400] border-[#ff5500] shadow-glow' 
            : 'glass-panel border-white/5 hover:border-white/10'
        }
    `}>
        {/* Abstract shape for background interest */}
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>

        <div className="flex justify-between items-start mb-6 relative z-10">
            <div className={`p-3 rounded-xl border ${highlight ? 'bg-white/20 border-white/20 text-white' : 'bg-[#1e293b] border-white/5 text-slate-400'}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border
                    ${highlight 
                        ? 'bg-black/20 text-white border-black/10' 
                        : trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : trend === 'down' ? 'bg-rose-500/10 text-rose-400 border-rose-500/10' : 'bg-slate-500/10 text-slate-400 border-slate-500/10'
                    }`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                    <span>{trend === 'up' ? '+%' : trend === 'down' ? '-%' : '0%'}</span>
                </div>
            )}
        </div>
        
        <div className="relative z-10">
            <h3 className={`text-3xl font-bold tracking-tighter mb-1 ${highlight ? 'text-white' : 'text-white'}`}>{value}</h3>
            <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${highlight ? 'text-white/80' : 'text-slate-400'}`}>{title}</p>
            <p className={`text-xs ${highlight ? 'text-white/60' : 'text-slate-500'}`}>{subtitle}</p>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, invoices, transactions }) => {
    // --- REPORT PERIOD STATE ---
    const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
    
    // --- DYNAMIC CALCULATIONS ---
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter Logic based on Period
    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const d = new Date(inv.date);
            const isSameMonth = d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            
            if (reportPeriod === 'monthly') return isSameMonth;
            
            if (reportPeriod === 'weekly') {
                // Mock simple weekly check (last 7 days)
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                return d >= oneWeekAgo;
            }

            if (reportPeriod === 'daily') {
                return d.getDate() === now.getDate() && isSameMonth;
            }

            return false;
        });
    }, [invoices, currentMonth, currentYear, reportPeriod]);

    // Metrics
    const revenueEst = filteredInvoices.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const productionTotal = filteredInvoices.reduce((acc, curr) => acc + curr.totalFootage, 0);
    const qcIssues = filteredInvoices.filter(inv => inv.qcStatus === 'FAILED').length;
    
    // Compliance logic
    const complianceRate = filteredInvoices.length > 0 
        ? Math.round((filteredInvoices.filter(i => i.qcStatus === 'PASSED').length / filteredInvoices.length) * 100)
        : 100;

    const dataCompliance = [
        { name: 'Conforme', value: complianceRate, color: '#00cc66' }, 
        { name: 'Divergente', value: 100 - complianceRate, color: '#ff3333' }, 
    ];

    // Chart Data Generation (Group by Crew)
    const dataProduction = useMemo(() => {
        if (filteredInvoices.length === 0) return [];
        
        const crewMap: {[key: string]: number} = {};
        filteredInvoices.forEach(inv => {
            crewMap[inv.crewName] = (crewMap[inv.crewName] || 0) + inv.totalFootage;
        });

        return Object.keys(crewMap).map(crew => ({
            name: crew,
            spans: Math.round(crewMap[crew] / 150), // Approx spans
            footage: crewMap[crew]
        }));
    }, [filteredInvoices]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });

    const getPeriodLabel = () => {
        switch(reportPeriod) {
            case 'daily': return `Hoje, ${now.toLocaleDateString('pt-BR')}`;
            case 'weekly': return 'Últimos 7 dias';
            case 'monthly': return `Mês de ${monthName}`;
        }
    };

    const handleExport = () => {
        alert(`Exportando Relatório ${reportPeriod.toUpperCase()} para Excel...`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-fs-brand/10 text-fs-brand border border-fs-brand/20 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {getPeriodLabel()}
                        </span>
                    </div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Visão Geral</h2>
                    <p className="text-slate-400 text-lg font-medium mt-1">Status operacional da rede em tempo real.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-slate-500" />
                        </div>
                        <select 
                            value={reportPeriod}
                            onChange={(e) => setReportPeriod(e.target.value as any)}
                            className="pl-10 pr-8 py-3 bg-slate-900 text-slate-300 font-bold text-sm rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:border-fs-brand appearance-none cursor-pointer uppercase tracking-wide h-full"
                        >
                            <option value="daily">Relatório Diário</option>
                            <option value="weekly">Relatório Semanal</option>
                            <option value="monthly">Relatório Mensal</option>
                        </select>
                        <ChevronDown className="absolute inset-y-0 right-3 flex items-center h-full w-4 text-slate-500 pointer-events-none" />
                    </div>

                    <button 
                        onClick={handleExport}
                        className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl border border-white/10 transition-colors uppercase tracking-wide flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Exportar
                    </button>
                    <button 
                        onClick={() => onNavigate(ViewState.NEW_PROJECT)}
                        className="px-5 py-3 bg-action-gradient hover:brightness-110 text-white text-sm font-bold rounded-xl shadow-glow transition-all uppercase tracking-wide flex items-center gap-2 group"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        Novo Projeto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Highlight Card for Money - Draws attention */}
                <MetricCard 
                    title={reportPeriod === 'daily' ? "Faturamento (Hoje)" : reportPeriod === 'weekly' ? "Faturamento (Semana)" : "Faturamento (Mês)"}
                    value={formatCurrency(revenueEst)} 
                    subtitle={filteredInvoices.length > 0 ? "Em processamento" : "Sem faturamento no período"} 
                    icon={DollarSign} 
                    trend={filteredInvoices.length > 0 ? "up" : "flat"}
                    highlight={true}
                />
                <MetricCard 
                    title="Metragem Total" 
                    value={productionTotal > 0 ? `${(productionTotal / 1000).toFixed(1)}k ft` : "0 ft"} 
                    subtitle="Construção Linear" 
                    icon={Activity} 
                    trend={productionTotal > 0 ? "up" : "flat"} 
                />
                <MetricCard 
                    title="Conformidade QC" 
                    value={`${complianceRate}%`} 
                    subtitle="Qualidade Média" 
                    icon={CheckCircle} 
                    trend="flat" 
                />
                <MetricCard 
                    title="Divergências" 
                    value={qcIssues} 
                    subtitle={qcIssues > 0 ? "Ação Requerida" : "Nenhum problema detectado"} 
                    icon={AlertTriangle} 
                    trend={qcIssues > 0 ? "down" : "flat"} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Production Chart */}
                <div className="lg:col-span-2 glass-panel p-8 rounded-3xl border border-white/5">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-fs-brand" />
                                Produção por Equipe
                            </h3>
                            <p className="text-sm text-slate-400 font-medium">Performance comparativa ({reportPeriod === 'daily' ? 'Hoje' : reportPeriod === 'weekly' ? 'Esta Semana' : 'Este Mês'})</p>
                        </div>
                    </div>
                    
                    {dataProduction.length > 0 ? (
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dataProduction} barSize={40}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="#64748b" 
                                        tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="#64748b" 
                                        tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                                        axisLine={false}
                                        tickLine={false}
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#1e293b', opacity: 0.4}}
                                        contentStyle={{ 
                                            backgroundColor: '#0f172a', 
                                            border: '1px solid #334155', 
                                            borderRadius: '8px', 
                                            color: '#fff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                        }}
                                    />
                                    <Bar dataKey="footage" name="Metragem (ft)" fill="#ff5500" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-80 w-full flex flex-col items-center justify-center text-slate-500 bg-white/5 rounded-2xl border border-dashed border-slate-700">
                            <Activity className="w-12 h-12 mb-4 opacity-50" />
                            <p className="font-bold">Sem dados de produção neste período.</p>
                            <p className="text-xs">Os gráficos aparecerão assim que os crews enviarem relatórios.</p>
                        </div>
                    )}
                </div>

                {/* Compliance Pie */}
                <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border border-white/5">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                             <CheckCircle className="w-5 h-5 text-fs-success" /> Qualidade
                        </h3>
                        <p className="text-sm text-slate-400 font-medium mb-6">Auditoria Automática IA</p>
                    </div>
                    
                    <div className="h-64 w-full flex flex-col items-center justify-center relative">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataCompliance}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    cornerRadius={4}
                                    stroke="none"
                                >
                                    {dataCompliance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-5xl font-extrabold text-white tracking-tighter">{complianceRate}%</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Precisão</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                        {dataCompliance.map((item) => (
                            <div key={item.name} className="flex justify-between items-center text-sm group p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}`}}></div>
                                    <span className="text-slate-300 font-bold">{item.name}</span>
                                </div>
                                <span className="font-bold text-white font-mono">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;