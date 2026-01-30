"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Activity,
  DollarSign,
  Briefcase,
  LineChart,
  Lock
} from 'lucide-react';

// --- TIPOS E INTERFACES ---
type CompanySize = 'PME_I' | 'PME_II' | 'EMPRESARIAL';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  claimsRatio: string; // Sinistralidade
  vcmh: string;
  currentInvoice: string; // Valor da Fatura
}

interface AnalysisResult {
  readjustment: number;
  technicalReadjustment: number;
  financialImpact: {
    current: number;
    year1: number;
    year2: number;
    year3: number;
    accumulatedDiff: number; // Diferença acumulada (Economia ou Custo)
  };
  defenseData: {
    targetLossRatio: number; // Meta (ex: 70%)
    deviation: number; // Desvio da meta
    justification: string;
  };
  details: {
    poolPart: number;
    techPart: number;
    scenario: string;
  };
}

// --- CONSTANTES ---
const OPERATORS = [
  "Bradesco Saúde", "SulAmérica", "Amil", "Unimed", "NotreDame Intermédica", 
  "Porto Seguro", "Sompo Saúde", "Allianz", "Omint", "Prevent Senior"
];

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Formata moeda (BRL)
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- COMPONENTES VISUAIS (UI) ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'gray' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'red' | 'blue' }) => {
  const styles = {
    gray: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${styles[variant]} flex items-center gap-1 w-fit uppercase tracking-wide`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <div className="relative group">
      {children}
    </div>
  </div>
);

// --- LÓGICA ATUARIAL DO SISTEMA ---

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    anniversaryMonth: new Date().toLocaleString('pt-BR', { month: 'long' }),
    operator: '',
    companySize: 'PME_I',
    claimsRatio: '',
    vcmh: '15.5',
    currentInvoice: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de processamento Atuarial
    setTimeout(() => {
      const sinistralidade = parseFloat(formData.claimsRatio) || 0;
      const vcmh = parseFloat(formData.vcmh) || 0;
      const invoice = parseFloat(formData.currentInvoice) || 0;

      let reajusteAplicado = 0;
      let scenario = "";
      let poolPart = 0;
      let techPart = 0;

      // PARÂMETROS ATUARIAIS
      // Target Loss Ratio (TLR) ou Breakeven Operacional
      const targetLossRatio = formData.companySize === 'EMPRESARIAL' ? 70 : 75; 
      
      // Cálculo do Reajuste Técnico Puro (Fórmula Padrão de Mercado)
      // ((Sinistralidade / Meta) - 1) + VCMH
      const technicalNeed = (((sinistralidade / targetLossRatio) - 1) * 100) + vcmh;
      
      // Pool ANS Médio (Simulado)
      const poolRate = 12.5; 

      switch (formData.companySize) {
        case 'PME_I': // 0-29 vidas (Pool puro)
          reajusteAplicado = poolRate;
          scenario = "Pool de Risco (RN ANS)";
          poolPart = 100;
          techPart = 0;
          break;
        case 'PME_II': // 30+ vidas (Híbrido)
          reajusteAplicado = (poolRate * 0.5) + (Math.max(0, technicalNeed) * 0.5);
          scenario = "Híbrido (50/50)";
          poolPart = 50;
          techPart = 50;
          break;
        case 'EMPRESARIAL': // Livre negociação
          // No empresarial, aplica-se o técnico, mas nunca negativo se VCMH for alto
          reajusteAplicado = Math.max(vcmh, technicalNeed);
          scenario = "Técnico Puro (Contrato)";
          poolPart = 0;
          techPart = 100;
          break;
      }

      // Projeções Financeiras (Compound Annual Growth Rate - CAGR Simulado)
      const trendFactor = 1.0 + (vcmh / 100); // Fator de tendência médica
      
      const year1Cost = invoice * (1 + (reajusteAplicado / 100));
      const year2Cost = year1Cost * trendFactor; // Ano 2 aplica VCMH cheio sobre o reajustado
      const year3Cost = year2Cost * trendFactor; // Ano 3 idem

      // Defesa e Justificativa
      let justification = "";
      if (reajusteAplicado < technicalNeed) {
         justification = "Reajuste abaixo da necessidade técnica. Risco de desequilíbrio futuro.";
      } else if (Math.abs(reajusteAplicado - technicalNeed) < 2) {
         justification = "Reajuste alinhado tecnicamente ao risco da carteira.";
      } else {
         justification = "Oportunidade de defesa: Reajuste projetado acima da necessidade técnica.";
      }

      setResult({
        readjustment: parseFloat(reajusteAplicado.toFixed(2)),
        technicalReadjustment: parseFloat(technicalNeed.toFixed(2)),
        financialImpact: {
          current: invoice,
          year1: year1Cost,
          year2: year2Cost,
          year3: year3Cost,
          accumulatedDiff: (year1Cost - invoice) * 12
        },
        defenseData: {
          targetLossRatio,
          deviation: sinistralidade - targetLossRatio,
          justification
        },
        details: { poolPart, techPart, scenario }
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* HEADER CORPORATIVO */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Atuário<span className="text-blue-600">Pro</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                <Lock className="w-3 h-3" />
                Ambiente Seguro
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PAINEL DE CONTROLE (ESQUERDA) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Briefcase className="w-5 h-5 text-slate-400" />
                <h2 className="text-sm font-bold text-slate-700 uppercase">Parâmetros do Contrato</h2>
              </div>
              
              <form onSubmit={handleCalculate} className="space-y-5">
                
                {/* Operadora e Aniversário */}
                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Aniversário" icon={Calendar}>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={formData.anniversaryMonth}
                        onChange={(e) => setFormData({...formData, anniversaryMonth: e.target.value})}
                      >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </InputGroup>
                    <InputGroup label="Porte" icon={Users}>
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
                </div>

                <InputGroup label="Operadora de Saúde" icon={Building2}>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Selecione a Operadora...</option>
                    {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-4">
                     <Calculator className="w-4 h-4 text-slate-400" />
                     <h3 className="text-xs font-bold text-slate-700 uppercase">Dados Financeiros</h3>
                  </div>

                  <div className="space-y-4">
                    <InputGroup label="Fatura Mensal Atual (R$)" icon={DollarSign}>
                      <input 
                        type="number" 
                        placeholder="0,00"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.currentInvoice}
                        onChange={(e) => setFormData({...formData, currentInvoice: e.target.value})}
                      />
                    </InputGroup>

                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup label="Sinistralidade %" icon={ShieldAlert}>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className={`w-full bg-slate-50 border rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 ${parseFloat(formData.claimsRatio) > 75 ? 'border-rose-200 text-rose-700 focus:ring-rose-500' : 'border-slate-200 focus:ring-blue-500'}`}
                          value={formData.claimsRatio}
                          onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                        />
                      </InputGroup>
                      <InputGroup label="VCMH / IPCA Saúde" icon={TrendingUp}>
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.vcmh}
                          onChange={(e) => setFormData({...formData, vcmh: e.target.value})}
                        />
                      </InputGroup>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando Dados...
                    </>
                  ) : (
                    <>
                      Gerar Estudo Técnico <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* PAINEL DE RESULTADOS (DIREITA) */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 p-8 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <LineChart className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Aguardando Input Atuarial</h3>
                <p className="max-w-xs mt-2 text-sm">Insira os dados da apólice ao lado para calcular as projeções de risco e reajuste.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 1. CARTÃO DE DESTAQUE - REAJUSTE */}
                <Card className="p-0 border-l-4 border-l-blue-600">
                   <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reajuste Projetado</h2>
                          <Badge variant="blue">{result.details.scenario}</Badge>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-slate-900 tracking-tighter">
                            {result.readjustment}%
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          Aplicável no mês de <strong>{formData.anniversaryMonth}</strong>
                        </p>
                      </div>

                      {/* Comparativo Técnico vs Aplicado */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 min-w-[200px]">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Defesa Técnica</h3>
                        <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Necessidade Técnica</span>
                              <span className="font-mono font-bold text-slate-700">{result.technicalReadjustment}%</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Meta de Sinistro</span>
                              <span className="font-mono font-bold text-slate-700">{result.defenseData.targetLossRatio}%</span>
                           </div>
                           <div className={`text-xs mt-2 pt-2 border-t border-slate-200 ${result.defenseData.deviation > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {result.defenseData.deviation > 0 
                                ? `⚠️ Desvio de +${result.defenseData.deviation.toFixed(2)}% da meta.`
                                : `✅ Carteira equilibrada.`
                              }
                           </div>
                        </div>
                      </div>
                   </div>
                </Card>

                {/* 2. PROJEÇÃO FINANCEIRA (MONETÁRIA) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-5 border-t-4 border-t-emerald-500">
                       <h4 className="text-xs font-bold text-emerald-600 uppercase mb-2">Curto Prazo (12 Meses)</h4>
                       <div className="text-2xl font-bold text-slate-800 tracking-tight">
                          {formatCurrency(result.financialImpact.year1)}
                       </div>
                       <p className="text-xs text-slate-400 mt-1">Fatura Mensal Reajustada</p>
                    </Card>

                    <Card className="p-5 border-t-4 border-t-blue-500">
                       <h4 className="text-xs font-bold text-blue-600 uppercase mb-2">Médio Prazo (24 Meses)</h4>
                       <div className="text-2xl font-bold text-slate-800 tracking-tight">
                          {formatCurrency(result.financialImpact.year2)}
                       </div>
                       <p className="text-xs text-slate-400 mt-1">Projeção com VCMH composto</p>
                    </Card>

                    <Card className="p-5 border-t-4 border-t-slate-500">
                       <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Longo Prazo (36 Meses)</h4>
                       <div className="text-2xl font-bold text-slate-800 tracking-tight">
                          {formatCurrency(result.financialImpact.year3)}
                       </div>
                       <p className="text-xs text-slate-400 mt-1">Cenário Futuro</p>
                    </Card>
                </div>

                {/* 3. RELATÓRIO DE DEFESA */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-5 h-5 text-slate-700" />
                    <h3 className="font-bold text-slate-800 text-sm uppercase">Argumentação para Defesa</h3>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-sm text-slate-700 leading-relaxed mb-4">
                    <strong>Parecer Atuarial:</strong> {result.defenseData.justification}
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-4">
                     <div>
                        <h4 className="text-xs text-slate-400 uppercase font-bold mb-1">Impacto Anual (12m)</h4>
                        <p className="text-lg font-bold text-slate-700">
                           {formatCurrency(result.financialImpact.accumulatedDiff)}
                        </p>
                        <p className="text-xs text-slate-400">Custo adicional projetado no ano</p>
                     </div>
                     <div>
                        <h4 className="text-xs text-slate-400 uppercase font-bold mb-1">Composição do Cálculo</h4>
                        <div className="flex gap-2 mt-1">
                           <Badge variant="blue">{result.details.techPart}% Técnico</Badge>
                           <Badge variant="gray">{result.details.poolPart}% Pool</Badge>
                        </div>
                     </div>
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