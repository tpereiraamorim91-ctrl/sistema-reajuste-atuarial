"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale, Info, HelpCircle
} from 'lucide-react';

// --- TIPOS ---
type CompanySize = 'PME_I' | 'PME_II' | 'EMPRESARIAL';
type CalculationMix = 'POOL_100' | 'MIX_50_50' | 'MIX_70_30' | 'TECH_100';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  calculationMix: CalculationMix;
  claimsRatio: string;
  vcmh: string; // Agora dinâmico
  currentInvoice: string;
  proposedReadjustment: string;
}

interface AnalysisResult {
  technicalReadjustment: number;
  proposedReadjustment: number;
  savingPotential: number;
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
    poolRate: number;
  };
}

// --- BANCO DE DADOS DE VCMH/INFLAÇÃO (INTELIGÊNCIA DE MERCADO) ---
// Valores estimados de VCMH Mercado para 2025/2026
const OPERATOR_INDICES: Record<string, number> = {
  "Bradesco Saúde": 16.5,
  "SulAmérica": 15.8,
  "Amil": 14.2,
  "Unimed (Nacional)": 13.5,
  "NotreDame Intermédica": 12.8,
  "Porto Seguro": 14.9,
  "Sompo Saúde": 15.2,
  "Omint": 17.1,
  "Prevent Senior": 11.5,
  "Allianz": 15.5,
  "Seguros Unimed": 14.0,
  "Golden Cross": 16.0,
  "QSaúde": 13.0,
  "Alice": 12.5,
  "Outra": 15.0 // Média geral
};

