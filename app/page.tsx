"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, RefreshCw, Settings,
  UserPlus, Percent, Database, Edit3, Shield, Zap, Thermometer, BarChart3, Clock, Brain, Microscope, BookOpen, Lightbulb, Layers
} from 'lucide-react';

// --- CONFIGURAÇÃO E DADOS (SAFRA 2026 - AUDITADO) ---
const CONFIG = {
  VERSION: "14.1.0 (Didactic AI Final)",
  LAST_UPDATE: "16/02/2026",
  
  POOL_2026: {
    "Ameplan": 13.50, "Amil": 15.98, "Ana Costa": 15.13, "Assim Saúde": 15.59,
    "Blue Med": 19.38, "Bradesco Saúde": 15.11, "Care Plus": 18.81,
    "NotreDame Intermédica": 15.21, "Golden Cross": 18.81, "Interclínicas": 9.33,
    "Hapvida": 15.20, "New Leader": 19.99, "Omint": 13.32, "Plamed": 6.76,
    "Porto Seguro": 15.87, "Samel": 15.26, "Sami": 15.37, "São Cristóvão": 6.91,
    "São Miguel": 6.75, "Seguros Unimed": 11.92, "Soban": 15.21, "SulAmérica": 15.23,
    "Unimed (Nacional)": 19.50, "Unimed Campinas": 12.50, "Unimed Guarulhos": 13.50,
    "Unimed Jundiaí": 15.58, "Unimed Ferj": 15.58, "Unimed Santos": 12.67,
    "Unimed São José dos Campos": 15.12, "Vera Cruz": 12.40, "Trasmontano": 9.33,
    "Alice": 12.50, "Média de Mercado": 14.50
  } as Record<string, number>,

  VCMH_INDICES: {
    "Bradesco Saúde": 16.5, "SulAmérica": 15.8, "Amil": 14.2,
    "NotreDame Intermédica": 13.8, "Porto Seguro": 14.9, "Seguros Unimed": 14.0,
    "Omint": 17.1, "Unimed (Nacional)": 13.5, "Golden Cross": 16.0,
    "Média de Mercado": 15.0
  } as Record<string, number>
};

const OPERATORS_LIST = [
  ...Object.keys(CONFIG.POOL_2026).filter(k => k !== "Média de Mercado").sort(),
  "Outra"
];

// --- TIPAGEM ---
type CompanySize = 'PME_I' | 'PME_II' | 'EMPRESARIAL';
type CalculationMix = 'POOL_100' | 'MIX_50_50' | 'MIX_70_30' | 'TECH_100';
type NegotiationStatus = 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  calculationMix: CalculationMix;
  breakEvenPoint: string;
  averageAge: string;
  claimsRatio: string;
  vcmh: string; 
  manualVcmh: string; 
  currentInvoice: string;
  proposedReadjustment: string;
  manualTechnical: string; 
}

