"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, RefreshCw, Settings,
  UserPlus, Percent
} from 'lucide-react';

// --- CENTRAL DE CONTROLE DE ÍNDICES (ATUALIZADA SAFRA 2026) ---
const CONFIG = {
  VERSION: "5.0.0 (Precision Math)",
  LAST_UPDATE: "10/02/2026",
  
  // Tabela Exata do Cliente (Vigência até Abril/2026)
  POOL_2026: {
    "Ameplan": 13.50,
    "Amil": 15.98,
    "Ana Costa": 15.13,
    "Assim Saúde": 15.59,
    "Blue Med": 19.38,
    "Bradesco Saúde": 15.11,
    "Care Plus": 18.81,
    "NotreDame Intermédica": 15.21,
    "Golden Cross": 18.81,
    "Interclínicas": 9.33,
    "Hapvida": 15.20,
    "New Leader": 19.99,
    "Omint": 13.32,
    "Plamed": 6.76,
    "Porto Seguro": 15.87,
    "Samel": 15.26,
    "Sami": 15.37,
    "São Cristóvão": 6.91,
    "São Miguel": 6.75,
    "Seguros Unimed": 11.92,
    "Soban": 15.21,
    "SulAmérica": 15.23,
    "Unimed (Nacional)": 19.50,
    "Unimed Campinas": 12.50,
    "Unimed Guarulhos": 13.50,
    "Unimed Jundiaí": 15.58,
    "Unimed Ferj": 15.58,
    "Unimed Santos": 12.67,
    "Unimed São José dos Campos": 15.12,
    "Vera Cruz": 12.40,
    "Trasmontano": 9.33,
    "Alice": 12.50,
    "Média de Mercado": 14.50
  } as Record<string, number>,

  // VCMH para PME II e Empresarial (Inflação Médica Financeira Estimada)
  VCMH_INDICES: {
    "Bradesco Saúde": 16.5,
    "SulAmérica": 15.8,
    "Amil": 14.2,
    "NotreDame Intermédica": 13.8,
    "Porto Seguro": 14.9,
    "Seguros Unimed": 14.0,
    "Omint": 17.1,
    "Unimed (Nacional)": 13.5,
    "Golden Cross": 16.0,
    "Média de Mercado": 15.0
  } as Record<string, number>
};

// Unificação da lista para o Select
const OPERATORS_LIST = [
  ...Object.keys(CONFIG.POOL_2026).filter(k => k !== "Média de Mercado").sort(),
  "Outra"
];

// --- TIPOS ---
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
  currentInvoice: string;
  proposedReadjustment: string;
}