const ANS_POOL_LIMIT = 6.91; // Referência ANS PF (apenas para comparação ou PME I muito pequeno)
const POOL_MARKET_AVG = 13.5; // Média real de Pools de mercado PME

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- UI COMPONENTS ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' | 'purple' }) => {
  const styles = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    purple: "bg-violet-50 text-violet-700 border-violet-100",
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
        {helpText && <span className="text-[9px] text-blue-500 cursor-help" title={helpText}>Auto-suggest</span>}
    </div>
    <div className="relative group">
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
    claimsRatio: '',
    vcmh: '15.00',
    currentInvoice: '',
    proposedReadjustment: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // --- INTELIGÊNCIA: ATUALIZAÇÃO AUTOMÁTICA DE VCMH ---
  useEffect(() => {
    let suggestedVCMH = 15.0; // Default

    // 1. Se for PME I (Pool), tende a seguir a média de pool ou ANS
    if (formData.companySize === 'PME_I') {
        suggestedVCMH = POOL_MARKET_AVG; 
    } 
    // 2. Se tiver Operadora selecionada, busca no banco de dados
    else if (formData.operator && OPERATOR_INDICES[formData.operator]) {
        suggestedVCMH = OPERATOR_INDICES[formData.operator];
    }

    // Atualiza o campo (o usuário ainda pode editar depois se quiser)
    setFormData(prev => ({ ...prev, vcmh: suggestedVCMH.toFixed(2) }));

    // Ajusta o Mix automaticamente
    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'POOL_100' }));
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'TECH_100' }));
    
    // Se mudar para PME II e estiver travado no Pool, destrava para o Mix Padrão
    if (formData.companySize === 'PME_II' && formData.calculationMix === 'POOL_100') {
        setFormData(prev => ({ ...prev, calculationMix: 'MIX_50_50' }));
    }

  }, [formData.operator, formData.companySize]);

  const generateDefenseText = (techRate: number, proposedRate: number, claims: number, target: number, operator: string) => {
    const diff = proposedRate - techRate;
    const isGoodPerformance = claims < target;
    const currentYear = new Date().getFullYear();

    let text = `À\n${operator || 'Operadora de Saúde'}\nDepartamento de Relacionamento Empresarial\n\n`;
    text += `Ref: Análise Técnica de Reajuste - Aniversário ${formData.anniversaryMonth}/${currentYear}\n\n`;
    text += `Prezados,\n\n`;
    text += `Recebemos a proposta de reajuste de ${proposedRate.toFixed(2)}% para a apólice em questão. Após auditoria atuarial independente, apresentamos nossa contraproposta técnica fundamentada nos seguintes pontos:\n\n`;
    
    text += `1. SINISTRALIDADE VS. META\n`;
    text += `A apólice registrou sinistralidade acumulada de ${claims.toFixed(2)}%. `;
    if (isGoodPerformance) {
        text += `Este resultado está ABAIXO do ponto de equilíbrio (Break-even de ${target}%), indicando que o contrato foi superavitário e gerou lucro operacional para a operadora. Não há justificativa técnica para reajuste além da inflação médica.\n\n`;
    } else {
        text += `Embora haja desvio da meta (${target}%), o índice proposto de ${proposedRate.toFixed(2)}% aplica uma penalidade desproporcional à recuperação necessária do contrato.\n\n`;
    }

    text += `2. VCMH E CONJUNTURA\n`;
    text += `Consideramos em nossos cálculos um VCMH de mercado de ${formData.vcmh}%, alinhado às práticas das principais operadoras para este porte.\n\n`;

    text += `3. CONCLUSÃO E PLEITO\n`;
    text += `Nossa modelagem aponta que a necessidade técnica real (Necessidade de Reposição) é de ${techRate.toFixed(2)}%. `;
    text += `O valor proposto excede em ${(proposedRate - techRate).toFixed(2)} pontos percentuais o equilíbrio atuarial.\n\n`;
    
    text += `Desta forma, para manutenção da apólice e continuidade da parceria, solicitamos a revisão do índice para o teto de ${techRate.toFixed(2)}%.\n\n`;
    
    text += `Certos da compreensão técnica,\n\nAtenciosamente,\n[Assinatura do Responsável]`;
    return text;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Inputs
      const claims = parseFloat(formData.claimsRatio) || 0;
      const vcmh = parseFloat(formData.vcmh) || 0;
      const invoice = parseFloat(formData.currentInvoice) || 0;
      const proposed = parseFloat(formData.proposedReadjustment) || 0;

      // Parâmetros
      const targetLossRatio = formData.companySize === 'EMPRESARIAL' ? 70 : 75; 
      
      // CÁLCULO ATUARIAL PURO (Fórmula de Mercado)
      // Reajuste Técnico = (Sinistro / Meta - 1) + VCMH
      let technicalNeedRaw = (((claims / targetLossRatio) - 1) * 100) + vcmh;
      
      // Tratamento de VCMH em casos de baixa sinistralidade (Floor)
      if (formData.companySize !== 'EMPRESARIAL' && technicalNeedRaw < vcmh) {
          technicalNeedRaw = vcmh; 
      }

      // Aplicação do Mix
      let technicalFinal = 0;
      const poolIndexUsed = formData.companySize === 'PME_I' ? POOL_MARKET_AVG : POOL_MARKET_AVG;

      switch (formData.calculationMix) {
        case 'POOL_100':
            technicalFinal = poolIndexUsed; 
            break;
        case 'TECH_100':
            technicalFinal = Math.max(technicalNeedRaw, 0); // Técnico Puro
            break;
        case 'MIX_50_50':
            technicalFinal = (poolIndexUsed * 0.5) + (technicalNeedRaw * 0.5);
            break;
        case 'MIX_70_30':
            technicalFinal = (poolIndexUsed * 0.7) + (technicalNeedRaw * 0.3);
            break;
      }

      // Projeções
      const agingFactor = 1.02;
      const trendFactor = (1 + (vcmh / 100)) * agingFactor;
      
      const valProposed = invoice * (1 + (proposed / 100));
      const valFair = invoice * (1 + (technicalFinal / 100));
      
      const m12 = valFair;
      const m24 = m12 * trendFactor;
      const m36 = m24 * trendFactor;

      const defense = generateDefenseText(technicalFinal, proposed, claims, targetLossRatio, formData.operator);

      setResult({
        technicalReadjustment: parseFloat(technicalFinal.toFixed(2)),
        proposedReadjustment: proposed,
        savingPotential: parseFloat((proposed - technicalFinal).toFixed(2)),
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
            poolRate: poolIndexUsed
        },
        defenseText: defense
      });
      setLoading(false);
    }, 1000);
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
              <h1 className="text-lg font-bold leading-none tracking-tight">Atuário<span className="text-emerald-400">Master</span></h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Gestão de Reajuste Inteligente</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-slate-400 font-bold">Base de Dados</span>
                <span className="text-xs text-emerald-400 font-mono">VCMH Q1/2026</span>
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
          
          {/* CONTROLES */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                        Dados do Contrato
                    </h2>
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-5">
                
                <InputGroup label="Operadora" icon={Building2} helpText="Selecionar operadora carrega o VCMH automaticamente">
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {Object.keys(OPERATOR_INDICES).map(op => <option key={op} value={op}>{op}</option>)}
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

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase flex justify-between">
                        Indicadores Técnicos
                        {formData.operator && <span className="text-emerald-600 text-[9px] lowercase">autodetectado</span>}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Sinistralidade %" icon={ShieldAlert}>
                            <input 
                            type="number" 
                            className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm font-mono font-bold outline-none focus:ring-2 ${parseFloat(formData.claimsRatio) > 75 ? 'border-rose-300 text-rose-600' : 'border-slate-200 text-slate-700 focus:ring-emerald-500'}`}
                            value={formData.claimsRatio}
                            onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                            placeholder="0.00"
                            />
                        </InputGroup>
                        <InputGroup label="VCMH / Inflação" icon={TrendingUp}>
                            <input 
                            type="number" 
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.vcmh}
                            onChange={(e) => setFormData({...formData, vcmh: e.target.value})}
                            />
                        </InputGroup>
                    </div>
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
                    <>Processando Estatísticas...</>
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
                <p className="text-xs mt-2 max-w-xs">Selecione a Operadora e insira os dados para ativar a Inteligência Atuarial.</p>
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

                    <Card className="p-6 border-l-4 border-l-emerald-500 bg-white relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Defesa Técnica</h3>
                                <p className="text-[10px] text-slate-500">
                                    {formData.calculationMix === 'POOL_100' ? 'Baseado no Pool de Risco' : 
                                     formData.calculationMix === 'TECH_100' ? 'Baseado no Desequilíbrio (Individual)' : 'Mix Híbrido (Pool + Técnico)'}
                                </p>
                            </div>
                            <Badge variant="green">Justo</Badge>
                        </div>
                        <div className="text-4xl font-extrabold text-emerald-700 tracking-tighter relative z-10">
                            {result.technicalReadjustment}%
                        </div>
                        
                        {result.savingPotential > 0 ? (
                             <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" />
                                    Economia Anual: {formatCurrency(result.financialImpact.accumulatedSaving)}
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-slate-100 relative z-10 text-xs text-slate-400">
                                Reajuste proposto está dentro da margem técnica.
                            </div>
                        )}
                    </Card>
                </div>

                {/* 2. PROJEÇÃO FINANCEIRA PREDITIVA */}
                <Card className="overflow-hidden">
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-emerald-400" />
                            Projeção Preditiva (36 Meses)
                        </h3>
                        <span className="text-[10px] text-slate-400 font-medium">Considerando Envelhecimento (+2% a.a)</span>
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

        {/* --- RODAPÉ EXPLICATIVO (LEIGOS) --- */}
        <div className="mt-16 border-t border-slate-200 pt-10 pb-20">
            <h3 className="text-center text-lg font-bold text-slate-800 mb-8 flex items-center justify-center gap-2">
                <Info className="w-5 h-5 text-emerald-500" />
                Entenda o Cálculo (Modo Simplificado)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">PASSO 1</div>
                    <h4 className="font-bold text-slate-700 mb-2">Sinistralidade (Uso)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Imagine que o plano de saúde é uma conta conjunta. A <strong>Sinistralidade</strong> é a porcentagem do dinheiro pago que foi realmente gasta com médicos e hospitais. Se pagamos R$ 100 e gastamos R$ 80, a sinistralidade é 80%.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded">PASSO 2</div>
                    <h4 className="font-bold text-slate-700 mb-2">Break-even (Meta)</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        A operadora precisa de lucro e dinheiro para pagar impostos. A "Meta" (Break-even) geralmente é 70% ou 75%. Isso significa que de cada R$ 100 pagos, no máximo R$ 75 deveriam ir para despesas médicas. O resto é para a operação funcionar.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm relative">
                    <div className="absolute -top-3 left-6 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded">RESULTADO</div>
                    <h4 className="font-bold text-slate-700 mb-2">Reajuste Técnico</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Se a empresa gastou mais do que a Meta (ex: 85% de uso contra 75% de meta), a operadora cobra a diferença para "zerar" a conta, somado à inflação médica (VCMH) do ano. É assim que chegamos ao percentual justo.
                    </p>
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}