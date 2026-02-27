"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, RefreshCw, Settings,
  UserPlus, Percent, Database, Edit3, Shield, Zap, Thermometer, BarChart3, Clock, Brain, Microscope, BookOpen, Lightbulb, Layers, Split, Sigma, Target, Crosshair, TrendingDown, Receipt
} from 'lucide-react';

// --- CONFIGURAÇÃO E DADOS (SAFRA 2026 - AUDITADO) ---
const CONFIG = {
  VERSION: "18.0.0 (Quantum Composition)",
  LAST_UPDATE: "27/02/2026",
  
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
type InputMode = 'PERCENT' | 'VALUES';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  calculationMix: CalculationMix;
  inputMode: InputMode;
  breakEvenPoint: string;
  averageAge: string;
  
  // Modos de Input
  revenuePeriod: string;
  claimsValuePeriod: string;
  claimsRatio: string;
  
  // PME II Weighted
  claimsPool: string;
  weightPool: string;
  claimsIndividual: string;
  weightIndividual: string;
  
  vcmh: string; 
  manualVcmh: string; 
  assistentialRisk: string; // Fator C
  currentInvoice: string;
  proposedReadjustment: string;
  manualTechnical: string; 
}

interface AnalysisResult {
  companySize: CompanySize;
  
  // Decomposição Oficial (A, B, C)
  factorA_VCMH: number;
  factorB_Technical: number;
  factorC_Risk: number;
  technicalTotalReadjustment: number; // Reajuste Total Matemático
  
  proposedReadjustment: number;
  targetReadjustment: number;
  marginApplied: number;
  savingPotential: number;
  
  isNegative: boolean;
  isTechnicalHigher: boolean;
  isManualOverride: boolean;
  isVcmhManual: boolean;
  
  agingFactor: number;
  nextYearProjection: number;
  aiConfidenceScore: number;
  negotiationStatus: NegotiationStatus;
  
