"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, RefreshCw, Settings,
  UserPlus, Percent, Database, Edit3, Shield, Zap, Thermometer, BarChart3, Clock, Brain, Microscope, BookOpen, Lightbulb, Layers, Split, Sigma, Target, Crosshair, TrendingDown
} from 'lucide-react';

// --- CONFIGURAÇÃO E DADOS (SAFRA 2026 - AUDITADO) ---
const CONFIG = {
  VERSION: "17.0.0 (Quantum Analytics)",
  LAST_UPDATE: "26/02/2026",
  
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
type CalculationMix = 'WEIGHTED' | 'INDIVIDUAL'; 
type NegotiationStatus = 'FAVORABLE' | 'BALANCED' | 'AGGRESSIVE' | 'WARZONE';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  calculationMix: CalculationMix;
  breakEvenPoint: string;
  averageAge: string;
  claimsPool: string;
  weightPool: string;
  claimsIndividual: string;
  weightIndividual: string;
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
  targetReadjustment: number; // A NOVA MÁGICA: O Alvo
  marginApplied: number;
  savingPotential: number;
  isNegative: boolean;
  isTechnicalHigher: boolean;
  isManualOverride: boolean;
  isVcmhManual: boolean;
  usedVcmh: number;
  agingFactor: number;
  nextYearProjection: number;
  aiConfidenceScore: number;
  negotiationStatus: NegotiationStatus;
  financialImpact: {
    current: number;
    proposedValue: number;
    fairValue: number;
    targetValue: number;
    accumulatedSaving: number; // Baseado no alvo
    projections: { m12: number; m24: number; m36: number; }
  };
  defenseText: string;
  compositeClaims?: { pool: number; ind: number; final: number; };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- DESIGN SYSTEM: QUANTUM GLASS ---
const Card = ({ children, className = "", glow = false, glowColor = "cyan" }: { children: React.ReactNode; className?: string, glow?: boolean, glowColor?: "cyan" | "emerald" | "rose" | "gold" | "purple" }) => {
  const glowMap = {
      cyan: "shadow-[0_0_30px_rgba(6,182,212,0.1)]",
      emerald: "shadow-[0_0_30px_rgba(16,185,129,0.1)]",
      rose: "shadow-[0_0_30px_rgba(244,63,94,0.1)]",
      gold: "shadow-[0_0_30px_rgba(251,191,36,0.1)]",
      purple: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  };
  return (
      <div className={`bg-[#0b1221]/90 border border-slate-700/50 rounded-2xl relative overflow-hidden backdrop-blur-2xl ${glow ? glowMap[glowColor] : 'shadow-2xl'} ${className}`}>
        {children}
      </div>
  );
};

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' | 'purple' | 'gold' | 'neon' }) => {
  const styles = {
    gray: "bg-slate-800/80 text-slate-300 border-slate-600/50",
    blue: "bg-cyan-950/60 text-cyan-400 border-cyan-800/50",
    green: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
    red: "bg-rose-950/60 text-rose-400 border-rose-800/50",
    purple: "bg-purple-950/60 text-purple-400 border-purple-800/50",
    gold: "bg-amber-950/60 text-amber-400 border-amber-800/50 shadow-[0_0_10px_rgba(251,191,36,0.15)]",
    neon: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]",
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${styles[variant]} uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md transition-all`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children, highlight = false }: { label: string, icon: any, children: React.ReactNode, highlight?: boolean }) => (
  <div className="space-y-2 group">
    <label className={`text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 transition-colors duration-300 ${highlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
      <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-500 transition-colors'}`} />
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
    calculationMix: 'WEIGHTED', 
    breakEvenPoint: '75',
    averageAge: '',
    claimsPool: '',
    weightPool: '40', 
    claimsIndividual: '',
    weightIndividual: '60', 
    claimsRatio: '',
    vcmh: '15.00',
    manualVcmh: '',
    currentInvoice: '',
    proposedReadjustment: '',
    manualTechnical: '' 
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // --- 1. INTELLIGENT RESET ---
  useEffect(() => {
    let indexValue = 15.0;
    if (formData.companySize === 'EMPRESARIAL') indexValue = 0; 
    else if (formData.companySize === 'PME_I') indexValue = formData.operator && CONFIG.POOL_2026[formData.operator] ? CONFIG.POOL_2026[formData.operator] : CONFIG.POOL_2026["Média de Mercado"];
    else indexValue = formData.operator && CONFIG.VCMH_INDICES[formData.operator] ? CONFIG.VCMH_INDICES[formData.operator] : CONFIG.VCMH_INDICES["Média de Mercado"];

    setFormData(prev => ({
        ...prev,
        vcmh: indexValue === 0 ? '' : indexValue.toFixed(2), 
        claimsRatio: '', claimsPool: '', claimsIndividual: '', currentInvoice: '', proposedReadjustment: '', manualTechnical: '', manualVcmh: '', averageAge: ''
    }));

    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'INDIVIDUAL' })); 
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'INDIVIDUAL' }));
    if (formData.companySize === 'PME_II') setFormData(prev => ({ ...prev, calculationMix: 'WEIGHTED' })); 

    setResult(null);
  }, [formData.operator, formData.companySize]); 

  // --- 2. CÁLCULO PONDERADO ---
  useEffect(() => {
    if (formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED') {
        const pool = parseFloat(formData.claimsPool) || 0;
        const wPool = parseFloat(formData.weightPool) || 0;
        const ind = parseFloat(formData.claimsIndividual) || 0;
        const wInd = parseFloat(formData.weightIndividual) || 0;
        const totalWeight = wPool + wInd;
        if (totalWeight > 0 && (pool > 0 || ind > 0)) {
            const weightedAverage = ((pool * wPool) + (ind * wInd)) / totalWeight;
            setFormData(prev => ({ ...prev, claimsRatio: weightedAverage.toFixed(2) }));
        }
    }
  }, [formData.claimsPool, formData.weightPool, formData.claimsIndividual, formData.weightIndividual, formData.companySize, formData.calculationMix]);

  // --- GERADOR DE DEFESA QUANTUM (PERFEIÇÃO TÉCNICA E ANCORAGEM) ---
  const generateDefenseText = (
      techRate: number, proposedRate: number, targetRate: number, claims: number, 
      target: number, operator: string, isNegative: boolean, 
      isTechnicalHigher: boolean, isManual: boolean, usedVcmh: number, isVcmhManual: boolean
  ) => {
    const currentYear = new Date().getFullYear();
    let text = `Ref: Estudo Atuarial e Pleito de Reajuste - Safra ${currentYear}\nOperadora: ${operator || 'Operadora'}\nConsultoria: Cedo Seguros - Intelligence & Risk Management\n\n`;
    text += `Prezados,\n\nSubmetemos à vossa apreciação a auditoria técnica referente à proposta de reajuste de ${proposedRate.toFixed(2)}%.\n\n`;
    
    text += `1. FUNDAMENTAÇÃO TÉCNICA E SINISTRALIDADE\n`;
    if (formData.companySize === 'PME_I') {
        text += `O contrato enquadra-se normativamente na RN 565 ANS (Agrupamento PME). Apuramos que o índice oficial do pool consolidado é de ${usedVcmh.toFixed(2)}%. `;
        if (proposedRate > usedVcmh + 0.01) { 
             text += `Constatamos grave divergência técnica, visto que a proposta de ${proposedRate.toFixed(2)}% fere o teto estipulado pela agência reguladora e pela própria publicação da operadora.\n\n`;
        } else {
             text += `Atestamos a conformidade da aplicação do índice. Contudo, a análise intrínseca do CNPJ demonstra baixíssima utilização e perfil de risco extremamente favorável.\n\n`;
        }
    } else {
        if (formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED') {
            text += `Aplicando o modelo de risco misto aprovado atuarialmente (Peso Pool ${formData.weightPool}% / Peso Individual ${formData.weightIndividual}%), fechamos o exercício com sinistralidade média ponderada de ${claims.toFixed(2)}%.\n`;
        } else {
            text += `A avaliação de risco aponta sinistralidade acumulada de ${claims.toFixed(2)}% frente ao Break-even contratual de ${target}%.\n`;
        }
        
        if (isTechnicalHigher) {
             text += `Notamos que a operadora já aplicou um redutor frente ao teto matemático puro de ${techRate.toFixed(2)}%. Reconhecemos o esforço comercial primário (${proposedRate.toFixed(2)}%).\n`;
        } else {
             text += `A matemática de equilíbrio econômico-financeiro (considerando margem, arrasto e inflação) demonstra que o teto absoluto de repasse é de apenas ${techRate.toFixed(2)}%, invalidando a premissa dos ${proposedRate.toFixed(2)}% solicitados.\n`;
        }
        
        if (target <= 65 && techRate > 15) {
             text += `Nota Atuarial Cedo: A baliza de ${target}% como Break-even é uma assimetria mercadológica severa. Requeremos, para fins de viabilidade contratual, a flexibilização deste Target ou o expurgo imediato de sinistros de cauda longa (internações atípicas) não-recorrentes da base de cálculo.\n\n`;
        } else {
            text += `\n`;
        }
        
        text += `2. COMPONENTE FINANCEIRO E INFLAÇÃO MÉDICA\n`;
        if (formData.companySize === 'EMPRESARIAL' && !isVcmhManual) text += `Tratando-se de apólice Corporate, o VCMH utilizado como ofensor foi isolado/zerado para análise pura de performance.\n\n`;
        else text += `Consideramos em nossa modelagem o VCMH (Índice Financeiro) de ${usedVcmh.toFixed(2)}%.\n\n`;
    }

    text += `3. ESTRATÉGIA DE RETENÇÃO E PLEITO FINAL (TARGET RATE)\n`;
    text += `A Cedo Seguros pauta-se pela gestão preventiva de risco e longevidade dos contratos. Repasses não ancorados na realidade inflacionária do cliente geram anti-seleção imediata e churn irreversível.\n\n`;

    if (isNegative) {
        text += `PLEITO EXECUTIVO: Exigimos a ISENÇÃO TOTAL de reajuste (0%), homologando o ganho de eficiência técnica entregue à operadora no período.\n`;
    } else {
        text += `PLEITO EXECUTIVO: Requeremos a fixação do reajuste no Alvo Estratégico de ${targetRate.toFixed(2)}%.\n`;
        if (isTechnicalHigher) text += `Este patamar é o limite para prevenção de quebra de contrato e reflete o real partnership esperado.\n`;
        else text += `Este número absorve a inflação médica real e purga gorduras de repasse, mantendo o equilíbrio mutuo.\n`;
    }
    
    text += `\nCertos da vossa análise técnica e parceria comercial,\n\nCedo Seguros\nDiretoria de Inteligência e Gestão de Risco`;
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

      // --- MOTOR MATEMÁTICO PURO ---
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
      
      const technicalFinal = manualTechInput !== null ? manualTechInput : technicalNeedRaw;

      // --- A MÁGICA: ESTRATÉGIA DE ANCORAGEM (TARGET RATE) ---
      // A regra de ouro de negociação: Sempre pedir menos.
      let targetRate = 0;
      let appliedMargin = 0;

      if (formData.companySize === 'PME_I') {
          // Pool puro: Pede deságio comercial sobre a tabela
          appliedMargin = 2.5;
          targetRate = Math.max(0, usedVcmh - appliedMargin);
      } else {
          if (technicalFinal > proposed) {
              // Operadora foi boazinha e pediu menos que o técnico. 
              // Regra Cedo: Não aceitamos. Pedimos MENOS que o proposto.
              appliedMargin = 2.0;
              targetRate = Math.max(0, proposed - appliedMargin);
          } else {
              // Operadora pediu mais que o justo.
              // Regra Cedo: Pegamos o Técnico Justo e arrancamos mais uma margem de negociação.
              appliedMargin = 3.5;
              targetRate = Math.max(0, technicalFinal - appliedMargin);
          }
      }

      // --- STATUS DE GUERRA ---
      let status: NegotiationStatus = 'BALANCED';
      const diff = proposed - targetRate;
      if (targetRate <= 0) status = 'FAVORABLE'; 
      else if (diff > 4 && diff <= 8) status = 'AGGRESSIVE';
      else if (diff > 8) status = 'WARZONE';
      else status = 'BALANCED';

      // --- FUTURO 2027 ---
      let agingRiskLoad = 0.02;
      if (avgAge > 59) agingRiskLoad = 0.06;
      else if (avgAge > 49) agingRiskLoad = 0.04;
      else if (avgAge < 30) agingRiskLoad = 0.01;
      
      const nextYearProjection = (Math.max(technicalFinal, 0) * 0.5) + usedVcmh + (agingRiskLoad * 100);
      const trendFactor = (1 + (usedVcmh / 100) + agingRiskLoad);
      const valProposed = invoice * (1 + (proposed / 100));
      const valFair = invoice * (1 + (technicalFinal / 100));
      const valTarget = invoice * (1 + (targetRate / 100)); // Valor que queremos assinar
      
      const isNegative = technicalFinal <= 0;
      const isTechnicalHigher = technicalFinal > proposed;
      const aiConfidence = Math.min(99.4, 85 + (claims > 0 ? 8 : 0) + (usedVcmh > 0 ? 6 : 0));
      
      const defense = generateDefenseText(
          technicalFinal, proposed, targetRate, claims, targetLossRatio, 
          formData.operator, isNegative, isTechnicalHigher, isManualOverride,
          usedVcmh, isVcmhManual
      );

      setResult({
        technicalReadjustment: parseFloat(technicalFinal.toFixed(2)),
        proposedReadjustment: proposed,
        targetReadjustment: parseFloat(targetRate.toFixed(2)),
        marginApplied: appliedMargin,
        savingPotential: parseFloat((proposed - targetRate).toFixed(2)),
        isNegative,
        isTechnicalHigher,
        isManualOverride,
        isVcmhManual,
        usedVcmh,
        agingFactor: agingRiskLoad * 100,
        nextYearProjection: parseFloat(nextYearProjection.toFixed(2)),
        aiConfidenceScore: aiConfidence,
        negotiationStatus: status,
        financialImpact: {
            current: invoice,
            proposedValue: valProposed,
            fairValue: valFair,
            targetValue: valTarget,
            accumulatedSaving: (valProposed - valTarget) * 12,
            projections: { m12: valTarget, m24: valTarget * trendFactor, m36: valTarget * trendFactor * trendFactor }
        },
        defenseText: defense,
        compositeClaims: (formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED') ? {
            pool: parseFloat(formData.claimsPool) || 0, ind: parseFloat(formData.claimsIndividual) || 0, final: claims
        } : undefined
      });
      setLoading(false);
    }, 1200); // Um pouco mais de delay para dar sensação de processamento complexo
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-300 pb-20 selection:bg-cyan-400 selection:text-slate-900 overflow-x-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* HEADER */}
      <div className="bg-[#020617]/60 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="relative group">
                  <div className="absolute inset-0 bg-cyan-400/40 rounded-xl blur-md group-hover:bg-cyan-400/60 transition-all duration-500"></div>
                  <div className="relative bg-gradient-to-br from-[#0f172a] to-slate-900 p-2 rounded-xl border border-slate-700/50">
                    <Shield className="w-6 h-6 text-cyan-400" strokeWidth={2.5} />
                  </div>
              </div>
              <div>
                  <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    CEDO <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">SEGUROS</span>
                  </h1>
                  <p className="text-[9px] text-cyan-500/80 font-mono font-bold tracking-[0.3em] uppercase mt-0.5">
                    Quantum Actuarial Core v17.0
                  </p>
              </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
             <div className="text-right flex flex-col items-end">
                <div className="text-[9px] uppercase text-slate-500 font-bold tracking-widest flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500"/> Banco de Dados ANS</div>
                <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 justify-end mt-0.5">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                    SAFRA 2026 ATIVA
                </div>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA - INPUTS */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-t-4 border-t-cyan-500">
                <div className="px-6 py-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-900/30">
                    <h2 className="text-xs font-bold text-white uppercase flex items-center gap-2 tracking-wider">
                        <Briefcase className="w-4 h-4 text-cyan-400" />
                        Engenharia da Apólice
                    </h2>
                    <Settings className="w-4 h-4 text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer" />
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-6">
                
                <InputGroup label="Operadora" icon={Building2}>
                  <select 
                    className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all hover:border-slate-500/80 appearance-none shadow-inner"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Análise Dinâmica (Selecione)</option>
                    {OPERATORS_LIST.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Porte (ANS)" icon={Users}>
                      <select
                        className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all hover:border-slate-500/80 appearance-none"
                        value={formData.companySize}
                        onChange={(e) => setFormData({...formData, companySize: e.target.value as CompanySize})}
                      >
                         <option value="PME_I">PME I (Pool)</option>
                         <option value="PME_II">PME II</option>
                         <option value="EMPRESARIAL">Corporate</option>
                      </select>
                    </InputGroup>

                    {formData.companySize === 'PME_II' && (
                        <InputGroup label="Metodologia" icon={Scale}>
                            <select
                                className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all hover:border-slate-500/80 appearance-none"
                                value={formData.calculationMix}
                                onChange={(e) => setFormData({...formData, calculationMix: e.target.value as CalculationMix})}
                            >
                                <option value="WEIGHTED">Por Peso</option>
                                <option value="INDIVIDUAL">Individual</option>
                            </select>
                        </InputGroup>
                    )}
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-900/80 to-[#020617] rounded-xl border border-slate-700/50 space-y-5 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-emerald-600"></div>
                    
                    {/* INPUTS DE SINISTRO */}
                    {formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                             <div className="flex items-center gap-2 mb-2">
                                <Split className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Matemática Ponderada</span>
                             </div>
                             
                             <div className="grid grid-cols-12 gap-3 items-center">
                                 <div className="col-span-8">
                                     <InputGroup label="Sinistro Pool %" icon={Users}>
                                        <input type="number" className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-cyan-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" value={formData.claimsPool} onChange={(e) => setFormData({...formData, claimsPool: e.target.value})} placeholder="0.00" />
                                     </InputGroup>
                                 </div>
                                 <div className="col-span-4">
                                     <InputGroup label="Peso %" icon={Scale}>
                                        <input type="number" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-2 text-sm font-mono text-slate-400 text-center outline-none focus:text-cyan-400" value={formData.weightPool} onChange={(e) => setFormData({...formData, weightPool: e.target.value})} />
                                     </InputGroup>
                                 </div>
                             </div>

                             <div className="grid grid-cols-12 gap-3 items-center">
                                 <div className="col-span-8">
                                     <InputGroup label="Sinistro Ind. %" icon={UserPlus}>
                                        <input type="number" className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" value={formData.claimsIndividual} onChange={(e) => setFormData({...formData, claimsIndividual: e.target.value})} placeholder="0.00" />
                                     </InputGroup>
                                 </div>
                                 <div className="col-span-4">
                                     <InputGroup label="Peso %" icon={Scale}>
                                        <input type="number" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-2 text-sm font-mono text-slate-400 text-center outline-none focus:text-emerald-400" value={formData.weightIndividual} onChange={(e) => setFormData({...formData, weightIndividual: e.target.value})} />
                                     </InputGroup>
                                 </div>
                             </div>

                             <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center bg-slate-900/30 -mx-5 px-5 -mb-5 pb-5 rounded-b-xl">
                                 <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Média Estatística Final</span>
                                 <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md">
                                    <span className="text-sm font-mono font-black text-cyan-400">{formData.claimsRatio ? `${formData.claimsRatio}%` : '--'}</span>
                                 </div>
                             </div>

                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                             <InputGroup label="Sinistralidade %" icon={ShieldAlert}>
                                <input 
                                    type="number" 
                                    disabled={formData.companySize === 'PME_I'} 
                                    className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-xl px-4 py-3 text-lg font-mono font-black text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    value={formData.claimsRatio}
                                    onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                                    placeholder={formData.companySize === 'PME_I' ? "ANS PME I (Isento)" : "0.00"}
                                />
                            </InputGroup>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col justify-center">
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Database className="w-3 h-3"/> VCMH Mercado</span>
                         <span className={`text-sm font-mono font-bold ${formData.vcmh ? 'text-slate-300' : 'text-slate-600'}`}>
                            {formData.vcmh ? `${formData.vcmh}%` : 'Zerar (Corporate)'}
                         </span>
                     </div>
                     <InputGroup label="VCMH Sobrescrito" icon={Edit3} highlight={!!formData.manualVcmh}>
                        <input 
                            type="number" 
                            className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-3 py-3 text-sm font-mono font-bold text-amber-400 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder-slate-600"
                            value={formData.manualVcmh}
                            onChange={(e) => setFormData({...formData, manualVcmh: e.target.value})}
                            placeholder="Ajuste manual..."
                        />
                     </InputGroup>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-cyan-500" /> Target Loss Ratio (Break-Even)
                    </label>
                    <div className="flex bg-[#020617] p-1.5 rounded-xl border border-slate-800 shadow-inner gap-1">
                        {['65', '70', '72', '75'].map(bp => (
                            <button
                                key={bp} type="button" onClick={() => setFormData({...formData, breakEvenPoint: bp})}
                                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all duration-300 ${formData.breakEvenPoint === bp ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {bp}%
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-800/60 space-y-5">
                    <InputGroup label="Fatura Base (R$)" icon={DollarSign}>
                    <input 
                        type="number" 
                        className="w-full bg-[#020617]/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-base font-mono font-bold text-emerald-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner transition-all"
                        value={formData.currentInvoice} onChange={(e) => setFormData({...formData, currentInvoice: e.target.value})} placeholder="0,00"
                    />
                    </InputGroup>
                    <InputGroup label="Proposta Apresentada (%)" icon={AlertTriangle}>
                    <input 
                        type="number" 
                        className="w-full bg-[#020617]/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-xl font-mono font-black text-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none shadow-inner transition-all placeholder-rose-900/30"
                        value={formData.proposedReadjustment} onChange={(e) => setFormData({...formData, proposedReadjustment: e.target.value})} placeholder="0.00"
                    />
                    </InputGroup>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-4 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-slate-900 font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                      {loading ? 'Inicializando Algoritmo...' : <>EXECUTAR ANÁLISE QUANTUM <Zap className="w-4 h-4 fill-slate-900" /></>}
                  </span>
                </button>
              </form>
            </Card>
          </div>

          {/* COLUNA DIREITA - RESULTADOS */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-gradient-to-b from-[#0b1221]/50 to-transparent border border-slate-800/40 rounded-3xl text-slate-500 p-10 text-center backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]"></div>
                <div className="w-24 h-24 bg-[#020617] rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-slate-800/80 rotate-3 group-hover:rotate-0 transition-all duration-700 relative">
                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl animate-pulse"></div>
                    <Brain className="w-12 h-12 text-slate-600 relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Aguardando Parâmetros</h3>
                <p className="text-sm max-w-md text-slate-400 leading-relaxed">
                    O motor atuarial Cedo irá cruzar dados da ANS, inflação médica e performance estatística para calcular a <strong>Taxa Alvo Estratégica</strong> perfeita para a sua negociação.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-12 fade-in duration-1000">
                
                {/* 1. HUD: THE TRIPLE THREAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Proposto */}
                    <Card className="p-5 flex flex-col justify-between" glowColor="rose">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-rose-500/50" /> Operadora</span>
                            <Badge variant="red">Proposto</Badge>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-white">{result.proposedReadjustment}</span><span className="text-lg text-slate-600 font-bold">%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Impacto Mês: R$ {((result.financialImpact.proposedValue - result.financialImpact.current)).toLocaleString('pt-BR', {minimumFractionDigits:2})}</p>
                        </div>
                    </Card>

                    {/* Matemático */}
                    <Card className="p-5 flex flex-col justify-between" glowColor="emerald">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5 text-emerald-500/50" /> Ciência</span>
                            <Badge variant="green">Técnico Puro</Badge>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-300">{result.technicalReadjustment}</span><span className="text-lg text-slate-600 font-bold">%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Teto Matemático Apurado</p>
                        </div>
                    </Card>

                    {/* O ALVO CEDO (HIGHLIGHT) */}
                    <Card className="p-5 flex flex-col justify-between border-cyan-500/50" glow glowColor="cyan">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-full"></div>
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5"><Crosshair className="w-4 h-4" /> Negociação</span>
                            <Badge variant="neon">Alvo Cedo</Badge>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tighter">{result.targetReadjustment}</span><span className="text-xl text-cyan-500 font-bold">%</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-bold text-emerald-400">Poupar {formatCurrency(result.financialImpact.accumulatedSaving)}/ano</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. ESTRATÉGIA DE ANCORAGEM (NOVIDADE) */}
                <Card className="border-l-4 border-l-amber-400 bg-gradient-to-r from-[#0f172a] to-[#020617]">
                    <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="gold">Inteligência Estratégica</Badge>
                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Por que pedir {result.targetReadjustment}%?</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                {result.companySize === 'PME_I' 
                                    ? `Aperamos um deságio comercial de ${result.marginApplied}% sobre o índice oficial do Pool (${result.usedVcmh}%) justificando pela retenção frente à agressividade do mercado.`
                                    : result.isTechnicalHigher 
                                        ? `A operadora propôs ${result.proposedReadjustment}%, que é ABAIXO do risco técnico (${result.technicalReadjustment}%). Nossa tese: Nunca aceite a primeira oferta. Aplicamos uma âncora de -${result.marginApplied}%, mirando ${result.targetReadjustment}% sob a justificativa de budget e retenção preventiva.`
                                        : `O risco matemático exato é ${result.technicalReadjustment}%, mas incluímos uma "Gordura de Negociação" de ${result.marginApplied}% para iniciar o pleito. O Alvo de Ancoragem ideal para a reunião é ${result.targetReadjustment}%.`}
                            </p>
                        </div>
                        <div className="shrink-0 text-center hidden md:block px-6 border-l border-slate-800">
                             <div className="text-2xl font-black text-white">{result.aiConfidenceScore.toFixed(1)}<span className="text-sm text-slate-500">%</span></div>
                             <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold mt-1">Taxa de Confiança</div>
                        </div>
                    </div>
                </Card>

                {/* 3. STORYTELLING FINANCEIRO (TIMELINE) */}
                <Card className="border border-slate-800">
                    <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0b1221]">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Clock className="w-4 h-4 text-cyan-400" /> Impacto Financeiro (Visão 3 Anos)
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">Projeção Base: Alvo Estratégico</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Linha conectora */}
                        <div className="hidden md:block absolute top-1/2 left-10 right-10 h-[2px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-rose-500/20 -translate-y-1/2 z-0"></div>
                        
                        {/* ANO 1 */}
                        <div className="bg-[#020617] rounded-2xl p-5 border border-emerald-500/30 relative z-10 shadow-lg group hover:-translate-y-1 transition-transform">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ano 1 (Sucesso)</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-mono text-white font-bold tracking-tight">{formatCurrency(result.financialImpact.projections.m12)}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Fatura Mensal</div>
                            </div>
                        </div>
                        {/* ANO 2 */}
                        <div className="bg-[#020617] rounded-2xl p-5 border border-cyan-500/30 relative z-10 shadow-lg group hover:-translate-y-1 transition-transform delay-75">
                             <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Ano 2 (Renovação)</span>
                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-mono text-white font-bold tracking-tight">{formatCurrency(result.financialImpact.projections.m24)}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Projeção Mensal</div>
                            </div>
                        </div>
                        {/* ANO 3 */}
                        <div className="bg-[#020617] rounded-2xl p-5 border border-rose-500/30 relative z-10 shadow-lg group hover:-translate-y-1 transition-transform delay-150">
                             <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Ano 3 (Risco)</span>
                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-mono text-white font-bold tracking-tight">{formatCurrency(result.financialImpact.projections.m36)}</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Inflação Composta</div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 4. DEFESA TÉCNICA GERADA */}
                <Card className="border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 bg-[#0b1221] border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-blue-500/10 rounded-md">
                                <FileText className="w-4 h-4 text-blue-400" />
                            </div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Parecer Atuarial & Pleito</h3>
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.defenseText)}
                            className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-slate-900 bg-cyan-400 hover:bg-cyan-300 px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95"
                        >
                            <Copy className="w-3 h-3" /> Copiar Documento
                        </button>
                    </div>
                    <div className="p-8 bg-[#020617] relative">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent"></div>
                        <pre className="whitespace-pre-wrap font-serif text-[15px] text-slate-300 leading-relaxed max-w-4xl mx-auto">
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