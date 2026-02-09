"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, RefreshCw, Settings,
  UserPlus, Percent, Database, Edit3, Shield, BrainCircuit, Lightbulb
} from 'lucide-react';

// --- CONFIGURAÇÃO E DADOS (SAFRA 2026) ---
const CONFIG = {
  VERSION: "10.0.0 (Safety Audit)",
  LAST_UPDATE: "14/02/2026",
  
  // Tabela Exata do Pool (RN 565)
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

  // VCMH Financeiro (PME II / Empresarial)
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

// --- COMPONENTES VISUAIS DARK ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-[#1e293b] border border-slate-700/50 rounded-xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' | 'purple' | 'orange' | 'lime' }) => {
  const styles = {
    gray: "bg-slate-700 text-slate-300 border-slate-600",
    blue: "bg-blue-900/50 text-blue-200 border-blue-800",
    green: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
    red: "bg-red-900/50 text-red-300 border-red-800",
    purple: "bg-purple-900/50 text-purple-300 border-purple-800",
    orange: "bg-orange-900/50 text-orange-300 border-orange-800",
    lime: "bg-[#a3e635]/20 text-[#a3e635] border-[#a3e635]/50",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[variant]} uppercase tracking-wider`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children, highlight = false }: { label: string, icon: any, children: React.ReactNode, highlight?: boolean }) => (
  <div className="space-y-1.5">
    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${highlight ? 'text-[#a3e635]' : 'text-slate-400'}`}>
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-[#a3e635]' : 'text-slate-500'}`} />
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

  // --- 1. RESET INTELIGENTE & AUTO-DETECT ---
  // Atualiza o índice (VCMH) baseado na seleção e limpa o resultado anterior
  useEffect(() => {
    let indexValue = 15.0;
    
    // Lógica de Detecção de Índice
    if (formData.companySize === 'PME_I') {
        indexValue = formData.operator && CONFIG.POOL_2026[formData.operator] 
            ? CONFIG.POOL_2026[formData.operator] 
            : CONFIG.POOL_2026["Média de Mercado"];
    } else {
        indexValue = formData.operator && CONFIG.VCMH_INDICES[formData.operator] 
            ? CONFIG.VCMH_INDICES[formData.operator] 
            : CONFIG.VCMH_INDICES["Média de Mercado"];
    }

    // Atualiza VCMH apenas (os campos são limpos nos Handlers de Change abaixo)
    setFormData(prev => ({ ...prev, vcmh: indexValue.toFixed(2) }));
    
    // Auto-Set Mix
    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'POOL_100' }));
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'TECH_100' }));
    if (formData.companySize === 'PME_II' && formData.calculationMix === 'POOL_100') {
        setFormData(prev => ({ ...prev, calculationMix: 'MIX_50_50' }));
    }

    // Limpa o resultado da tela se mudar parâmetros chave
    setResult(null); 

  }, [formData.operator, formData.companySize]);


  // --- HANDLERS COM RESET AUTOMÁTICO ---
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData(prev => ({
          ...prev,
          operator: e.target.value,
          // RESET DE SEGURANÇA
          claimsRatio: '',
          currentInvoice: '',
          proposedReadjustment: '',
          manualTechnical: '',
          manualVcmh: '',
          averageAge: ''
      }));
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFormData(prev => ({
          ...prev,
          companySize: e.target.value as CompanySize,
          // RESET DE SEGURANÇA
          claimsRatio: '',
          currentInvoice: '',
          proposedReadjustment: '',
          manualTechnical: '',
          manualVcmh: '',
          averageAge: ''
      }));
  };


  // --- GERADOR DE DEFESA ---
  const generateDefenseText = (
      techRate: number, proposedRate: number, claims: number, 
      target: number, operator: string, isNegative: boolean, 
      isTechnicalHigher: boolean, isManual: boolean,
      usedVcmh: number, isVcmhManual: boolean
  ) => {
    const currentYear = new Date().getFullYear();
    let text = `À\n${operator || 'Operadora'}\nRef: Negociação de Reajuste Cedo Seguros - Safra ${currentYear}\n\n`;
    text += `Prezados,\n\nRecebemos a proposta de reajuste de ${proposedRate.toFixed(2)}%. Como consultoria especializada na gestão de risco deste contrato, apresentamos nossa posição técnica:\n\n`;
    
    if (formData.companySize === 'PME_I') {
        text += `1. ANÁLISE DE POOL (RN 565 ANS)\n`;
        text += `Para contratos PME (até 29 vidas), o índice deve seguir estritamente o agrupamento. O índice apurado para esta carteira na operadora é de ${usedVcmh.toFixed(2)}%. `;
        if (proposedRate > usedVcmh) text += `A proposta apresenta desvio injustificado do índice oficial.\n\n`;
        else text += `Ratificamos o índice de Pool, mas solicitamos flexibilização comercial para retenção do cliente.\n\n`;
    } else {
        text += `1. SINISTRALIDADE VS. EQUILÍBRIO TÉCNICO\n`;
        text += `Apólice com sinistralidade de ${claims.toFixed(2)}% (Meta: ${target}%).\n`;
        
        if (isTechnicalHigher) {
             text += `Nossa auditoria aponta que o reajuste técnico estrito seria de ${techRate.toFixed(2)}%. Reconhecemos que a proposta de ${proposedRate.toFixed(2)}% já contempla um deságio comercial.\n`;
             text += `Contudo, para garantir a renovação e evitar a busca por mercado, solicitamos a manutenção deste patamar ou uma concessão adicional de relacionamento.\n\n`;
        } else {
             text += `O cálculo atuarial demonstra que o reajuste necessário para equilíbrio é de APENAS ${techRate.toFixed(2)}%, inferior aos ${proposedRate.toFixed(2)}% solicitados.\n`;
             text += `Não há justificativa técnica para aplicação de índice superior ao equilíbrio contratual.\n\n`;
        }
        
        text += `2. INDEXADOR (VCMH)\n`;
        if (isVcmhManual) text += `Considerado VCMH negociado de ${usedVcmh.toFixed(2)}%.\n\n`;
        else text += `Aplicado VCMH de referência: ${usedVcmh.toFixed(2)}%.\n\n`;
    }

    text += `PLEITO FINAL:\n`;
    if (isNegative) {
        text += `Solicitamos ISENÇÃO TOTAL (0%) devido à performance positiva do contrato.\n\n`;
    } else if (isTechnicalHigher) {
        text += `Solicitamos a confirmação do índice de ${proposedRate.toFixed(2)}% (ou inferior), formalizando o deságio técnico aplicado.\n\n`;
    } else {
        text += `Solicitamos a retificação da proposta para o teto de ${techRate.toFixed(2)}%.\n\n`;
    }
    
    text += `Atenciosamente,\nCedo Seguros - Gestão de Saúde`;
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

      // --- CÁLCULO TÉCNICO (PRECISION MATH) ---
      const vcmhFactor = 1 + (usedVcmh / 100);
      const currentLossRatio = claims / 100;
      const targetRatio = targetLossRatio / 100;

      let technicalNeedRaw = 0;
      if (formData.companySize === 'PME_I') {
         // CORREÇÃO PME I: O técnico é SEMPRE o índice da tabela (ou manual)
         technicalNeedRaw = usedVcmh;
      } else {
         if (targetRatio > 0) {
            const requiredPremiumRatio = (currentLossRatio * vcmhFactor) / targetRatio;
            technicalNeedRaw = (requiredPremiumRatio - 1) * 100;
         }
      }
      
      let technicalCalculated = 0;
      const poolRef = CONFIG.POOL_2026["Média de Mercado"]; // Apenas para mix, se usado

      switch (formData.calculationMix) {
        // CORREÇÃO: POOL_100 deve usar o technicalNeedRaw (que já contém o valor da operadora)
        // e não a média de mercado genérica.
        case 'POOL_100': technicalCalculated = technicalNeedRaw; break; 
        case 'TECH_100': technicalCalculated = technicalNeedRaw; break;
        case 'MIX_50_50': technicalCalculated = (poolRef * 0.5) + (technicalNeedRaw * 0.5); break;
        case 'MIX_70_30': technicalCalculated = (poolRef * 0.7) + (technicalNeedRaw * 0.3); break;
      }

      const technicalFinal = manualTechInput !== null ? manualTechInput : technicalCalculated;
      const isManualOverride = manualTechInput !== null;

      // Aging & Projeções
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
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-300 pb-20">
      
      {/* HEADER CEDO SEGUROS */}
      <div className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
          <div>
              <div className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-[#a3e635]" fill="currentColor" />
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    CEDO <span className="text-[#a3e635]">SEGUROS</span>
                  </h1>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] mt-1 pl-10">
                NEGOCIAÇÃO ESTRATÉGICA & ATUARIAL
              </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <div className="text-[10px] uppercase text-slate-500 font-bold">Safra 2026</div>
                <div className="text-xs text-[#a3e635] font-mono flex items-center gap-1 justify-end">
                    <Database className="w-3 h-3" /> ONLINE
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA - INPUTS */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-t-4 border-t-[#a3e635] bg-[#1e293b]">
                <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 tracking-wider">
                        <Briefcase className="w-4 h-4 text-[#a3e635]" />
                        Parâmetros
                    </h2>
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-6">
                
                <InputGroup label="Operadora" icon={Building2}>
                  <select 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] outline-none"
                    value={formData.operator}
                    onChange={handleOperatorChange} // USO DO NOVO HANDLER
                  >
                    <option value="">Selecione...</option>
                    {OPERATORS_LIST.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Porte" icon={Users}>
                      <select
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] outline-none"
                        value={formData.companySize}
                        onChange={handleSizeChange} // USO DO NOVO HANDLER
                      >
                         <option value="PME_I">PME I (0-29)</option>
                         <option value="PME_II">PME II (30+)</option>
                         <option value="EMPRESARIAL">Empresarial</option>
                      </select>
                    </InputGroup>

                    {formData.companySize === 'PME_II' && (
                        <InputGroup label="Mix" icon={Scale}>
                            <select
                                className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] outline-none"
                                value={formData.calculationMix}
                                onChange={(e) => setFormData({...formData, calculationMix: e.target.value as CalculationMix})}
                            >
                                <option value="MIX_50_50">Híbrido (50/50)</option>
                                <option value="MIX_70_30">Híbrido (70 Pool/30 Tec)</option>
                                <option value="TECH_100">Técnico Puro</option>
                            </select>
                        </InputGroup>
                    )}
                </div>

                {/* PAINEL TÉCNICO */}
                <div className="p-5 bg-[#0f172a] rounded-lg border border-slate-700/50 space-y-5">
                    <div className="flex justify-between items-end">
                         <div className="w-1/2 pr-2">
                             <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">VCMH Ref.</span>
                             <div className="text-xs text-slate-300 font-mono bg-[#1e293b] py-2 px-3 rounded border border-slate-700">
                                {formData.vcmh}%
                             </div>
                         </div>
                         <div className="w-1/2 pl-2">
                             <InputGroup label="VCMH Manual" icon={Edit3} highlight={!!formData.manualVcmh}>
                                <input 
                                    type="number" 
                                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-[#a3e635] outline-none focus:border-[#a3e635]"
                                    value={formData.manualVcmh}
                                    onChange={(e) => setFormData({...formData, manualVcmh: e.target.value})}
                                    placeholder="%"
                                />
                             </InputGroup>
                         </div>
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Meta (Break-Even)</label>
                        <div className="flex bg-[#1e293b] p-1 rounded border border-slate-700">
                            {['70', '72', '75'].map(bp => (
                                <button
                                    key={bp}
                                    type="button"
                                    onClick={() => setFormData({...formData, breakEvenPoint: bp})}
                                    className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${formData.breakEvenPoint === bp ? 'bg-[#a3e635] text-slate-900' : 'text-slate-400 hover:text-white'}`}
                                >
                                    {bp}%
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Sinistralidade %" icon={ShieldAlert}>
                             <input 
                                type="number" 
                                disabled={formData.companySize === 'PME_I'} 
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-white outline-none focus:border-[#a3e635] disabled:opacity-50"
                                value={formData.claimsRatio}
                                onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                                placeholder={formData.companySize === 'PME_I' ? "-" : "0.00"}
                            />
                        </InputGroup>
                        
                        <InputGroup label="Técnico (Manual)" icon={Edit3} highlight={!!formData.manualTechnical}>
                             <input 
                                type="number" 
                                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-[#a3e635] placeholder-slate-600 outline-none focus:border-[#a3e635]"
                                value={formData.manualTechnical}
                                onChange={(e) => setFormData({...formData, manualTechnical: e.target.value})}
                                placeholder="Auto"
                            />
                        </InputGroup>
                    </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-800">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Fatura Atual" icon={DollarSign}>
                        <input 
                            type="number" 
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-[#a3e635] outline-none"
                            value={formData.currentInvoice}
                            onChange={(e) => setFormData({...formData, currentInvoice: e.target.value})}
                        />
                        </InputGroup>
                        <InputGroup label="Proposta (%)" icon={AlertTriangle}>
                        <input 
                            type="number" 
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 text-sm font-mono font-bold text-red-400 focus:border-red-500 outline-none"
                            value={formData.proposedReadjustment}
                            onChange={(e) => setFormData({...formData, proposedReadjustment: e.target.value})}
                        />
                        </InputGroup>
                    </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#a3e635] hover:bg-[#84cc16] text-slate-900 font-bold text-sm py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3"
                >
                  {loading ? 'Calculando Cedo AI...' : <>CALCULAR CENÁRIO <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </Card>
          </div>

          {/* COLUNA DIREITA - RESULTADOS */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-[#1e293b]/50 border border-dashed border-slate-700 rounded-3xl text-slate-500 p-10 text-center">
                <Activity className="w-16 h-16 text-slate-700 mb-4" />
                <h3 className="text-lg font-bold uppercase tracking-wider text-slate-400">Cedo Seguros Analytics</h3>
                <p className="text-sm mt-2">A melhor defesa para seu plano de saúde.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-700">
                
                {/* 1. CARDS DE DESTAQUE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CARD PROPOSTO */}
                    <Card className="bg-[#1e293b] border-l-4 border-l-red-500">
                        <div className="p-6">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Reajuste Operadora</h3>
                                <Badge variant="red">Proposta</Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white">{result.proposedReadjustment}</span>
                                <span className="text-xl font-bold text-slate-500">%</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                               <p className="text-xs text-slate-400">Nova Fatura: <strong className="text-red-400">{formatCurrency(result.financialImpact.proposedValue)}</strong></p>
                            </div>
                        </div>
                    </Card>

                    {/* CARD JUSTO/NEGOCIADO */}
                    <Card className={`bg-[#1e293b] border-l-4 ${result.isTechnicalHigher ? 'border-l-yellow-500' : 'border-l-[#a3e635]'}`}>
                        <div className="p-6">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${result.isTechnicalHigher ? 'text-yellow-400' : 'text-[#a3e635]'}`}>
                                        {result.isTechnicalHigher ? 'Manutenção (Flexibilizado)' : 'Reajuste Justo'}
                                    </h3>
                                </div>
                                <Badge variant={result.isTechnicalHigher ? 'orange' : 'lime'}>
                                    {result.isTechnicalHigher ? 'Conquista' : 'Cedo IA'}
                                </Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-black ${result.isTechnicalHigher ? 'text-yellow-500' : 'text-[#a3e635]'}`}>
                                    {result.isTechnicalHigher ? result.proposedReadjustment : result.technicalReadjustment}
                                </span>
                                <span className="text-xl font-bold text-slate-500">%</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                {result.isTechnicalHigher ? (
                                    <p className="text-xs font-bold text-yellow-500">
                                        Risco real: {result.technicalReadjustment}%. Você está ganhando da técnica.
                                    </p>
                                ) : (
                                    <p className="text-xs font-bold text-[#a3e635] flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4" /> Economia: {formatCurrency(result.financialImpact.accumulatedSaving)}/ano
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. CARD IA PREDICTIVE 2027 */}
                <Card className="border-t border-indigo-500/50 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <BrainCircuit className="w-24 h-24 text-indigo-400" />
                     </div>
                     <div className="p-6 flex justify-between items-center relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="purple">IA PREDICTIVE 2027</Badge>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Visão de Longo Prazo</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                Projeção de Risco Próxima Safra: <span className="text-indigo-400">{result.nextYearProjection}%</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-md">
                                Baseado no envelhecimento natural da carteira e tendência do VCMH atual. Se nada for feito, este é o cenário provável.
                            </p>
                        </div>
                        <div className="hidden md:block">
                             <TrendingUp className="w-12 h-12 text-indigo-500" />
                        </div>
                     </div>
                </Card>

                {/* 3. CARD DIDÁTICO */}
                <Card className="bg-[#151e32]">
                    <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        <h3 className="text-xs font-bold text-white uppercase">Entenda o Cálculo (Transparência)</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Passo 1: Financeiro</span>
                            <p className="text-sm text-slate-300">
                                Aplicamos a inflação médica (VCMH) de <strong>{result.usedVcmh}%</strong> sobre o custo atual para projetar o preço base do próximo ano.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Passo 2: Técnico</span>
                            <p className="text-sm text-slate-300">
                                Comparamos o uso real ({formData.claimsRatio}%) com a meta ({formData.breakEvenPoint}%). O desvio gera o fator de reequilíbrio.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Passo 3: Decisão</span>
                            <p className="text-sm text-slate-300">
                                A IA pondera os dois fatores. Se o cálculo técnico for menor que a proposta, geramos a defesa para redução.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 4. DEFESA TÉCNICA */}
                <Card className="border-l-4 border-l-blue-600">
                    <div className="px-6 py-4 bg-[#151e32] border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" /> Minuta de Defesa
                        </h3>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.defenseText)}
                            className="text-xs flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded transition-colors"
                        >
                            <Copy className="w-3 h-3" /> Copiar
                        </button>
                    </div>
                    <div className="p-6 bg-[#0f172a]">
                        <pre className="whitespace-pre-wrap font-serif text-sm text-slate-300 leading-relaxed">
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