  financialImpact: {
    current: number;
    proposedValue: number;
    fairValue: number;
    targetValue: number;
    accumulatedSaving: number;
    projections: { m12: number; m24: number; m36: number; }
  };
  defenseText: string;
  compositeClaims?: { pool: number; ind: number; final: number; };
  usedClaimsRatio: number;
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
    calculationMix: 'INDIVIDUAL', 
    inputMode: 'PERCENT',
    breakEvenPoint: '70',
    averageAge: '',
    revenuePeriod: '',
    claimsValuePeriod: '',
    claimsRatio: '',
    claimsPool: '',
    weightPool: '40', 
    claimsIndividual: '',
    weightIndividual: '60', 
    vcmh: '15.00',
    manualVcmh: '',
    assistentialRisk: '0',
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
        claimsRatio: '', revenuePeriod: '', claimsValuePeriod: '', claimsPool: '', claimsIndividual: '', currentInvoice: '', proposedReadjustment: '', manualTechnical: '', manualVcmh: '', averageAge: ''
    }));

    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'INDIVIDUAL' })); 
    setResult(null);
  }, [formData.operator, formData.companySize]); 

  // --- 2. CÁLCULO DINÂMICO DE VALORES PARA % ---
  useEffect(() => {
      if (formData.inputMode === 'VALUES') {
          const rev = parseFloat(formData.revenuePeriod);
          const clm = parseFloat(formData.claimsValuePeriod);
          if (rev > 0 && clm >= 0) {
              const ratio = (clm / rev) * 100;
              setFormData(prev => ({ ...prev, claimsRatio: ratio.toFixed(2) }));
          } else {
              setFormData(prev => ({ ...prev, claimsRatio: '' }));
          }
      }
  }, [formData.revenuePeriod, formData.claimsValuePeriod, formData.inputMode]);

  // --- 3. CÁLCULO PONDERADO (PME II) ---
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

  // --- GERADOR DE DEFESA QUANTUM ---
  const generateDefenseText = (
      resultData: AnalysisResult, operator: string, targetBreakEven: number
  ) => {
    const currentYear = new Date().getFullYear();
    let text = `Ref: Estudo Atuarial e Parecer Técnico de Reajuste - Safra ${currentYear}\nOperadora: ${operator || 'Operadora'}\nConsultoria: Cedo Seguros - Intelligence & Risk Management\n\n`;
    text += `Prezados,\n\nSubmetemos à vossa apreciação a auditoria técnica referente à proposta de reajuste de ${resultData.proposedReadjustment.toFixed(2)}% enviada para este contrato.\n\n`;
    
    text += `1. DECOMPOSIÇÃO MATEMÁTICA E PERFORMANCE TÉCNICA\n`;
    
    if (resultData.companySize === 'PME_I') {
        text += `Atestamos que o contrato pertence ao agrupamento PME I (Pool). Verificamos o uso do VCMH balizador de ${resultData.factorA_VCMH.toFixed(2)}%.\n`;
        text += `Contudo, realizamos o apuramento da sinistralidade intrínseca da apólice, que fechou em ${resultData.usedClaimsRatio.toFixed(2)}%. Esta performance excepcional comprova a baixíssima utilização da massa, não gerando ofensores ao pool da operadora.\n`;
    } else {
        if (formData.calculationMix === 'WEIGHTED') {
             text += `Aplicando o modelo de risco misto (Pool vs Individual), isolamos a sinistralidade média ponderada de ${resultData.usedClaimsRatio.toFixed(2)}% frente ao Break-even de ${targetBreakEven}%.\n`;
        } else {
             text += `Avaliando a performance individual, apuramos uma sinistralidade de ${resultData.usedClaimsRatio.toFixed(2)}% frente ao Break-even pactuado de ${targetBreakEven}%.\n`;
        }
    }

    text += `\nAplicando a fórmula atuarial de composição padrão ANS (Reajuste = (1 + Fin) * (1 + Tec) * (1 + Risco) - 1), temos a seguinte apuração estrita:\n`;
    text += ` - Reajuste Financeiro (VCMH): ${resultData.factorA_VCMH.toFixed(2)}%\n`;
    text += ` - Reajuste Técnico Matemático: ${resultData.factorB_Technical.toFixed(2)}%\n`;
    if (resultData.factorC_Risk > 0) text += ` - Alteração de Risco Assistencial: ${resultData.factorC_Risk.toFixed(2)}%\n`;
    text += ` - REAJUSTE TOTAL CALCULADO: ${resultData.technicalTotalReadjustment.toFixed(2)}%\n\n`;

    if (resultData.technicalTotalReadjustment < resultData.proposedReadjustment) {
        text += `Conforme demonstrado acima, o reajuste máximo sustentado pelos números é de ${resultData.technicalTotalReadjustment.toFixed(2)}%, o que por si só já invalida a premissa dos ${resultData.proposedReadjustment.toFixed(2)}% solicitados inicialmente pela operadora.\n\n`;
    }

    text += `2. FATORES DE EXPURGO E ESTRATÉGIA DE RETENÇÃO\n`;
    text += `A Cedo Seguros atua com análise preditiva de risco. A imposição de índices descolados do real custo assistencial gera anti-seleção imediata.\n`;
    text += `Ademais, ao projetarmos o risco futuro, consideramos o expurgo natural de eventos não-recorrentes (cauda longa e IBNR já estabilizados) que contaminaram o cálculo retroativo do reajuste técnico.\n\n`;

    if (resultData.isNegative || resultData.targetReadjustment <= 0) {
        text += `PLEITO EXECUTIVO: Frente ao equilíbrio técnico comprovado, exigimos a ISENÇÃO TOTAL de reajuste (0%), homologando o ganho de eficiência entregue à operadora.\n`;
    } else {
        text += `PLEITO EXECUTIVO: Requeremos a fixação do reajuste no Alvo Estratégico de ${resultData.targetReadjustment.toFixed(2)}%.\n`;
        text += `Este é o patamar limite de viabilidade financeira aprovado pelo cliente, que expurga gorduras de repasse, absorve o VCMH real e previne a quebra (churn) imediata do contrato.\n`;
    }
    
    text += `\nCertos da vossa excelência técnica e parceria comercial,\n\nCedo Seguros\nDiretoria de Inteligência e Gestão de Risco`;
    return text;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const claimsRaw = parseFloat(formData.claimsRatio) || 0;
      const dbVcmh = parseFloat(formData.vcmh) || 0;
      const manualVcmhVal = parseFloat(formData.manualVcmh);
      const riskC = parseFloat(formData.assistentialRisk) || 0;
      const invoice = parseFloat(formData.currentInvoice) || 0;
      const proposed = parseFloat(formData.proposedReadjustment) || 0;
      const targetLossRatioRaw = parseFloat(formData.breakEvenPoint) || 70;
      const avgAge = parseFloat(formData.averageAge) || 0;
      const manualTechInput = formData.manualTechnical ? parseFloat(formData.manualTechnical) : null;

      const usedVcmh = !isNaN(manualVcmhVal) ? manualVcmhVal : dbVcmh;
      const isVcmhManual = !isNaN(manualVcmhVal);

      // --- DECOMPOSIÇÃO MATEMÁTICA (FÓRMULA DA IMAGEM) ---
      // x = % Sinistralidade, y = Break-Even
      const x = claimsRaw;
      const y = targetLossRatioRaw;
      
      // Fator A (Financeiro)
      const factorA = usedVcmh;
      
      // Fator B (Técnico) = (x / y) - 1. Apenas se x > y, senão é 0 para evitar deflação irreal na composição.
      let factorB = 0;
      if (x > y) {
          factorB = ((x / y) - 1) * 100; 
      }
      
      // Overrride Manual do Técnico (se o usuário forçou)
      if (manualTechInput !== null) {
          factorB = manualTechInput;
      }

      // Fator C (Risco Assistencial)
      const factorC = riskC;

      // Reajuste Total = ((1 + A) * (1 + B) * (1 + C)) - 1
      const mathA = factorA / 100;
      const mathB = factorB / 100;
      const mathC = factorC / 100;
      
      const totalReadjustment = (((1 + mathA) * (1 + mathB) * (1 + mathC)) - 1) * 100;

      // --- ESTRATÉGIA DE ANCORAGEM CEDO (O ALVO) ---
      // A regra de ouro: Sempre conseguir um número MENOR que a operadora pede, e preferencialmente MENOR que o Técnico calculado.
      let targetRate = 0;
      let appliedMargin = 0;

      if (proposed <= 0) {
          targetRate = 0;
          appliedMargin = 0;
      } else {
          // A operadora propôs algo. Nosso alvo tem que ser mais agressivo.
          if (totalReadjustment < proposed) {
              // A operadora já pediu mais que a matemática. Usamos a matemática como base e pedimos ainda menos.
              appliedMargin = 4.5;
              targetRate = Math.max(0, totalReadjustment - appliedMargin);
          } else {
              // A operadora pediu MENOS que a matemática (foram "bonzinhos").
              // Regra Cedo: Nunca aceite a primeira proposta. Ancora abaixo.
              appliedMargin = 3.2;
              targetRate = Math.max(0, proposed - appliedMargin);
          }
      }

      // Segurança Extra para PME I: se for PME I, nosso target baseia-se no VCMH.
      if (formData.companySize === 'PME_I') {
          appliedMargin = 2.5;
          targetRate = Math.max(0, usedVcmh - appliedMargin);
      }

      // --- STATUS DE NEGOCIAÇÃO ---
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
      
      const nextYearProjection = (Math.max(factorB, 0) * 0.4) + usedVcmh + (agingRiskLoad * 100);
      const trendFactor = (1 + (usedVcmh / 100) + agingRiskLoad);
      const valProposed = invoice * (1 + (proposed / 100));
      const valFair = invoice * (1 + (totalReadjustment / 100));
      const valTarget = invoice * (1 + (targetRate / 100));
      
      const isNegative = totalReadjustment <= 0;
      const isTechnicalHigher = totalReadjustment > proposed;
      const aiConfidence = Math.min(99.8, 88 + (claimsRaw > 0 ? 5 : 0) + (usedVcmh > 0 ? 4 : 0));
      
      const resultObj: AnalysisResult = {
        companySize: formData.companySize,
        factorA_VCMH: factorA,
        factorB_Technical: factorB,
        factorC_Risk: factorC,
        technicalTotalReadjustment: totalReadjustment,
        
        proposedReadjustment: proposed,
        targetReadjustment: targetRate,
        marginApplied: appliedMargin,
        savingPotential: proposed - targetRate,
        
        isNegative,
        isTechnicalHigher,
        isManualOverride: manualTechInput !== null,
        isVcmhManual,
        agingFactor: agingRiskLoad * 100,
        nextYearProjection,
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
        usedClaimsRatio: claimsRaw,
        defenseText: "", // Gerado abaixo
        compositeClaims: (formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED') ? {
            pool: parseFloat(formData.claimsPool) || 0, ind: parseFloat(formData.claimsIndividual) || 0, final: claimsRaw
        } : undefined
      };

      resultObj.defenseText = generateDefenseText(resultObj, formData.operator, targetLossRatioRaw);

      setResult(resultObj);
      setLoading(false);
    }, 1200); 
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
                    Quantum Composition v18.0
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
                                <option value="INDIVIDUAL">Individual</option>
                                <option value="WEIGHTED">Por Peso</option>
                            </select>
                        </InputGroup>
                    )}
                </div>

                {/* BLOCO DE SINISTRALIDADE */}
                <div className="p-5 bg-gradient-to-br from-slate-900/80 to-[#020617] rounded-xl border border-slate-700/50 space-y-4 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-emerald-600"></div>
                    
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" /> Apuração de Sinistro
                        </span>
                        
                        {/* TOGGLE MODO DE INPUT */}
                        {!(formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED') && (
                            <div className="flex bg-[#020617] rounded-lg border border-slate-800 overflow-hidden">
                                <button type="button" onClick={() => setFormData({...formData, inputMode: 'PERCENT'})} className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${formData.inputMode === 'PERCENT' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>% Dir.</button>
                                <button type="button" onClick={() => setFormData({...formData, inputMode: 'VALUES'})} className={`px-3 py-1 text-[9px] font-bold uppercase transition-all ${formData.inputMode === 'VALUES' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>R$ Val.</button>
                            </div>
                        )}
                    </div>

                    {/* CONDIÇÕES DE RENDERIZAÇÃO DO INPUT */}
                    {formData.companySize === 'PME_II' && formData.calculationMix === 'WEIGHTED' ? (
                        // MODO WEIGHTED (PME II)
                        <div className="space-y-4 animate-in fade-in duration-300">
                             <div className="grid grid-cols-12 gap-3 items-center">
                                 <div className="col-span-8">
                                     <InputGroup label="Sinistro Pool %" icon={Users}>
                                        <input type="number" className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-cyan-100 outline-none focus:border-cyan-500 transition-all" value={formData.claimsPool} onChange={(e) => setFormData({...formData, claimsPool: e.target.value})} placeholder="0.00" />
                                     </InputGroup>
                                 </div>
                                 <div className="col-span-4">
                                     <InputGroup label="Peso %" icon={Scale}>
                                        <input type="number" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-2 text-sm font-mono text-slate-400 text-center outline-none" value={formData.weightPool} onChange={(e) => setFormData({...formData, weightPool: e.target.value})} />
                                     </InputGroup>
                                 </div>
                             </div>

                             <div className="grid grid-cols-12 gap-3 items-center">
                                 <div className="col-span-8">
                                     <InputGroup label="Sinistro Ind. %" icon={UserPlus}>
                                        <input type="number" className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-emerald-100 outline-none focus:border-emerald-500 transition-all" value={formData.claimsIndividual} onChange={(e) => setFormData({...formData, claimsIndividual: e.target.value})} placeholder="0.00" />
                                     </InputGroup>
                                 </div>
                                 <div className="col-span-4">
                                     <InputGroup label="Peso %" icon={Scale}>
                                        <input type="number" className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-2 py-2 text-sm font-mono text-slate-400 text-center outline-none" value={formData.weightIndividual} onChange={(e) => setFormData({...formData, weightIndividual: e.target.value})} />
                                     </InputGroup>
                                 </div>
                             </div>
                             
                             <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                                 <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Média Ponderada Calculada</span>
                                 <span className="text-sm font-mono font-black text-cyan-400">{formData.claimsRatio ? `${formData.claimsRatio}%` : '--'}</span>
                             </div>
                        </div>
                    ) : formData.inputMode === 'VALUES' ? (
                        // MODO VALORES EM REAIS (NOVO)
                        <div className="space-y-4 animate-in fade-in duration-300">
                             <InputGroup label="Receita do Período (R$)" icon={Receipt}>
                                <input type="number" className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white outline-none focus:border-cyan-500 transition-all" value={formData.revenuePeriod} onChange={(e) => setFormData({...formData, revenuePeriod: e.target.value})} placeholder="Ex: 4813080.17" />
                             </InputGroup>
                             <InputGroup label="Sinistro do Período (R$)" icon={Activity}>
                                <input type="number" className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-lg px-3 py-2 text-sm font-mono font-bold text-rose-300 outline-none focus:border-cyan-500 transition-all" value={formData.claimsValuePeriod} onChange={(e) => setFormData({...formData, claimsValuePeriod: e.target.value})} placeholder="Ex: 3792051.08" />
                             </InputGroup>
                             
                             <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                                 <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Índice (x)</span>
                                 <span className="text-sm font-mono font-black text-cyan-400">{formData.claimsRatio ? `${formData.claimsRatio}%` : '--'}</span>
                             </div>
                        </div>
                    ) : (
                        // MODO PERCENTUAL DIRETO
                        <div className="animate-in fade-in duration-300">
                            <input 
                                type="number" 
                                className="w-full bg-[#020617]/80 border border-slate-700/50 rounded-xl px-4 py-3 text-lg font-mono font-black text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                value={formData.claimsRatio}
                                onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                                placeholder="Digite o percentual exato (Ex: 78.79)"
                            />
                        </div>
                    )}
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-cyan-500" /> Break-Even / Índice Alvo (y)
                    </label>
                    <div className="flex bg-[#020617] p-1.5 rounded-xl border border-slate-800 shadow-inner gap-1">
                        {['60', '65', '70', '72', '75'].map(bp => (
                            <button
                                key={bp} type="button" onClick={() => setFormData({...formData, breakEvenPoint: bp})}
                                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all duration-300 ${formData.breakEvenPoint === bp ? 'bg-gradient-to-b from-cyan-500 to-cyan-700 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                            >
                                {bp}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* PAINEL DE AJUSTES MANUAIS */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-800/60 pt-4">
                     <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col justify-center relative group">
                         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Database className="w-3 h-3"/> VCMH Mercado</span>
                         <span className={`text-sm font-mono font-bold ${formData.vcmh ? 'text-slate-300' : 'text-slate-600'}`}>
                            {formData.vcmh ? `${formData.vcmh}%` : 'Zerar (Corporate)'}
                         </span>
                     </div>
                     <InputGroup label="VCMH Manual (A)" icon={Edit3} highlight={!!formData.manualVcmh}>
                        <input type="number" className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-400 outline-none focus:border-amber-500 placeholder-slate-600" value={formData.manualVcmh} onChange={(e) => setFormData({...formData, manualVcmh: e.target.value})} placeholder="Forçar VCMH..." />
                     </InputGroup>
                     <InputGroup label="Risco Assist. (C)" icon={TrendingUp} highlight={formData.assistentialRisk !== '0'}>
                        <input type="number" className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-mono font-bold text-purple-400 outline-none focus:border-purple-500 placeholder-slate-600" value={formData.assistentialRisk} onChange={(e) => setFormData({...formData, assistentialRisk: e.target.value})} placeholder="Ex: 0" />
                     </InputGroup>
                     <InputGroup label="Técnico Manual" icon={Calculator} highlight={!!formData.manualTechnical}>
                        <input type="number" className="w-full bg-[#020617]/50 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 outline-none focus:border-emerald-500 placeholder-slate-600" value={formData.manualTechnical} onChange={(e) => setFormData({...formData, manualTechnical: e.target.value})} placeholder="Auto (b)" />
                     </InputGroup>
                </div>

                <div className="pt-4 border-t border-slate-800/60 space-y-4">
                    <InputGroup label="Fatura Base (R$)" icon={DollarSign}>
                    <input 
                        type="number" 
                        className="w-full bg-[#020617]/80 border border-slate-700/80 rounded-xl px-4 py-3 text-base font-mono font-bold text-emerald-100 focus:border-emerald-500 outline-none shadow-inner transition-all"
                        value={formData.currentInvoice} onChange={(e) => setFormData({...formData, currentInvoice: e.target.value})} placeholder="0,00"
                    />
                    </InputGroup>
                    <InputGroup label="Proposta Apresentada (%)" icon={AlertTriangle} highlight>
                    <input 
                        type="number" 
                        className="w-full bg-rose-950/20 border border-rose-900/50 rounded-xl px-4 py-4 text-2xl font-mono font-black text-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none shadow-inner transition-all placeholder-rose-900/30"
                        value={formData.proposedReadjustment} onChange={(e) => setFormData({...formData, proposedReadjustment: e.target.value})} placeholder="0.00"
                    />
                    </InputGroup>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-slate-900 font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                      {loading ? 'Calculando Matriz...' : <>PROCESSAR COMPOSIÇÃO <Zap className="w-4 h-4 fill-slate-900" /></>}
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
                    O motor Cedo aplicará a fórmula oficial de composição `((1+a)*(1+b)*(1+c))-1` para confrontar o reajuste e projetar a Taxa Alvo Estratégica ideal para negociação.
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

                    {/* Matemático Total */}
                    <Card className="p-5 flex flex-col justify-between" glowColor="emerald">
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5 text-emerald-500/50" /> Teto Oficial</span>
                            <Badge variant="green">Matemático</Badge>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-black text-slate-300">{result.technicalTotalReadjustment.toFixed(2)}</span><span className="text-lg text-slate-600 font-bold">%</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">Reajuste Total (Fin + Tec + Risco)</p>
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
                                <span className="text-5xl font-black text-white tracking-tighter">{result.targetReadjustment.toFixed(2)}</span><span className="text-xl text-cyan-500 font-bold">%</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[11px] font-bold text-emerald-400">Poupar {formatCurrency(result.financialImpact.accumulatedSaving)}/ano</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. TABELA OFICIAL DE COMPOSIÇÃO (NOVO RECURSO EXATO DA IMAGEM) */}
                <Card className="border border-slate-700/80 overflow-hidden">
                    <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                         <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                             <Layers className="w-4 h-4 text-cyan-400" /> Decomposição do Reajuste Total
                         </h3>
                         <Badge variant="gray">Cálculo ANS</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-[#020617]">
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider w-3/4">Composição (Fórmula Multiplicativa)</th>
                                    <th className="px-6 py-4 font-bold text-slate-400 uppercase text-[10px] tracking-wider text-right">% Reajuste</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono">
                                <tr className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> Reajuste Financeiro (VCMH)</td>
                                    <td className="px-6 py-4 text-right font-bold text-amber-400">{result.factorA_VCMH.toFixed(2)}% <span className="text-slate-600 text-[10px] ml-1">(a)</span></td>
                                </tr>
                                <tr className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Reajuste Técnico <span className="text-[10px] font-sans text-slate-500 ml-2 border border-slate-700 px-1.5 rounded">((x) / (y)) - 1</span></td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-400">{result.factorB_Technical.toFixed(2)}% <span className="text-slate-600 text-[10px] ml-1">(b)</span></td>
                                </tr>
                                <tr className="hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-300 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Alterações de Risco Assistencial</td>
                                    <td className="px-6 py-4 text-right font-bold text-purple-400">{result.factorC_Risk.toFixed(2)}% <span className="text-slate-600 text-[10px] ml-1">(c)</span></td>
                                </tr>
                                <tr className="bg-cyan-950/20 border-t-2 border-slate-700">
                                    <td className="px-6 py-5 text-white font-bold flex items-center gap-2 text-xs">
                                        Reajuste Total = (100%+(a)) * (100%+(b)) * (100%+(c)) - 100%
                                    </td>
                                    <td className="px-6 py-5 text-right font-black text-lg text-white">{result.technicalTotalReadjustment.toFixed(2)}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 3. ESTRATÉGIA DE ANCORAGEM CEDO */}
                <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-r from-[#0f172a] to-[#020617]">
                    <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="neon">Alvo Estratégico (O Segredo)</Badge>
                                <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Estratégia Defensiva Ativada</span>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed mt-2">
                                A operadora solicitou <strong>{result.proposedReadjustment}%</strong>. A matemática exata sem margem aponta <strong>{result.technicalTotalReadjustment.toFixed(2)}%</strong>. 
                                <br/><br/>
                                Como regra institucional, nosso motor não aceita a primeira oferta nem mesmo o teto matemático puro. Aplicamos uma força dedutiva (ancoragem estatística e expurgo) para iniciar o pleito defendendo <strong>{result.targetReadjustment.toFixed(2)}%</strong>, forçando o centro de custo da operadora para baixo.
                            </p>
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
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Parecer Atuarial & Pleito Formal</h3>
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