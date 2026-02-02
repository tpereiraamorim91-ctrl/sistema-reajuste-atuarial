"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, TrendingUp, Users, Building2, Calendar, 
  CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, 
  Activity, DollarSign, Briefcase, LineChart, Lock, 
  FileText, Copy, Scale
} from 'lucide-react';

// --- TIPOS E INTERFACES ---
type CompanySize = 'PME_I' | 'PME_II' | 'EMPRESARIAL';
type CalculationMix = 'POOL_100' | 'MIX_50_50' | 'MIX_70_30' | 'TECH_100';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  calculationMix: CalculationMix; // Novo: Escolha do Mix
  claimsRatio: string; // Sinistralidade
  vcmh: string;
  currentInvoice: string;
  proposedReadjustment: string; // Novo: O que a operadora pediu
}

interface AnalysisResult {
  technicalReadjustment: number; // O quanto deveria ser (Justo)
  proposedReadjustment: number;  // O quanto a operadora quer
  savingPotential: number;       // Diferença (Gordura)
  financialImpact: {
    current: number;
    proposedValue: number;       // Valor se aceitar a operadora
    fairValue: number;           // Valor se aceitar o técnico
    accumulatedSaving: number;   // Economia anual
    projections: {
        m12: number;
        m24: number;
        m36: number;
    }
  };
  defenseText: string;           // Texto da carta de defesa
  indicators: {
    breakEven: number;
    technicalNeed: number;
    poolRate: number;
  };
}