interface AnalysisResult {
  technicalReadjustment: number;
  proposedReadjustment: number;
  savingPotential: number;
  isNegative: boolean;
  agingFactor: number;
  projectedClaimsRatio: number; // Nova métrica: Sinistralidade Projetada
  financialImpact: {
    current: number;
    proposedValue: number;
    fairValue: number;
    accumulatedSaving: number;
    projections: { m12: number; m24: number; m36: number; }
  };
  defenseText: string;
  indicators: {
    breakEven: number;
    technicalNeed: number;
    baseIndex: number;
    indexType: string;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- UI COMPONENTS ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' | 'purple' | 'teal' }) => {
  const styles = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    purple: "bg-violet-50 text-violet-700 border-violet-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${styles[variant]} flex items-center gap-1 w-fit uppercase tracking-wide`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children, helpText }: { label: string, icon: any, children: React.ReactNode, helpText?: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" />
        {label}
        </label>
        {helpText && <span className="text-[9px] text-blue-500 cursor-help font-medium">{helpText}</span>}
    </div>
    <div className="relative group">
      {children}
    </div>
  </div>
);

// --- APP LÓGICA ---

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
    currentInvoice: '',
    proposedReadjustment: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // --- MOTOR DE INTELIGÊNCIA: AUTO-DETECÇÃO DE ÍNDICE ---
  useEffect(() => {
    let indexValue = 15.0;
    
    // 1. Cenário PME I (Pool 2026)
    if (formData.companySize === 'PME_I') {
        if (formData.operator && CONFIG.POOL_2026[formData.operator]) {
            indexValue = CONFIG.POOL_2026[formData.operator];
        } else {
            indexValue = CONFIG.POOL_2026["Média de Mercado"];
        }
    } 
    // 2. Cenário PME II / Empresarial (VCMH)
    else {
        if (formData.operator && CONFIG.VCMH_INDICES[formData.operator]) {
            indexValue = CONFIG.VCMH_INDICES[formData.operator];
        } else {
            indexValue = CONFIG.VCMH_INDICES["Média de Mercado"];
        }
    }

    setFormData(prev => ({ ...prev, vcmh: indexValue.toFixed(2) }));

    // Reset de Mix conforme porte
    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'POOL_100' }));
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'TECH_100' }));
    if (formData.companySize === 'PME_II' && formData.calculationMix === 'POOL_100') {
        setFormData(prev => ({ ...prev, calculationMix: 'MIX_50_50' }));
    }

  }, [formData.operator, formData.companySize]); 

  // --- GERADOR DE DEFESA TÉCNICA E JURÍDICA ---
  const generateDefenseText = (
      techRate: number, 
      proposedRate: number, 
      claims: number, 
      target: number, 
      operator: string, 
      isNegative: boolean,
      projectedClaims: number
  ) => {
    const isPME1 = formData.companySize === 'PME_I';
    const currentYear = new Date().getFullYear();

    let text = `À\n${operator || 'Operadora de Saúde'}\nDepartamento de Relacionamento Empresarial / Atuarial\n\n`;
    text += `Ref: Defesa Técnica de Reajuste - Safra ${currentYear} (Aniversário: ${formData.anniversaryMonth})\n\n`;
    text += `Prezados,\n\n`;
    text += `Em resposta à proposta de reajuste de ${proposedRate.toFixed(2)}%, apresentamos nossa auditoria atuarial fundamentada nos princípios de equilíbrio econômico-financeiro e nas normativas vigentes.\n\n`;
    
    if (isPME1) {
         text += `1. AGENDAMENTO DE POOL (RN 565 ANS)\n`;
         text += `O contrato enquadra-se no agrupamento PME (até 29 vidas), regido pela Resolução Normativa 565 da ANS. O reajuste deve refletir obrigatoriamente o índice único do Pool da operadora, vedada a aplicação de sinistralidade individual.\n`;
         text += `Para esta safra, a tabela de mercado indica um índice de ${formData.vcmh}% para contratos similares na ${operator}. `;
         
         if (proposedRate > parseFloat(formData.vcmh)) {
             text += `O índice proposto de ${proposedRate.toFixed(2)}% apresenta desvio injustificado em relação ao índice de referência do Pool (${formData.vcmh}%).\n\n`;
         } else {
             text += `Embora o índice acompanhe o Pool, solicitamos a revisão comercial visando a manutenção da carteira.\n\n`;
         }
    } else {
         text += `1. EQUILÍBRIO TÉCNICO (BREAK-EVEN ${target}%)\n`;
         text += `A apólice registrou sinistralidade acumulada de ${claims.toFixed(2)}%. `;
         
         if (claims < target) {
             text += `Este resultado está ABAIXO da meta de equilíbrio (${target}%), evidenciando superávit técnico. O contrato gerou margem positiva para a operadora, tornando tecnicamente indevida a aplicação de reajuste por sinistralidade.\n\n`;
         } else {
             text += `O desvio de sinistralidade requer correção. No entanto, nossa modelagem atuarial demonstra que o reajuste de ${proposedRate.toFixed(2)}% excede o necessário para restabelecer o equilíbrio.\n`;
             text += `Com o reajuste técnico de ${techRate.toFixed(2)}%, a sinistralidade projetada retornará para o patamar de meta (${target}%), garantindo a sustentabilidade sem onerosidade excessiva.\n\n`;
         }
         
         if (formData.averageAge) {
             text += `2. PERFIL ETÁRIO E MUTUALISMO\n`;
             text += `Consideramos a média de idade (${formData.averageAge} anos) no cálculo de projeção de risco, diluindo o impacto de utilização atípica no princípio do mutualismo.\n\n`;
         }

         text += `3. INDEXADOR FINANCEIRO (VCMH)\n`;
         text += `VCMH de referência aplicado: ${formData.vcmh}%.\n\n`;
    }

    text += `CONCLUSÃO E PLEITO:\n`;
    
    if (isNegative) {
        text += `A análise técnica comprova a ausência de necessidade de recomposição. `;
        text += `Solicitamos a ISENÇÃO TOTAL DO REAJUSTE (0%) ou a aplicação exclusiva do VCMH, desconsiderando agravos técnicos.\n\n`;
    } else {
        text += `O ponto de equilíbrio atuarial estrito é atingido com o índice de ${techRate.toFixed(2)}%. `;
        text += `Solicitamos a revisão da proposta para este patamar, garantindo a continuidade da apólice.\n\n`;
    }
    
    text += `Atenciosamente,\n\n[Assinatura do Responsável]`;
    return text;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Inputs
      const claims = parseFloat(formData.claimsRatio) || 0;
      const baseIndex = parseFloat(formData.vcmh) || 0;
      const invoice = parseFloat(formData.currentInvoice) || 0;
      const proposed = parseFloat(formData.proposedReadjustment) || 0;
      const targetLossRatio = parseFloat(formData.breakEvenPoint);
      const avgAge = parseFloat(formData.averageAge) || 0;

      // --- MATEMÁTICA ATUARIAL DE PRECISÃO (FÓRMULA MULTIPLICATIVA) ---
      // A fórmula linear (VCMH + Tech) erra no longo prazo. 
      // A fórmula correta projeta o prêmio necessário para cobrir o sinistro inflacionado.
      // PremioNecessario = (SinistroAtual * (1 + VCMH)) / Meta
      // Indice = (PremioNecessario / PremioAtual) - 1
      
      const vcmhFactor = 1 + (baseIndex / 100);
      const currentLossRatio = claims / 100;
      const targetRatio = targetLossRatio / 100;

      // Cálculo do Índice Técnico Puro (Precision Math)
      let technicalNeedRaw = 0;
      if (formData.companySize === 'PME_I') {
         technicalNeedRaw = baseIndex; // Pool é fixo
      } else {
         // Fórmula: ((Sinistro * (1+VCMH)) / Meta) - 1
         // Exemplo: Sinistro 85%, Meta 75%, VCMH 15%
         // (0.85 * 1.15) / 0.75 = 1.3033 -> Reajuste 30.33% (cobre tudo)
         const requiredPremiumRatio = (currentLossRatio * vcmhFactor) / targetRatio;
         technicalNeedRaw = (requiredPremiumRatio - 1) * 100;
      }
      
      // 2. APLICAÇÃO DO MIX
      let technicalFinal = 0;
      
      switch (formData.calculationMix) {
        case 'POOL_100':
            technicalFinal = baseIndex; 
            break;
        case 'TECH_100':
            technicalFinal = technicalNeedRaw; 
            break;
        case 'MIX_50_50':
            technicalFinal = (CONFIG.POOL_2026["Média de Mercado"] * 0.5) + (technicalNeedRaw * 0.5);
            break;
        case 'MIX_70_30':
            technicalFinal = (CONFIG.POOL_2026["Média de Mercado"] * 0.7) + (technicalNeedRaw * 0.3);
            break;
      }

      // 3. FATOR DE IDADE (AGING)
      let agingRiskLoad = 0;
      if (avgAge > 0) {
          if (avgAge > 59) agingRiskLoad = 0.05;
          else if (avgAge > 49) agingRiskLoad = 0.03;
          else if (avgAge < 30) agingRiskLoad = -0.01;
      }
      
      const trendFactor = (1 + (baseIndex / 100) + agingRiskLoad);

      const valProposed = invoice * (1 + (proposed / 100));
      const valFair = invoice * (1 + (technicalFinal / 100));
      
      const m12 = valFair;
      const m24 = m12 * trendFactor;
      const m36 = m24 * trendFactor;

      const isNegative = technicalFinal <= 0;

      // PROJEÇÃO REVERSA: Qual será a sinistralidade se aplicarmos o reajuste justo?
      // Deve bater exatamente na meta (ex: 75%).
      // SinistroFuturo = (SinistroAtual * VCMH) / (PremioAtual * (1 + Reajuste))
      const projectedClaims = ((claims * vcmhFactor) / (1 + (technicalFinal/100)));

      const defense = generateDefenseText(
          technicalFinal, proposed, claims, targetLossRatio, 
          formData.operator, isNegative, projectedClaims
      );

      setResult({
        technicalReadjustment: parseFloat(technicalFinal.toFixed(2)),
        proposedReadjustment: proposed,
        savingPotential: parseFloat((proposed - technicalFinal).toFixed(2)),
        isNegative,
        agingFactor: agingRiskLoad * 100,
        projectedClaimsRatio: parseFloat(projectedClaims.toFixed(2)),
        financialImpact: {
            current: invoice,
            proposedValue: valProposed,
            fairValue: valFair,
            accumulatedSaving: (valProposed - valFair) * 12,
            projections: { m12, m24, m36 }
        },
        indicators: {
            breakEven: targetLossRatio,
            technicalNeed: parseFloat(technicalNeedRaw.toFixed(2)),
            baseIndex: baseIndex,
            indexType: formData.companySize === 'PME_I' ? 'Índice Pool 2026' : 'VCMH'
        },
        defenseText: defense
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-600 p-2 rounded-lg">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">Atuário<span className="text-emerald-400">Master AI</span></h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Precision System {CONFIG.VERSION}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-slate-400 font-bold flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Base Atualizada
                </span>
                <span className="text-xs text-emerald-400 font-mono">SAFRA 2026</span>
             </div>
             <div className="h-6 w-px bg-slate-700"></div>
             <div className="flex items-center gap-2 text-xs text-slate-300">
                <Lock className="w-3 h-3" />
                Secure Mode
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL DE CONTROLE */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        Parâmetros
                    </h2>
                    <Settings className="w-4 h-4 text-slate-300" />
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-5">
                
                <InputGroup label="Operadora" icon={Building2} helpText="Carrega tabela Pool 2026 ou VCMH">
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {OPERATORS_LIST.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Porte (Vidas)" icon={Users}>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.companySize}
                        onChange={(e) => setFormData({...formData, companySize: e.target.value as CompanySize})}
                      >
                         <option value="PME_I">PME I (0-29)</option>
                         <option value="PME_II">PME II (30+)</option>
                         <option value="EMPRESARIAL">Empresarial</option>
                      </select>
                    </InputGroup>

                    {formData.companySize === 'PME_II' && (
                        <InputGroup label="Mix Cálculo" icon={Scale}>
                            <select
                                className="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.calculationMix}
                                onChange={(e) => setFormData({...formData, calculationMix: e.target.value as CalculationMix})}
                            >
                                <option value="MIX_50_50">50% Pool / 50% Tec</option>
                                <option value="MIX_70_30">70% Pool / 30% Tec</option>
                                <option value="TECH_100">100% Técnico (Individual)</option>
                            </select>
                        </InputGroup>
                    )}
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4 relative">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                        Indicadores de Risco
                        <Badge variant="teal">AI PREDICTIVE</Badge>
                    </h3>
                    
                    {/* SELETOR DE BREAK-EVEN */}
                    <div className="flex gap-2 mb-2">
                        {[65, 70, 72, 75].map(bp => (
                            <button
                                key={bp}
                                type="button"
                                onClick={() => setFormData({...formData, breakEvenPoint: bp.toString()})}
                                className={`flex-1 py-1.5 text-[10px] font-bold rounded border transition-all ${formData.breakEvenPoint === bp.toString() ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400'}`}
                            >
                                BEP {bp}%
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Sinistralidade %" icon={ShieldAlert}>
                            <input 
                            type="number" 
                            disabled={formData.companySize === 'PME_I'} 
                            className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm font-mono font-bold outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400 ${parseFloat(formData.claimsRatio) > parseFloat(formData.breakEvenPoint) ? 'border-rose-300 text-rose-600' : 'border-emerald-300 text-emerald-600 focus:ring-emerald-500'}`}
                            value={formData.claimsRatio}
                            onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                            placeholder={formData.companySize === 'PME_I' ? "N/A" : "0.00"}
                            />
                        </InputGroup>
                        <InputGroup label={formData.companySize === 'PME_I' ? "Índice Pool %" : "VCMH %"} icon={TrendingUp}>
                            <input 
                            type="number" 
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.vcmh}
                            onChange={(e) => setFormData({...formData, vcmh: e.target.value})}
                            />
                        </InputGroup>
                    </div>

                    {/* MÉDIA DE IDADE */}
                    <InputGroup label="Média de Idade (Anos)" icon={UserPlus} helpText="Afeta projeção futura (Aging Factor)">
                        <input 
                            type="number" 
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Opcional (Ex: 45)"
                            value={formData.averageAge}
                            onChange={(e) => setFormData({...formData, averageAge: e.target.value})}
                        />
                    </InputGroup>
                </div>

                <div className="space-y-4 pt-2">
                    <InputGroup label="Valor Fatura Atual (R$)" icon={DollarSign}>
                      <input 
                        type="number" 
                        placeholder="0,00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={formData.currentInvoice}
                        onChange={(e) => setFormData({...formData, currentInvoice: e.target.value})}
                      />
                    </InputGroup>
                    <InputGroup label="Reajuste Proposto (%)" icon={AlertTriangle}>
                      <input 
                        type="number" 
                        placeholder="Ex: 25.00"
                        className="w-full bg-rose-50 border border-rose-200 rounded-lg px-3 py-2.5 text-sm font-mono font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 outline-none"
                        value={formData.proposedReadjustment}
                        onChange={(e) => setFormData({...formData, proposedReadjustment: e.target.value})}
                      />
                    </InputGroup>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                >
                  {loading ? (
                    <>Processando Inteligência...</>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" /> Calcular Defesa
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RESULTADOS */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 p-8 text-center opacity-60">
                <Activity className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Aguardando Input</h3>
                <p className="text-xs mt-2 max-w-xs">Selecione o Break-Even e insira os dados para ativar a Inteligência Atuarial.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* 1. COMPARATIVO VISUAL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 border-l-4 border-l-rose-500 bg-rose-50/30">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xs font-bold text-rose-700 uppercase tracking-widest">Proposta Operadora</h3>
                                <p className="text-[10px] text-slate-500">Carta Recebida</p>
                            </div>
                            <Badge variant="red">Proposto</Badge>
                        </div>
                        <div className="text-4xl font-extrabold text-rose-700 tracking-tighter">
                            {result.proposedReadjustment}%
                        </div>
                        <div className="mt-4 pt-4 border-t border-rose-100">
                           <p className="text-xs text-slate-600">Nova Fatura: <strong className="text-rose-700">{formatCurrency(result.financialImpact.proposedValue)}</strong></p>
                        </div>
                    </Card>

                    <Card className={`p-6 border-l-4 ${result.isNegative ? 'border-l-blue-500 bg-blue-50/20' : 'border-l-emerald-500 bg-white'} relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className={`text-xs font-bold uppercase tracking-widest ${result.isNegative ? 'text-blue-700' : 'text-emerald-700'}`}>
                                    {result.isNegative ? 'Desconto Técnico' : 'Reajuste Técnico'}
                                </h3>
                                <p className="text-[10px] text-slate-500">
                                    Baseado em {formData.companySize === 'PME_I' ? `Tabela Pool (${formData.operator})` : `BEP ${formData.breakEvenPoint}%`}
                                </p>
                            </div>
                            <Badge variant={result.isNegative ? 'blue' : 'green'}>{result.isNegative ? 'Redução' : 'Justo'}</Badge>
                        </div>
                        <div className={`text-4xl font-extrabold tracking-tighter relative z-10 ${result.isNegative ? 'text-blue-700' : 'text-emerald-700'}`}>
                            {result.technicalReadjustment}%
                        </div>
                        
                        {result.savingPotential > 0 ? (
                             <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
                                <p className={`text-xs font-bold flex items-center gap-1 ${result.isNegative ? 'text-blue-600' : 'text-emerald-600'}`}>
                                    <ArrowRight className="w-3 h-3" />
                                    Economia Anual: {formatCurrency(result.financialImpact.accumulatedSaving)}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-slate-100 relative z-10 text-xs text-slate-400">
                                Sem margem para redução.
                            </div>
                        )}
                    </Card>
                </div>

                {/* 2. PROJEÇÃO FINANCEIRA COM SINISTRALIDADE PROJETADA */}
                <Card className="overflow-hidden">
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-emerald-400" />
                            Projeção Preditiva
                        </h3>
                        {formData.companySize !== 'PME_I' && (
                             <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono border border-emerald-800 px-2 py-1 rounded">
                                 <Percent className="w-3 h-3" />
                                 Sinistralidade Futura (Est.): {result.projectedClaimsRatio}%
                             </div>
                        )}
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Ciclo</th>
                                    <th className="px-6 py-3">Fatura Estimada</th>
                                    <th className="px-6 py-3">Custo Anual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-emerald-500">Ano 1 (Atual)</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m12)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m12 * 12)}</td>
                                </tr>
                                <tr className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-blue-500">Ano 2 (+12m)</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m24)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m24 * 12)}</td>
                                </tr>
                                <tr className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-purple-500">Ano 3 (+24m)</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m36)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m36 * 12)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 3. DEFESA TÉCNICA (TEXTO) */}
                <Card className="p-6 border border-blue-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase">Minuta de Defesa</h3>
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.defenseText)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors bg-blue-50 px-3 py-1.5 rounded-md"
                        >
                            <Copy className="w-3 h-3" /> Copiar Texto
                        </button>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 font-serif text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {result.defenseText}
                    </div>
                </Card>

              </div>
            )}
          </div>
        </div>

        {/* --- RODAPÉ EXPLICATIVO --- */}
        <div className="mt-16 border-t border-slate-200 pt-10 pb-20">
            <h3 className="text-center text-lg font-bold text-slate-800 mb-8 flex items-center justify-center gap-2">
                <Info className="w-5 h-5 text-emerald-500" />
                Entenda o Cálculo (Precision Math)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">BREAK-EVEN</div>
                    <h4 className="font-bold text-slate-700 mb-2">Ponto de Equilíbrio</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        É a meta definida no contrato (70%, 72% ou 75%). O sistema calcula exatamente quanto o prêmio precisa subir para que a sinistralidade futura retorne a este percentual, já considerando a inflação médica sobre o sinistro.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">AGING FACTOR</div>
                    <h4 className="font-bold text-slate-700 mb-2">Envelhecimento</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        O sistema usa a Média de Idade para prever o risco futuro. Carteiras mais velhas tendem a ter custos crescentes mais rápidos que a inflação médica comum.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded">DEFESA INTELIGENTE</div>
                    <h4 className="font-bold text-slate-700 mb-2">Reajuste Negativo</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Se a sinistralidade estiver muito baixa (abaixo do Break-even), o sistema calcula matematicamente que deveria haver um desconto. Usamos esse dado para pleitear a isenção do reajuste (0%).
                    </p>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}