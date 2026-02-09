"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, RefreshCw, Settings,
  UserPlus, Percent, Database, Edit3, Shield
} from 'lucide-react';

// --- CONFIGURAÇÃO E DADOS (SAFRA 2026) ---
const CONFIG = {
  VERSION: "8.0.0 (Cedo Enterprise)",
  LAST_UPDATE: "12/02/2026",
  
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

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  calculationMix: CalculationMix;
  breakEvenPoint: string;
  averageAge: string;
  claimsRatio: string;
  vcmh: string; // Automático
  manualVcmh: string; // Novo: Manual
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
  isVcmhManual: boolean; // Flag para VCMH manual
  usedVcmh: number; // Valor final usado no cálculo
  agingFactor: number;
  projectedClaimsRatio: number;
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

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' | 'purple' | 'orange' }) => {
  const styles = {
    gray: "bg-slate-700 text-slate-300 border-slate-600",
    blue: "bg-blue-900/50 text-blue-200 border-blue-800",
    green: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
    red: "bg-red-900/50 text-red-300 border-red-800",
    purple: "bg-purple-900/50 text-purple-300 border-purple-800",
    orange: "bg-orange-900/50 text-orange-300 border-orange-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[variant]} uppercase tracking-wider`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children, highlight = false }: { label: string, icon: any, children: React.ReactNode, highlight?: boolean }) => (
  <div className="space-y-1.5">
    <label className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${highlight ? 'text-lime-400' : 'text-slate-400'}`}>
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-lime-400' : 'text-slate-500'}`} />
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
    manualVcmh: '', // Novo
    currentInvoice: '',
    proposedReadjustment: '',
    manualTechnical: '' 
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Auto-detectar índices (Database)
  useEffect(() => {
    let indexValue = 15.0;
    if (formData.companySize === 'PME_I') {
        indexValue = formData.operator && CONFIG.POOL_2026[formData.operator] 
            ? CONFIG.POOL_2026[formData.operator] 
            : CONFIG.POOL_2026["Média de Mercado"];
    } else {
        indexValue = formData.operator && CONFIG.VCMH_INDICES[formData.operator] 
            ? CONFIG.VCMH_INDICES[formData.operator] 
            : CONFIG.VCMH_INDICES["Média de Mercado"];
    }
    setFormData(prev => ({ ...prev, vcmh: indexValue.toFixed(2) }));
    
    // Auto-ajuste de Mix Padrão
    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'POOL_100' }));
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'TECH_100' }));
    // Se mudar para PME II e estiver travado, libera o mix padrão
    if (formData.companySize === 'PME_II' && formData.calculationMix === 'POOL_100') {
        setFormData(prev => ({ ...prev, calculationMix: 'MIX_50_50' }));
    }
  }, [formData.operator, formData.companySize]);

  // --- GERADOR DE DEFESA ---
  const generateDefenseText = (
      techRate: number, proposedRate: number, claims: number, 
      target: number, operator: string, isNegative: boolean, 
      isTechnicalHigher: boolean, isManual: boolean,
      usedVcmh: number, isVcmhManual: boolean
  ) => {
    const currentYear = new Date().getFullYear();
    let text = `À\n${operator || 'Operadora'}\nRef: Gestão de Apólice Cedo Seguros - Safra ${currentYear}\n\n`;
    text += `Prezados,\n\nRecebemos o reajuste proposto de ${proposedRate.toFixed(2)}%. Atuando como consultoria especializada na gestão deste contrato, apresentamos nossa análise técnica:\n\n`;
    
    if (formData.companySize === 'PME_I') {
        text += `1. POOL DE RISCO (RN 565)\nIdentificamos o índice de referência de ${usedVcmh.toFixed(2)}% para esta carteira. `;
        if (proposedRate > usedVcmh) text += `O valor proposto excede o índice oficial da operadora.\n\n`;
        else text += `Solicitamos avaliação comercial para redução do impacto.\n\n`;
    } else {
        text += `1. ANÁLISE TÉCNICA (Sinistralidade ${claims.toFixed(2)}% | Meta ${target}%)\n`;
        
        if (isManual) {
            text += `Conforme modelagem atuarial interna da Cedo Seguros, o reajuste técnico estrito para equilíbrio da apólice é de ${techRate.toFixed(2)}%.\n\n`;
        } else {
             if (isTechnicalHigher) {
                text += `O reajuste técnico calculado aponta para ${techRate.toFixed(2)}%. Reconhecemos o abrandamento na proposta enviada, mas solicitamos manutenção comercial visando o longo prazo.\n\n`;
             } else {
                text += `A necessidade técnica real é de apenas ${techRate.toFixed(2)}%, inferior à proposta enviada. O contrato apresenta condições de equilíbrio com índice menor.\n\n`;
             }
        }
        
        text += `2. INDEXADOR FINANCEIRO (VCMH)\n`;
        if (isVcmhManual) text += `Consideramos o índice customizado/negociado de ${usedVcmh.toFixed(2)}%, mais aderente à realidade da apólice.\n\n`;
        else text += `Aplicado VCMH de mercado de ${usedVcmh.toFixed(2)}%.\n\n`;
    }

    text += `PLEITO:\n`;
    if (isNegative) text += `Diante do resultado superavitário, solicitamos ISENÇÃO TOTAL (0%).\n\n`;
    else text += `Solicitamos a revisão para o teto de ${techRate.toFixed(2)}%, garantindo a sustentabilidade do contrato.\n\n`;
    
    text += `Atenciosamente,\nCedo Seguros - Gestão Corporativa`;
    return text;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Inputs Seguros (Evita NaN)
      const claims = parseFloat(formData.claimsRatio) || 0;
      const dbVcmh = parseFloat(formData.vcmh) || 0;
      const manualVcmhVal = parseFloat(formData.manualVcmh); // Pode ser NaN se vazio
      const invoice = parseFloat(formData.currentInvoice) || 0;
      const proposed = parseFloat(formData.proposedReadjustment) || 0;
      const targetLossRatio = parseFloat(formData.breakEvenPoint) || 75;
      const avgAge = parseFloat(formData.averageAge) || 0;
      const manualTechInput = formData.manualTechnical ? parseFloat(formData.manualTechnical) : null;

      // DECISÃO DO VCMH: Usa Manual se existir, senão usa DB
      const usedVcmh = !isNaN(manualVcmhVal) ? manualVcmhVal : dbVcmh;
      const isVcmhManual = !isNaN(manualVcmhVal);

      // 1. Cálculo Matemático Multiplicativo (Padrão Ouro)
      // Necessidade = [ (Sinistro * (1+VCMH)) / Meta ] - 1
      const vcmhFactor = 1 + (usedVcmh / 100);
      const currentLossRatio = claims / 100;
      const targetRatio = targetLossRatio / 100;

      let technicalNeedRaw = 0;
      
      // Se for PME I, o "Técnico" é apenas o índice da tabela (ou manual)
      if (formData.companySize === 'PME_I') {
         technicalNeedRaw = usedVcmh;
      } else {
         // Para os demais, calcula o desequilíbrio
         // Proteção contra divisão por zero
         if (targetRatio > 0) {
            const requiredPremiumRatio = (currentLossRatio * vcmhFactor) / targetRatio;
            technicalNeedRaw = (requiredPremiumRatio - 1) * 100;
         }
      }
      
      // 2. Aplicação do Mix
      let technicalCalculated = 0;
      const poolRef = CONFIG.POOL_2026["Média de Mercado"];

      switch (formData.calculationMix) {
        case 'POOL_100': technicalCalculated = poolRef; break;
        case 'TECH_100': technicalCalculated = technicalNeedRaw; break;
        case 'MIX_50_50': technicalCalculated = (poolRef * 0.5) + (technicalNeedRaw * 0.5); break;
        case 'MIX_70_30': technicalCalculated = (poolRef * 0.7) + (technicalNeedRaw * 0.3); break; // 70% Pool / 30% Tec
      }

      // DECISÃO FINAL: Usa o Manual Override se existir, senão usa o Calculado
      const technicalFinal = manualTechInput !== null ? manualTechInput : technicalCalculated;
      const isManualOverride = manualTechInput !== null;

      // 3. Aging Factor
      let agingRiskLoad = 0;
      if (avgAge > 59) agingRiskLoad = 0.05;
      else if (avgAge > 49) agingRiskLoad = 0.03;
      else if (avgAge < 30) agingRiskLoad = -0.01;
      
      // Trend Factor (VCMH + Envelhecimento)
      const trendFactor = (1 + (usedVcmh / 100) + agingRiskLoad);
      
      const valProposed = invoice * (1 + (proposed / 100));
      const valFair = invoice * (1 + (technicalFinal / 100));
      
      const isNegative = technicalFinal <= 0;
      const isTechnicalHigher = technicalFinal > proposed;
      
      // Projeção de Sinistralidade Reversa
      // Quanto será o sinistro ano que vem se aplicarmos o reajuste técnico? (Deveria ser igual a Meta)
      let projectedClaims = 0;
      if (technicalFinal > -100) { // Evita divisão por zero
          projectedClaims = ((claims * vcmhFactor) / (1 + (technicalFinal/100)));
      }

      const defense = generateDefenseText(
          technicalFinal, proposed, claims, targetLossRatio, 
          formData.operator, isNegative, isTechnicalHigher, isManualOverride,
          usedVcmh, isVcmhManual
      );

      setResult({
        technicalReadjustment: parseFloat(technicalFinal.toFixed(2)),
        proposedReadjustment: proposed,
        savingPotential: parseFloat((proposed - technicalFinal).toFixed(2)),
        isNegative,
        isTechnicalHigher,
        isManualOverride,
        isVcmhManual,
        usedVcmh,
        agingFactor: agingRiskLoad * 100,
        projectedClaimsRatio: parseFloat(projectedClaims.toFixed(2)),
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
                  {/* LOGO SIMULADO CEDO SEGUROS */}
                  <Shield className="w-8 h-8 text-[#a3e635]" fill="currentColor" />
                  <h1 className="text-3xl font-black text-white tracking-tight">
                    CEDO <span className="text-[#a3e635]">SEGUROS</span>
                  </h1>
              </div>
              <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] mt-1 pl-10">
                INTELIGÊNCIA CORPORATIVA & ATUARIAL
              </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:block text-right">
                <div className="text-[10px] uppercase text-slate-500 font-bold">Safra 2026</div>
                <div className="text-xs text-[#a3e635] font-mono flex items-center gap-1 justify-end">
                    <Database className="w-3 h-3" /> BASE ATUALIZADA
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
                        Dados da Apólice
                    </h2>
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-6">
                
                <InputGroup label="Operadora" icon={Building2}>
                  <select 
                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:ring-1 focus:ring-[#a3e635] outline-none"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, companySize: e.target.value as CompanySize})}
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
                             <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">VCMH Padrão</span>
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Break-Even Point (Meta)</label>
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
                  {loading ? 'Processando Cedo AI...' : <>CALCULAR CENÁRIO <ArrowRight className="w-4 h-4" /></>}
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
                <p className="text-sm mt-2">Aguardando processamento de dados.</p>
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

                    {/* CARD TÉCNICO CEDO */}
                    <Card className={`bg-[#1e293b] border-l-4 ${result.isManualOverride ? 'border-l-[#a3e635]' : result.isTechnicalHigher ? 'border-l-yellow-500' : 'border-l-emerald-500'}`}>
                        <div className="p-6">
                            <div className="flex justify-between mb-4">
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${result.isManualOverride ? 'text-[#a3e635]' : result.isTechnicalHigher ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                        {result.isManualOverride ? 'Técnico (Manual)' : 'Técnico (Calculado)'}
                                    </h3>
                                </div>
                                <Badge variant={result.isManualOverride ? 'green' : result.isTechnicalHigher ? 'orange' : 'green'}>
                                    CEDO IA
                                </Badge>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className={`text-5xl font-black ${result.isManualOverride ? 'text-[#a3e635]' : result.isTechnicalHigher ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                    {result.technicalReadjustment}
                                </span>
                                <span className="text-xl font-bold text-slate-500">%</span>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                {result.savingPotential > 0 ? (
                                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4" /> Economia: {formatCurrency(result.financialImpact.accumulatedSaving)}/ano
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500">Sem margem técnica aparente.</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. TABELA DE PROJEÇÃO */}
                <Card>
                    <div className="bg-[#0f172a] px-6 py-4 flex justify-between items-center border-b border-slate-700">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-[#a3e635]" />
                            Projeção Futura (36 Meses)
                        </h3>
                        {result.isVcmhManual && (
                             <Badge variant="blue">VCMH Manual: {result.usedVcmh}%</Badge>
                        )}
                    </div>
                    
                    <div className="p-0">
                        <table className="w-full text-sm text-left text-slate-300">
                            <thead className="text-xs text-slate-500 uppercase bg-[#151e32] border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-3">Ciclo</th>
                                    <th className="px-6 py-3">Fatura Estimada</th>
                                    <th className="px-6 py-3">Custo Anual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {[
                                    { l: 'Ano 1', v: result.financialImpact.projections.m12 },
                                    { l: 'Ano 2', v: result.financialImpact.projections.m24 },
                                    { l: 'Ano 3', v: result.financialImpact.projections.m36 },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-[#1e293b] transition-colors">
                                        <td className="px-6 py-4 font-bold text-white border-l-2 border-slate-600">{row.l}</td>
                                        <td className="px-6 py-4 font-mono text-[#a3e635]">{formatCurrency(row.v)}</td>
                                        <td className="px-6 py-4 font-mono text-slate-400">{formatCurrency(row.v * 12)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 3. DEFESA TÉCNICA */}
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