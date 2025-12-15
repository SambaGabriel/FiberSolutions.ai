
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MapViewer from './components/MapViewer';
import EngineeringHub from './components/EngineeringHub';
import AdminPortal from './components/AdminPortal';
import LinemanPortal from './components/LinemanPortal';
import NewProject from './components/NewProject';
import AIAssistant from './components/AIAssistant';
import AuthPage from './components/AuthPage';
import { ViewState, Notification, NotificationType, Invoice, Transaction, UnitRates, User } from './types';
import { FileText } from 'lucide-react';

// --- INITIAL STATE ZEROED FOR PRODUCTION ---
const INITIAL_INVOICES: Invoice[] = []; 
const INITIAL_TRANSACTIONS: Transaction[] = [];

// Default Payment Rates (Expanded for new contract model)
const INITIAL_RATES: UnitRates = {
    strand: 0.30,
    fiber: 0.30,
    overlash: 0.25,
    anchor: 15.00,
    snowshoe: 10.00,
    composite: 0.50,
    riser: 12.00
};

const ReportsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 animate-in fade-in">
        <FileText className="w-20 h-20 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-white mb-2">Relatórios Financeiros</h3>
        <p className="max-w-md text-center">
            Selecione uma rota auditada para gerar o relatório de billing (BoQ) e exportar para Excel/PDF.
        </p>
    </div>
);

const App: React.FC = () => {
    // AUTH STATE
    const [user, setUser] = useState<User | null>(null);

    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // --- STATE WITH PERSISTENCE (LocalStorage) ---

    // 1. Invoices
    const [invoices, setInvoices] = useState<Invoice[]>(() => {
        const saved = localStorage.getItem('fs_invoices');
        return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    });

    // 2. Transactions
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem('fs_transactions');
        return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    });

    // 3. Rates (Taxas)
    const [rates, setRates] = useState<UnitRates>(() => {
        const saved = localStorage.getItem('fs_rates');
        // Merge with initial in case of new fields added to type
        return saved ? { ...INITIAL_RATES, ...JSON.parse(saved) } : INITIAL_RATES;
    });

    // --- EFFECTS TO SAVE DATA ---
    useEffect(() => {
        localStorage.setItem('fs_invoices', JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        localStorage.setItem('fs_transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('fs_rates', JSON.stringify(rates));
    }, [rates]);


    const addNotification = useCallback((title: string, message: string, type: NotificationType = 'info') => {
        const newNotif: Notification = {
            id: crypto.randomUUID(),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // --- ACTIONS ---

    // Lineman: Submit new work
    const handleSubmitInvoice = (newInvoiceData: Partial<Invoice>) => {
        const newId = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
        
        // Calculate dynamic total based on current rates
        const footageTotal = (newInvoiceData.totalFootage || 0) * rates.fiber; 
        const itemsTotal = 
            ((newInvoiceData.items?.anchors || 0) * rates.anchor) +
            ((newInvoiceData.items?.snowshoes || 0) * rates.snowshoe) +
            ((newInvoiceData.items?.risers || 0) * rates.riser);

        const invoice: Invoice = {
            id: newId,
            crewName: user?.name || 'Crew Alpha', // Use logged user name
            routeId: newInvoiceData.routeId || 'N/A',
            totalFootage: newInvoiceData.totalFootage || 0,
            totalAmount: footageTotal + itemsTotal,
            status: 'PENDING_QC',
            qcStatus: 'NOT_STARTED',
            date: new Date().toISOString(), // Use precise ISO string for better filtering
            items: newInvoiceData.items
        };
        
        setInvoices(prev => [invoice, ...prev]);
        addNotification('Envio Realizado', `Relatório diário ${newId} enviado para supervisão.`, 'success');
    };

    // Admin: Pay Invoice
    const handlePayInvoice = (invoiceId: string, transactionDetails: Transaction) => {
        // 1. Update Invoice Status
        setInvoices(prev => prev.map(inv => 
            inv.id === invoiceId ? { ...inv, status: 'PAID' } : inv
        ));

        // 2. Create Transaction
        setTransactions(prev => [transactionDetails, ...prev]);

        addNotification('Pagamento Confirmado', `Transferência realizada para ${transactionDetails.description}`, 'success');
    };

    const handleUpdateRates = (newRates: UnitRates) => {
        setRates(newRates);
        addNotification('Contrato Atualizado', 'Novas taxas salvas no sistema e sincronizadas com a IA.', 'success');
    };

    const handleCreateProject = (data: any) => {
        // Here we would actually save the project to DB/State
        addNotification('Projeto Criado', `Ordem de Serviço ${data.routeId} iniciada com sucesso. Materiais definidos.`, 'success');
        setCurrentView(ViewState.DASHBOARD);
    };

    const handleLogin = (userData: User) => {
        setUser(userData);
        addNotification("Login Realizado", `Bem-vindo, ${userData.name}. Painel ${userData.role} ativo.`, "success");
    };

    // --- RENDER ---

    if (!user) {
        return <AuthPage onLogin={handleLogin} />;
    }

    const renderContent = () => {
        switch (currentView) {
            case ViewState.DASHBOARD:
                return (
                    <Dashboard 
                        onNavigate={setCurrentView} 
                        invoices={invoices} 
                        transactions={transactions} 
                    />
                );
            case ViewState.ADMIN:
                return (
                    <AdminPortal 
                        invoices={invoices} 
                        onPayInvoice={handlePayInvoice}
                        rates={rates}
                        onUpdateRates={handleUpdateRates}
                    />
                );
            case ViewState.LINEMAN:
                return (
                    <LinemanPortal 
                        transactions={transactions} 
                        onSubmitWork={handleSubmitInvoice}
                        rates={rates}
                    />
                );
            case ViewState.ENGINEERING: // Unified View
                return <EngineeringHub rates={rates} onAnalysisComplete={(result) => {
                    if (result.status === 'CRITICAL') {
                        addNotification("Auditoria: Falha Crítica", `Item crítico detectado na imagem. Score: ${result.complianceScore}`, "critical");
                    } else if (result.status === 'DIVERGENT') {
                        addNotification("Auditoria: Divergência", `Divergências encontradas. Necessário revisão do supervisor.`, "warning");
                    } else {
                        addNotification("Auditoria: Sucesso", "Instalação aprovada com sucesso.", "success");
                    }
                }} />;
            case ViewState.MAPS:
                return <MapViewer />;
            case ViewState.NEW_PROJECT:
                return <NewProject onCancel={() => setCurrentView(ViewState.DASHBOARD)} onSubmit={handleCreateProject} rates={rates} />;
            case ViewState.AI_ASSISTANT:
                return <AIAssistant />;
            default:
                return <Dashboard onNavigate={setCurrentView} invoices={invoices} transactions={transactions} />;
        }
    };

    return (
        <Layout 
            currentView={currentView} 
            onChangeView={setCurrentView}
            notifications={notifications}
            onMarkAllRead={markAllAsRead}
        >
            {renderContent()}
        </Layout>
    );
};

export default App;