interface AnalysisResult {
  technicalReadjustment: number;
  proposedReadjustment: number;
  savingPotential: number;
  isNegative: boolean;
  isTechnicalHigher: boolean;
  isManualOverride: boolean;
  isVcmhManual: boolean;
  usedVcmh: number;
  agingFactor: number;
  nextYearProjection: number;
  negotiationStatus: NegotiationStatus;
  financialImpact: {
    current: number;
    proposedValue: number;
    fairValue: number;
    accumulatedSaving: number;
    projections: { m12: number; m24: number; m36: number; }
  };
  defenseText: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- DESIGN SYSTEM ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#0f172a] border border-slate-800/60 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-xl ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'neon' }) => {
  const styles = {
    gray: "bg-slate-800 text-slate-400 border-slate-700",
    blue: "bg-blue-950/40 text-blue-400 border-blue-800/50",
    green: "bg-emerald-950/40 text-emerald-400 border-emerald-800/50",
    red: "bg-red-950/40 text-red-400 border-red-800/50",
    purple: "bg-purple-950/40 text-purple-400 border-purple-800/50",
    orange: "bg-orange-950/40 text-orange-400 border-orange-800/50",
    neon: "bg-[#a3e635]/10 text-[#a3e635] border-[#a3e635]/30 shadow-[0_0_10px_rgba(163,230,53,0.1)]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${styles[variant]} uppercase tracking-wider flex items-center gap-1`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children, highlight = false }: { label: string, icon: any, children: React.ReactNode, highlight?: boolean }) => (
  <div className="space-y-2 group">
    <label className={`text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 transition-colors duration-300 ${highlight ? 'text-[#a3e635]' : 'text-slate-500 group-hover:text-slate-300'}`}>
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-[#a3e635]' : 'text-slate-600 group-hover:text-slate-400'}`} />
      {label}
    </label>
    <div className="relative">
      {children}
    </div>
  </div>
);

// --- APP ---

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    anniversaryMonth: new Date().toLocaleString('pt-BR', { month: 'long' }),
    operator: '',
    companySize: 'PME_II',
    calculationMix: 'MIX_50_50',
    breakEvenPoint: '75',
    averageAge: '',
    claimsRatio: '',
    vcmh: '15.00',
    manualVcmh: '',
    currentInvoice: '',
    proposedReadjustment: '',
    manualTechnical: '' 
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // --- INTELLIGENT RESET ---
  useEffect(() => {
    let indexValue = 15.0;
    
    if (formData.companySize === 'EMPRESARIAL') {
        indexValue = 0; 
    } else if (formData.companySize === 'PME_I') {
        indexValue = formData.operator && CONFIG.POOL_2026[formData.operator] 
            ? CONFIG.POOL_2026[formData.operator] 
            : CONFIG.POOL_2026["Média de Mercado"];
    } else {
        indexValue = formData.operator && CONFIG.VCMH_INDICES[formData.operator] 
            ? CONFIG.VCMH_INDICES[formData.operator] 
            : CONFIG.VCMH_INDICES["Média de Mercado"];
    }

    setFormData(prev => ({
        ...prev,
        vcmh: indexValue === 0 ? '' : indexValue.toFixed(2), 
        claimsRatio: '',
        currentInvoice: '',
        proposedReadjustment: '',
        manualTechnical: '',
        manualVcmh: '',
        averageAge: ''
    }));

    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'POOL_100' }));
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'TECH_100' }));
    if (formData.companySize === 'PME_II' && formData.calculationMix === 'POOL_100') {
        setFormData(prev => ({ ...prev, calculationMix: 'MIX_50_50' }));
    }

    setResult(null);
  }, [formData.operator, formData.companySize, formData.calculationMix]);


  // --- GERADOR DE DEFESA ---
  const generateDefenseText = (
      techRate: number, proposedRate: number, claims: number, 
      target: number, operator: string, isNegative: boolean, 
      isTechnicalHigher: boolean, isManual: boolean,
      usedVcmh: number, isVcmhManual: boolean
  ) => {
    const currentYear = new Date().getFullYear();
    let text = `À\n${operator || 'Operadora'}\nRef: Gestão Estratégica Cedo Seguros - Safra ${currentYear}\n\n`;
    text += `Prezados,\n\nAnalisamos a proposta de reajuste de ${proposedRate.toFixed(2)}%. Como consultoria especializada na gestão de risco deste contrato, apresentamos nossa posição técnica:\n\n`;
    
    if (formData.companySize === 'PME_I') {
        text += `1. REGRA DE POOL (RN 565 ANS)\n`;
        text += `O contrato enquadra-se no agrupamento PME (até 29 vidas). O índice oficial apurado para esta carteira é de ${usedVcmh.toFixed(2)}% (Tabela Safra 2026). `;
        
        if (proposedRate > usedVcmh + 0.01) { 
             text += `A proposta de ${proposedRate.toFixed(2)}% diverge do índice oficial do Pool, devendo ser retificada imediatamente.\n\n`;
        } else {
             text += `Embora o índice siga a tabela, solicitamos a flexibilização comercial para manutenção do cliente.\n\n`;
        }
    } else {
        text += `1. PERFORMANCE & EQUILÍBRIO TÉCNICO\n`;
        text += `Apólice com sinistralidade acumulada de ${claims.toFixed(2)}% (Break-even: ${target}%).\n`;
        
        if (isTechnicalHigher) {
             text += `Nossa auditoria aponta que a necessidade técnica estrita seria de ${techRate.toFixed(2)}%. Reconhecemos o deságio comercial aplicado na proposta (${proposedRate.toFixed(2)}%).\n`;
             text += `Contudo, visando a sustentabilidade financeira da empresa cliente, solicitamos a manutenção deste patamar ou concessão adicional de relacionamento.\n\n`;
        } else {
             text += `O cálculo atuarial demonstra que o reajuste necessário para equilíbrio é de APENAS ${techRate.toFixed(2)}%, consideravelmente inferior aos ${proposedRate.toFixed(2)}% solicitados.\n`;
             text += `Não há fundamentação técnica para a aplicação de índice superior ao equilíbrio contratual.\n\n`;
        }
        
        text += `2. COMPONENTE FINANCEIRO (VCMH)\n`;
        if (isVcmhManual) text += `Considerado índice negociado de ${usedVcmh.toFixed(2)}%.\n\n`;
        else if (formData.companySize === 'EMPRESARIAL') text += `Considerado VCMH zero/negociado no cálculo técnico.\n\n`;
        else text += `Aplicado VCMH de referência: ${usedVcmh.toFixed(2)}%.\n\n`;
    }

    text += `PLEITO FINAL:\n`;
    if (isNegative) {
        text += `Solicitamos ISENÇÃO TOTAL (0%) devido à excelente performance do contrato.\n\n`;
    } else if (isTechnicalHigher) {
        text += `Solicitamos a confirmação do índice de ${proposedRate.toFixed(2)}% (ou inferior), formalizando a negociação.\n\n`;
    } else {
        text += `Solicitamos a retificação da proposta para o teto de ${techRate.toFixed(2)}%.\n\n`;
    }
    
    text += `Atenciosamente,\nCedo Seguros - Inteligência Atuarial`;
    return text;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const claims = parseFloat(formData.claimsRatio) || 0;
      const dbVcmh = parseFloat(formData.vcmh) || 0;
      const manualVcmhVal = parseFloat(formData.manualVcmh);
      const invoice = parseFloat(formData.currentInvoice) || 0;
      const proposed = parseFloat(formData.proposedReadjustment) || 0;
      const targetLossRatio = parseFloat(formData.breakEvenPoint) || 75;
      const avgAge = parseFloat(formData.averageAge) || 0;
      const manualTechInput = formData.manualTechnical ? parseFloat(formData.manualTechnical) : null;

      const usedVcmh = !isNaN(manualVcmhVal) ? manualVcmhVal : dbVcmh;
      const isVcmhManual = !isNaN(manualVcmhVal);

      const vcmhFactor = 1 + (usedVcmh / 100);
      const currentLossRatio = claims / 100;
      const targetRatio = targetLossRatio / 100;

      let technicalNeedRaw = 0;
      if (formData.companySize === 'PME_I') {
         technicalNeedRaw = usedVcmh;
      } else {
         if (targetRatio > 0) {
            const requiredPremiumRatio = (currentLossRatio * vcmhFactor) / targetRatio;
            technicalNeedRaw = (requiredPremiumRatio - 1) * 100;
         }
      }
      
      let technicalCalculated = 0;
      const poolRef = CONFIG.POOL_2026["Média de Mercado"];

      switch (formData.calculationMix) {
        case 'POOL_100': technicalCalculated = technicalNeedRaw; break;
        case 'TECH_100': technicalCalculated = technicalNeedRaw; break;
        case 'MIX_50_50': technicalCalculated = (poolRef * 0.5) + (technicalNeedRaw * 0.5); break;
        case 'MIX_70_30': technicalCalculated = (poolRef * 0.7) + (technicalNeedRaw * 0.3); break;
      }

      const technicalFinal = manualTechInput !== null ? manualTechInput : technicalCalculated;
      const isManualOverride = manualTechInput !== null;

      let status: NegotiationStatus = 'MEDIUM';
      const diff = proposed - technicalFinal;
      if (technicalFinal < 0) status = 'EASY'; 
      else if (diff > 5) status = 'HARD';
      else if (diff > 10) status = 'CRITICAL';
      else status = 'MEDIUM';

      let agingRiskLoad = 0.02;
      if (avgAge > 59) agingRiskLoad = 0.06;
      else if (avgAge > 49) agingRiskLoad = 0.04;
      else if (avgAge < 30) agingRiskLoad = 0.01;
      
      const nextYearProjection = (Math.max(technicalFinal, 0) * 0.5) + usedVcmh + (agingRiskLoad * 100);
      const trendFactor = (1 + (usedVcmh / 100) + agingRiskLoad);
      const valProposed = invoice * (1 + (proposed / 100));
      const fairRateDisplay = (technicalFinal > proposed && proposed > 0) ? proposed : technicalFinal;
      const valFair = invoice * (1 + (fairRateDisplay / 100));
      
      const isNegative = technicalFinal <= 0;
      const isTechnicalHigher = technicalFinal > proposed;
      
      const defense = generateDefenseText(
          technicalFinal, proposed, claims, targetLossRatio, 
          formData.operator, isNegative, isTechnicalHigher, isManualOverride,
          usedVcmh, isVcmhManual
      );

      setResult({
        technicalReadjustment: parseFloat(technicalFinal.toFixed(2)),
        proposedReadjustment: proposed,
        savingPotential: parseFloat((proposed - fairRateDisplay).toFixed(2)),
        isNegative,
        isTechnicalHigher,
        isManualOverride,
        isVcmhManual,
        usedVcmh,
        agingFactor: agingRiskLoad * 100,
        nextYearProjection: parseFloat(nextYearProjection.toFixed(2)),
        negotiationStatus: status,
        financialImpact: {
            current: invoice,
            proposedValue: valProposed,
            fairValue: valFair,
            accumulatedSaving: (valProposed - valFair) * 12,
            projections: { 
                m12: valFair, 
                m24: valFair * trendFactor, 
                m36: valFair * trendFactor * trendFactor 
            }
        },
        defenseText: defense
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-300 pb-20 selection:bg-[#a3e635] selection:text-slate-900">
      
      {/* HEADER */}
      <div className="bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div>
              <div className="flex items-center gap-3">
                  <div className="bg-[#a3e635] p-1.5 rounded-lg shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                    <Shield className="w-6 h-6 text-[#020617]" strokeWidth={3} />
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tighter">
                    CEDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a3e635] to-emerald-400">SEGUROS</span>
                  </h1>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] mt-1 pl-12 uppercase">
                Intelligence System v14.1
              </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Base de Dados</div>
                <div className="text-xs text-[#a3e635] font-mono flex items-center gap-1 justify-end animate-pulse">
                    <Database className="w-3 h-3" /> POOL 2026 LIVE
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA - INPUTS */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-t-4 border-t-[#a3e635]">
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 tracking-wider">
                        <Briefcase className="w-4 h-4 text-[#a3e635]" />
                        Parâmetros da Apólice
                    </h2>
                    <Settings className="w-4 h-4 text-slate-600" />
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-6">
                
                <InputGroup label="Operadora" icon={Building2}>
                  <select 
                    className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] focus:border-[#a3e635] outline-none transition-all hover:border-slate-600"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Selecione a Operadora...</option>
                    {OPERATORS_LIST.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Porte" icon={Users}>
                      <select
                        className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] focus:border-[#a3e635] outline-none transition-all hover:border-slate-600"
                        value={formData.companySize}
                        onChange={(e) => setFormData({...formData, companySize: e.target.value as CompanySize})}
                      >
                         <option value="PME_I">PME I (Pool)</option>
                         <option value="PME_II">PME II</option>
                         <option value="EMPRESARIAL">Empresarial</option>
                      </select>
                    </InputGroup>

                    {formData.companySize === 'PME_II' && (
                        <InputGroup label="Metodologia" icon={Scale}>
                            <select
                                className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] focus:border-[#a3e635] outline-none transition-all hover:border-slate-600"
                                value={formData.calculationMix}
                                onChange={(e) => setFormData({...formData, calculationMix: e.target.value as CalculationMix})}
                            >
                                <option value="MIX_50_50">Mix 50/50</option>
                                <option value="MIX_70_30">Mix 70/30</option>
                                <option value="TECH_100">Técnico Puro</option>
                            </select>
                        </InputGroup>
                    )}
                </div>

                <div className="p-5 bg-[#0b1120] rounded-xl border border-slate-800 space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#a3e635] to-emerald-600"></div>
                    
                    <div className="flex justify-between items-end">
                         <div className="w-1/2 pr-2">
                             <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">VCMH Ref.</span>
                             <div className={`text-xs font-mono py-2 px-3 rounded border flex items-center gap-2 ${formData.vcmh ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-900/50 border-slate-800 text-slate-600'}`}>
                                {formData.vcmh ? `${formData.vcmh}%` : 'N/A'}
                             </div>
                         </div>
                         <div className="w-1/2 pl-2">
                             <InputGroup label="VCMH Manual" icon={Edit3} highlight={!!formData.manualVcmh}>
                                <input 
                                    type="number" 
                                    className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-[#a3e635] outline-none focus:border-[#a3e635]"
                                    value={formData.manualVcmh}
                                    onChange={(e) => setFormData({...formData, manualVcmh: e.target.value})}
                                    placeholder={formData.companySize === 'EMPRESARIAL' ? "Obrigatório" : "Opcional"}
                                />
                             </InputGroup>
                         </div>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-wider">Break-Even Point (Meta)</label>
                        <div className="flex bg-[#020617] p-1 rounded-lg border border-slate-800">
                            {['70', '72', '75'].map(bp => (
                                <button
                                    key={bp}
                                    type="button"
                                    onClick={() => setFormData({...formData, breakEvenPoint: bp})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${formData.breakEvenPoint === bp ? 'bg-[#a3e635] text-slate-900 shadow-lg shadow-[#a3e635]/20' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {bp}%
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Sinistro %" icon={ShieldAlert}>
                             <input 
                                type="number" 
                                disabled={formData.companySize === 'PME_I'} 
                                className="w-full bg-[#020617] border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-white outline-none focus:border-[#a3e635] disabled:opacity-30 disabled:cursor-not-allowed"
                                value={formData.claimsRatio}
                                onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                                placeholder={formData.companySize === 'PME_I' ? "Pool Fix" : "0.00"}
                            />
                        </InputGroup>
                        
                        <InputGroup label="Técnico (Manual)" icon={Edit3} highlight={!!formData.manualTechnical}>
                             <input 
                                type="number" 
                                className="w-full bg-[#020617] border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-[#a3e635] placeholder-slate-700 outline-none focus:border-[#a3e635]"
                                value={formData.manualTechnical}
                                onChange={(e) => setFormData({...formData, manualTechnical: e.target.value})}
                                placeholder="Auto"
                            />
                        </InputGroup>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Fatura Atual" icon={DollarSign}>
                        <input 
                            type="number" 
                            className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-[#a3e635] outline-none"
                            value={formData.currentInvoice}
                            onChange={(e) => setFormData({...formData, currentInvoice: e.target.value})}
                        />
                        </InputGroup>
                        <InputGroup label="Proposta (%)" icon={AlertTriangle}>
                        <input 
                            type="number" 
                            className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-rose-400 focus:border-rose-500 outline-none"
                            value={formData.proposedReadjustment}
                            onChange={(e) => setFormData({...formData, proposedReadjustment: e.target.value})}
                        />
                        </InputGroup>
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#a3e635] to-emerald-500 hover:from-[#84cc16] hover:to-emerald-600 text-slate-900 font-bold text-sm py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                      {loading ? 'Processando IA...' : <>CALCULAR CENÁRIO <Zap className="w-4 h-4 fill-slate-900" /></>}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </form>
            </Card>
          </div>

          {/* COLUNA DIREITA - RESULTADOS */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-[#0f172a]/50 border border-dashed border-slate-800 rounded-3xl text-slate-600 p-10 text-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-800">
                    <Activity className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-slate-500">Cedo Analytics</h3>
                <p className="text-sm mt-2 max-w-sm">Insira os dados da apólice para ativar o motor de inteligência artificial.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-700">
                
                {/* 1. CARDS DE DESTAQUE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-[#0f172a] to-rose-950/20">
                        <div className="p-6">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Cenário Operadora</h3>
                                <Badge variant="red">Proposta</Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{result.proposedReadjustment}</span>
                                <span className="text-xl font-bold text-slate-600">%</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800">
                               <p className="text-xs text-slate-400">Impacto: <strong className="text-rose-400">{formatCurrency(result.financialImpact.proposedValue)}</strong></p>
                            </div>
                        </div>
                    </Card>

                    <Card className={`border-l-4 ${result.isTechnicalHigher ? 'border-l-amber-500' : 'border-l-[#a3e635]'} bg-gradient-to-br from-[#0f172a] to-emerald-950/20`}>
                        <div className="p-6">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${result.isTechnicalHigher ? 'text-amber-400' : 'text-[#a3e635]'}`}>
                                        {result.isTechnicalHigher ? 'Manutenção (Estratégia)' : 'Técnico Justo'}
                                    </h3>
                                </div>
                                <Badge variant={result.isTechnicalHigher ? 'orange' : 'neon'}>
                                    CEDO IA
                                </Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-black ${result.isTechnicalHigher ? 'text-amber-400' : 'text-[#a3e635]'}`}>
                                    {result.isTechnicalHigher ? result.proposedReadjustment : result.technicalReadjustment}
                                </span>
                                <span className="text-xl font-bold text-slate-600">%</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                {result.isTechnicalHigher ? (
                                    <p className="text-xs font-bold text-amber-500 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> Blindar Conquista (Técnico: {result.technicalReadjustment}%)
                                    </p>
                                ) : (
                                    <p className="text-xs font-bold text-[#a3e635] flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4" /> Economia: {formatCurrency(result.financialImpact.accumulatedSaving)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. TERMÔMETRO DE NEGOCIAÇÃO */}
                <Card className="p-4 flex items-center gap-4 bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className={`p-3 rounded-full ${result.negotiationStatus === 'EASY' ? 'bg-emerald-500/20 text-emerald-400' : result.negotiationStatus === 'HARD' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        <Thermometer className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">Dificuldade da Negociação</span>
                            <span className={`text-xs font-bold uppercase ${result.negotiationStatus === 'EASY' ? 'text-emerald-400' : result.negotiationStatus === 'HARD' ? 'text-rose-400' : 'text-blue-400'}`}>
                                {result.negotiationStatus === 'EASY' ? 'Favorável' : result.negotiationStatus === 'HARD' ? 'Desafiadora' : 'Moderada'}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ${result.negotiationStatus === 'EASY' ? 'w-1/3 bg-emerald-500' : result.negotiationStatus === 'HARD' ? 'w-full bg-rose-500' : 'w-2/3 bg-blue-500'}`}
                            ></div>
                        </div>
                    </div>
                </Card>

                {/* 3. STORYTELLING FINANCEIRO */}
                <Card className="border border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0b1120]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                             <Clock className="w-4 h-4 text-indigo-400" /> Jornada Financeira (3 Anos)
                        </h3>
                        <Badge variant="blue">Visão de Longo Prazo</Badge>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ANO 1 */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-emerald-500/30 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 block">Ciclo Atual (Ano 1)</span>
                            <div className="space-y-1">
                                <div className="text-lg font-mono text-white font-bold">{formatCurrency(result.financialImpact.projections.m12)} <span className="text-[10px] text-slate-500 font-sans font-normal">/mês</span></div>
                                <div className="text-xs text-slate-500">Anual: {formatCurrency(result.financialImpact.projections.m12 * 12)}</div>
                            </div>
                        </div>
                        {/* ANO 2 */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-yellow-500/30 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider mb-2 block">Próxima Renovação (Ano 2)</span>
                            <div className="space-y-1">
                                <div className="text-lg font-mono text-white font-bold">{formatCurrency(result.financialImpact.projections.m24)} <span className="text-[10px] text-slate-500 font-sans font-normal">/mês</span></div>
                                <div className="text-xs text-slate-500">Anual: {formatCurrency(result.financialImpact.projections.m24 * 12)}</div>
                            </div>
                        </div>
                        {/* ANO 3 */}
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-rose-500/30 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2 block">Futuro Projetado (Ano 3)</span>
                            <div className="space-y-1">
                                <div className="text-lg font-mono text-white font-bold">{formatCurrency(result.financialImpact.projections.m36)} <span className="text-[10px] text-slate-500 font-sans font-normal">/mês</span></div>
                                <div className="text-xs text-slate-500">Anual: {formatCurrency(result.financialImpact.projections.m36 * 12)}</div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 4. BLOCO INTELIGÊNCIA ARTIFICIAL & FUTURO (NOVO e EVIDENTE) */}
                <Card className="border border-indigo-500/30 overflow-hidden relative">
                     <div className="absolute inset-0 bg-indigo-950/20 backdrop-blur-sm z-0"></div>
                     <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-0">
                         {/* Esquerda: O Número */}
                         <div className="md:col-span-5 bg-gradient-to-br from-indigo-900/40 to-slate-900 p-6 flex flex-col justify-center border-r border-indigo-500/20">
                             <div className="flex items-center gap-2 mb-4">
                                 <Brain className="w-5 h-5 text-indigo-400" />
                                 <h3 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Cedo AI: Future Vision 2027</h3>
                             </div>
                             <div className="text-5xl font-black text-white tracking-tighter mb-2">
                                 {result.nextYearProjection}%
                             </div>
                             <p className="text-xs text-indigo-300/80 leading-relaxed">
                                 Projeção estimada de reajuste para o próximo ciclo se a gestão de risco não for iniciada imediatamente.
                             </p>
                         </div>
                         {/* Direita: A Explicação Didática */}
                         <div className="md:col-span-7 p-6 bg-[#0f172a]/80">
                             <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                                 <Microscope className="w-3 h-3" /> Decomposição do Fator de Risco
                             </h4>
                             <div className="space-y-3">
                                 <div className="flex justify-between items-center text-xs">
                                     <span className="text-slate-400">Inflação Médica (VCMH)</span>
                                     <span className="font-mono text-white font-bold">{result.usedVcmh}%</span>
                                 </div>
                                 <div className="w-full h-1 bg-slate-800 rounded-full"><div style={{width: `${Math.min(result.usedVcmh * 3, 100)}%`}} className="h-full bg-slate-500 rounded-full"></div></div>
                                 
                                 <div className="flex justify-between items-center text-xs">
                                     <span className="text-slate-400">Aging Factor (Envelhecimento)</span>
                                     <span className="font-mono text-indigo-400 font-bold">+{result.agingFactor.toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full h-1 bg-slate-800 rounded-full"><div style={{width: `${result.agingFactor * 10}%`}} className="h-full bg-indigo-500 rounded-full"></div></div>

                                 <div className="flex justify-between items-center text-xs">
                                     <span className="text-slate-400">Tendência de Sinistralidade</span>
                                     <span className="font-mono text-rose-400 font-bold">+{Math.max(0, (result.nextYearProjection - result.usedVcmh - result.agingFactor)).toFixed(1)}%</span>
                                 </div>
                                 <div className="w-full h-1 bg-slate-800 rounded-full"><div style={{width: '40%'}} className="h-full bg-rose-500 rounded-full"></div></div>
                             </div>
                         </div>
                     </div>
                </Card>

                {/* 5. METODOLOGIA DIDÁTICA (NOVO e EVIDENTE) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-5 border-t-2 border-t-slate-600 bg-[#0f172a]">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                            <Calculator className="w-4 h-4 text-slate-300" />
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase mb-2">1. A Matemática</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Utilizamos o modelo multiplicativo atuarial: <code>((Sinistro * VCMH) / Meta) - 1</code>. Isso corrige o erro de arrasto que planilhas comuns ignoram.
                        </p>
                    </Card>
                    <Card className="p-5 border-t-2 border-t-slate-600 bg-[#0f172a]">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                            <BookOpen className="w-4 h-4 text-slate-300" />
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase mb-2">2. O Compliance</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Se for PME I, travamos na RN 565. Se for Empresarial, zeramos o VCMH para forçar a negociação real. Respeitamos a regra do jogo.
                        </p>
                    </Card>
                    <Card className="p-5 border-t-2 border-t-slate-600 bg-[#0f172a]">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                            <Lightbulb className="w-4 h-4 text-slate-300" />
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase mb-2">3. A Estratégia</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Comparamos o Técnico vs. Proposto. Se a operadora errou para baixo, defendemos a manutenção. Se errou para cima, atacamos com dados.
                        </p>
                    </Card>
                </div>

                {/* 6. DEFESA TÉCNICA */}
                <Card className="border-l-4 border-l-blue-600">
                    <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" /> Carta de Defesa
                        </h3>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.defenseText)}
                            className="text-xs flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                        >
                            <Copy className="w-3 h-3" /> COPIAR TEXTO
                        </button>
                    </div>
                    <div className="p-6 bg-[#0f172a]">
                        <pre className="whitespace-pre-wrap font-serif text-sm text-slate-300 leading-relaxed pl-2 border-l-2 border-slate-700">
                            {result.defenseText}
                        </pre>
                    </div>
                </Card>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}