// --- CONSTANTES ---
const OPERATORS = [
  "Bradesco Saúde", "SulAmérica", "Amil", "Unimed (Nacional)", "Unimed (Central)", 
  "NotreDame Intermédica", "Porto Seguro", "Sompo Saúde", "Allianz", "Omint", 
  "Prevent Senior", "Golden Cross", "Seguros Unimed", "QSaúde", "Alice"
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- COMPONENTES VISUAIS (UI) ---

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
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${styles[variant]} flex items-center gap-1 w-fit uppercase tracking-wide`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <div className="relative group">
      {children}
    </div>
  </div>
);

// --- LÓGICA ATUARIAL & MOTOR DE IA ---

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    anniversaryMonth: new Date().toLocaleString('pt-BR', { month: 'long' }),
    operator: '',
    companySize: 'PME_II',
    calculationMix: 'MIX_50_50',
    claimsRatio: '',
    vcmh: '14.50', // VCMH Médio de mercado pré-carregado
    currentInvoice: '',
    proposedReadjustment: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Auto-selecionar Mix baseado no Porte
  useEffect(() => {
    if (formData.companySize === 'PME_I') setFormData(prev => ({ ...prev, calculationMix: 'POOL_100' }));
    if (formData.companySize === 'EMPRESARIAL') setFormData(prev => ({ ...prev, calculationMix: 'TECH_100' }));
    if (formData.companySize === 'PME_II' && (formData.calculationMix === 'POOL_100' || formData.calculationMix === 'TECH_100')) {
        setFormData(prev => ({ ...prev, calculationMix: 'MIX_50_50' }));
    }
  }, [formData.companySize]);

  const generateDefenseText = (techRate: number, proposedRate: number, claims: number, target: number, operator: string) => {
    const diff = proposedRate - techRate;
    const isAbusive = diff > 2;
    const isGoodPerformance = claims < target;

    let text = `Prezados,\n\nRef. Negociação de Reajuste - ${operator}\n\n`;
    text += `Recebemos a proposta de reajuste de ${proposedRate.toFixed(2)}%, a qual analisamos tecnicamente com base na sinistralidade do período (${claims.toFixed(2)}%) e nos indicadores de mercado (VCMH).\n\n`;
    
    if (isGoodPerformance) {
        text += `A apólice apresenta performance EXCELENTE, com sinistralidade de ${claims.toFixed(2)}%, situando-se ABAIXO do ponto de equilíbrio (Break-even de ${target}%). `;
        text += `Matematicamente, o contrato é superavitário e contribui para o resultado da operadora.\n\n`;
        text += `PLEITO: Diante do exposto, solicitamos a ISENÇÃO TOTAL (0%) do reajuste ou aplicação exclusiva do VCMH, desconsiderando qualquer aporte técnico.`;
    } else if (isAbusive) {
        text += `Identificamos que a proposta de ${proposedRate.toFixed(2)}% está desconectada da realidade técnica da carteira. `;
        text += `Nossa modelagem atuarial aponta que a necessidade técnica real é de ${techRate.toFixed(2)}%, considerando o VCMH e a recuperação do equilíbrio contratual.\n\n`;
        text += `PLEITO: Solicitamos a revisão imediata do índice para o teto de ${techRate.toFixed(2)}%, sob pena de inviabilidade financeira e busca por portabilidade de mercado.`;
    } else {
        text += `Embora a proposta esteja próxima da necessidade técnica, solicitamos a aplicação de um Fator de Parceria redutor, visando a manutenção do contrato a longo prazo.\n\n`;
        text += `PLEITO: Redução para ${(proposedRate * 0.8).toFixed(2)}% para fechamento imediato.`;
    }

    text += `\n\nNo aguardo de vossas considerações.\nAtenciosamente,\n[Seu Nome/Corretora]`;
    return text;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // 1. Parsing
      const claims = parseFloat(formData.claimsRatio) || 0;
      const vcmh = parseFloat(formData.vcmh) || 0;
      const invoice = parseFloat(formData.currentInvoice) || 0;
      const proposed = parseFloat(formData.proposedReadjustment) || 0;

      // 2. Parâmetros Atuariais
      const targetLossRatio = formData.companySize === 'EMPRESARIAL' ? 70 : 75; 
      const poolRateANS = 9.63; // Exemplo Pool ANS Teto

      // 3. Matemática Pura (Cálculo da Necessidade Técnica)
      // Fórmula: ((Sinistro / Meta) - 1) * 100 + VCMH
      let technicalNeedRaw = (((claims / targetLossRatio) - 1) * 100) + vcmh;
      
      // Trava de segurança: Se sinistralidade for muito baixa, técnico pode ser negativo (redução)
      // Mas operadoras raramente dão negativo, então travamos no VCMH ou 0 dependendo da força
      let technicalFinal = 0;

      // 4. Aplicação do Mix (Lógica de Ponderação)
      switch (formData.calculationMix) {
        case 'POOL_100':
            technicalFinal = poolRateANS;
            break;
        case 'TECH_100':
            technicalFinal = Math.max(technicalNeedRaw, 0); // Empresarial puro
            break;
        case 'MIX_50_50':
            technicalFinal = (poolRateANS * 0.5) + (Math.max(technicalNeedRaw, 0) * 0.5);
            break;
        case 'MIX_70_30':
             // Interpretação: 70% Pool / 30% Técnico (Soma 100%)
            technicalFinal = (poolRateANS * 0.7) + (Math.max(technicalNeedRaw, 0) * 0.3);
            break;
      }

      // 5. Projeções Financeiras (Juros sobre Juros)
      // Trend Factor composto (Inflação Médica + Envelhecimento 2% a.a)
      const trendFactor = 1.0 + ((vcmh + 2) / 100); 
      
      const valProposed = invoice * (1 + (proposed / 100));
      const valFair = invoice * (1 + (technicalFinal / 100));
      
      const m12 = valFair;
      const m24 = m12 * trendFactor;
      const m36 = m24 * trendFactor;

      const savingMonthly = valProposed - valFair;

      // 6. Geração de Defesa
      const defense = generateDefenseText(technicalFinal, proposed, claims, targetLossRatio, formData.operator);

      setResult({
        technicalReadjustment: parseFloat(technicalFinal.toFixed(2)),
        proposedReadjustment: proposed,
        savingPotential: parseFloat((proposed - technicalFinal).toFixed(2)),
        financialImpact: {
            current: invoice,
            proposedValue: valProposed,
            fairValue: valFair,
            accumulatedSaving: savingMonthly * 12,
            projections: { m12, m24, m36 }
        },
        indicators: {
            breakEven: targetLossRatio,
            technicalNeed: parseFloat(technicalNeedRaw.toFixed(2)),
            poolRate: poolRateANS
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
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">Technical Defense<span className="text-blue-400">.AI</span></h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Sistema de Inteligência Atuarial</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
             <Badge variant="blue">VCMH Live: {formData.vcmh}%</Badge>
             <div className="h-4 w-px bg-slate-700"></div>
             <div className="flex items-center gap-2 text-xs text-slate-300">
                <Lock className="w-3 h-3" />
                Dados Criptografados
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
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        Inputs do Contrato
                    </h2>
                </div>
              
              <form onSubmit={handleCalculate} className="p-6 space-y-5">
                
                <InputGroup label="Operadora" icon={Building2}>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Porte (Vidas)" icon={Users}>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.companySize}
                        onChange={(e) => setFormData({...formData, companySize: e.target.value as CompanySize})}
                      >
                         <option value="PME_I">PME I (0-29)</option>
                         <option value="PME_II">PME II (30+)</option>
                         <option value="EMPRESARIAL">Empresarial</option>
                      </select>
                    </InputGroup>

                    {/* LÓGICA DE MIX CONDICIONAL */}
                    {formData.companySize === 'PME_II' && (
                        <InputGroup label="Composição (Mix)" icon={Scale}>
                            <select
                                className="w-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.calculationMix}
                                onChange={(e) => setFormData({...formData, calculationMix: e.target.value as CalculationMix})}
                            >
                                <option value="MIX_50_50">50% Pool / 50% Tec</option>
                                <option value="MIX_70_30">70% Pool / 30% Tec</option>
                            </select>
                        </InputGroup>
                    )}
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase">Indicadores de Risco</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="Sinistralidade %" icon={ShieldAlert}>
                            <input 
                            type="number" 
                            className={`w-full bg-white border rounded-lg px-3 py-2.5 text-sm font-mono font-bold outline-none focus:ring-2 ${parseFloat(formData.claimsRatio) > 75 ? 'border-rose-300 text-rose-600' : 'border-slate-200 text-slate-700 focus:ring-blue-500'}`}
                            value={formData.claimsRatio}
                            onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                            placeholder="0.00"
                            />
                        </InputGroup>
                        <InputGroup label="VCMH / Inflação" icon={TrendingUp}>
                            <input 
                            type="number" 
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
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
                    <>Processando Inteligência Atuarial...</>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4" /> Gerar Defesa Técnica
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* PAINEL DE RESULTADOS */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 p-8 text-center opacity-60">
                <Activity className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Aguardando Análise</h3>
                <p className="text-xs mt-2 max-w-xs">Preencha os dados à esquerda para acionar o motor de cálculo e defesa.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                {/* 1. COMPARATIVO DE ÍNDICES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CARTÃO PROPOSTO */}
                    <Card className="p-6 border-l-4 border-l-rose-500 bg-rose-50/30">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xs font-bold text-rose-700 uppercase tracking-widest">Proposta Operadora</h3>
                                <p className="text-[10px] text-slate-500">Índice recebido na carta</p>
                            </div>
                            <Badge variant="red">Alto Risco</Badge>
                        </div>
                        <div className="text-4xl font-extrabold text-rose-700 tracking-tighter">
                            {result.proposedReadjustment}%
                        </div>
                        <div className="mt-4 pt-4 border-t border-rose-100">
                            <p className="text-xs text-slate-600 font-medium flex justify-between">
                                <span>Fatura Projetada:</span>
                                <span className="font-mono text-rose-700">{formatCurrency(result.financialImpact.proposedValue)}</span>
                            </p>
                        </div>
                    </Card>

                    {/* CARTÃO TÉCNICO CALCULADO */}
                    <Card className="p-6 border-l-4 border-l-emerald-500 bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <CheckCircle2 className="w-24 h-24 text-emerald-600" />
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Índice Técnico Justo</h3>
                                <p className="text-[10px] text-slate-500">Baseado no {formData.calculationMix.replace('_', ' ')}</p>
                            </div>
                            <Badge variant="green">Recomendado</Badge>
                        </div>
                        <div className="text-4xl font-extrabold text-emerald-700 tracking-tighter relative z-10">
                            {result.technicalReadjustment}%
                        </div>
                        
                        {result.savingPotential > 0 && (
                             <div className="mt-4 pt-4 border-t border-slate-100 relative z-10">
                                <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" />
                                    Redução de {result.savingPotential.toFixed(2)} pontos percentuais
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 2. PROJEÇÃO FINANCEIRA 36 MESES (TABELA) */}
                <Card className="overflow-hidden">
                    <div className="bg-slate-900 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-blue-400" />
                            Projeção Financeira (36 Meses)
                        </h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase font-bold border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3">Período</th>
                                    <th className="px-6 py-3">Valor Fatura (Est.)</th>
                                    <th className="px-6 py-3">Acumulado Anual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-emerald-500">Ano 1 (12m)</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m12)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m12 * 12)}</td>
                                </tr>
                                <tr className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-blue-500">Ano 2 (24m)</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m24)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m24 * 12)}</td>
                                </tr>
                                <tr className="bg-white hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 border-l-4 border-purple-500">Ano 3 (36m)</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m36)}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{formatCurrency(result.financialImpact.projections.m36 * 12)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* 3. DEFESA TÉCNICA (TEXTO GERADO) */}
                <Card className="p-6 border border-blue-200 shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <h3 className="text-sm font-bold text-slate-800 uppercase">Minuta de Defesa Técnica</h3>
                        </div>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.defenseText)}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                            <Copy className="w-3 h-3" /> Copiar Texto
                        </button>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
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