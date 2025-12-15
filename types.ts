
export enum AuditStatus {
    PENDING = 'PENDING',
    COMPLIANT = 'COMPLIANT',
    DIVERGENT = 'DIVERGENT',
    CRITICAL = 'CRITICAL'
}

export interface User {
    email: string;
    role: 'OWNER' | 'SUPERVISOR' | 'LINEMAN';
    name: string;
}

export interface AuditResult {
    id: string;
    timestamp: string;
    imageUrl?: string;
    status: AuditStatus;
    complianceScore: number;
    detectedItems: string[];
    issues: string[];
    location?: {
        lat: number;
        lng: number;
    };
    aiSummary: string;
}

export interface MapAnalysisResult {
    totalCableLength: number; // em pés
    cableType: string; // ex: 48ct, 96ct
    spanCount: number;
    equipmentCounts: { name: string; quantity: number }[];
    financials: {
        estimatedLaborCost: number;
        estimatedMaterialCost: number;
        potentialSavings: number; // Diferença encontrada
    };
    // Lista de materiais para Warehouse (Pick List)
    materialList: { item: string; quantity: number; unit: string }[]; 
    detectedAnomalies: string[]; 
    spliceRecommendation?: {
        location: string; 
        reason: string; 
        action: string; 
    };
}

export interface UnitRates {
    strand: number;    // Preço por pé
    fiber: number;     // Preço por pé
    overlash: number;  // Preço por pé
    anchor: number;    // Preço por unidade
    snowshoe: number;  // Preço por unidade
    composite: number; // Preço por unidade (novo)
    riser: number;     // Preço por unidade
}

export interface Invoice {
    id: string;
    crewName: string;
    routeId: string;
    totalFootage: number;
    totalAmount: number;
    status: 'DRAFT' | 'PENDING_QC' | 'APPROVED' | 'PAID';
    qcStatus: 'NOT_STARTED' | 'PASSED' | 'FAILED';
    date: string;
    items?: {
        snowshoes: number;
        anchors: number;
        coils: number;
        risers: number;
    };
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    fee: number;
    netAmount: number;
    status: 'PROCESSING' | 'COMPLETED';
    type: 'PAYOUT';
    description: string;
}

export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    ENGINEERING = 'ENGINEERING', // Unificada (Fotos + Mapas)
    ADMIN = 'ADMIN',             // Portal do Dono
    LINEMAN = 'LINEMAN',         // Portal do Técnico
    MAPS = 'MAPS',
    NEW_PROJECT = 'NEW_PROJECT',
    AI_ASSISTANT = 'AI_ASSISTANT' // New: Chatbot, Search, Maps, Thinking
}

export type NotificationType = 'info' | 'success' | 'warning' | 'critical';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
}
