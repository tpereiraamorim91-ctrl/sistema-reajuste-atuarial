"use client";

import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Activity,
  DollarSign,
  BarChart3
} from 'lucide-react';

// --- TIPOS E INTERFACES ---
type CompanySize = 'PME_I' | 'PME_II' | 'EMPRESARIAL';

interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  claimsRatio: string;
  vcmh: string;
}

interface AnalysisResult {
  readjustment: number;
  projections: {
    month12: number;
    month24: number;
    month36: number;
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

// --- COMPONENTES VISUAIS (UI) ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'blue' }: { children: React.ReactNode, variant?: 'blue' | 'green' | 'red' | 'purple' }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    red: "bg-rose-50 text-rose-700 border-rose-100",
    purple: "bg-violet-50 text-violet-700 border-violet-100",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[variant]} flex items-center gap-1 w-fit`}>
      {children}
    </span>
  );
};

const InputGroup = ({ label, icon: Icon, children }: { label: string, icon: any, children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
      <Icon className="w-4 h-4 text-slate-400" />
      {label}
    </label>
    <div className="relative group">
      {children}
    </div>
  </div>
);

// --- LÓGICA DO SISTEMA ---

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    anniversaryMonth: new Date().toLocaleString('pt-BR', { month: 'long' }),
    operator: '',
    companySize: 'PME_I',
    claimsRatio: '',
    vcmh: '15.5' // Valor default simulado de API
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Simula busca de API
  useEffect(() => {
    const simulateApiFetch = async () => {
      // Aqui você conectaria com sua API real de VCMH
      setTimeout(() => {
        // Simulando variação baseada na operadora (apenas visual)
        if(formData.operator) {
           // Lógica placeholder
        }
      }, 800);
    };
    simulateApiFetch();
  }, [formData.operator]);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de processamento Atuarial Complexo
    setTimeout(() => {
      const sinistralidade = parseFloat(formData.claimsRatio) || 0;
      const vcmh = parseFloat(formData.vcmh) || 0;
      let reajusteFinal = 0;
      
      // CORREÇÃO: Variável renomeada para 'scenario' (inglês) para bater com a interface
      let scenario = ""; 
      
      let poolPart = 0;
      let techPart = 0;

      // Lógica de Negócio (Simplificada para Demo)
      const targetLossRatio = 70; // Meta técnica
      const technicalNeed = ((sinistralidade / targetLossRatio) - 1) * 100 + vcmh;
      const poolRate = 12.5; // Taxa média pool ANS simulada

      switch (formData.companySize) {
        case 'PME_I': // 0-29 vidas (Pool puro)
          reajusteFinal = poolRate;
          scenario = "Pool de Risco (RN ANS)";
          poolPart = 100;
          techPart = 0;
          break;
        case 'PME_II': // 30+ vidas (Híbrido)
          // 50% Pool / 50% Técnico
          reajusteFinal = (poolRate * 0.5) + (Math.max(0, technicalNeed) * 0.5);
          scenario = "Híbrido (50% Pool / 50% Técnico)";
          poolPart = 50;
          techPart = 50;
          break;
        case 'EMPRESARIAL': // Livre negociação
          reajusteFinal = Math.max(vcmh, technicalNeed);
          scenario = "Técnico Puro (Negociação)";
          poolPart = 0;
          techPart = 100;
          break;
      }

      // Projeções com Juros Compostos (Trend Factor)
      const trendFactor = 1.12; // 12% a.a inflação médica extra
      
      setResult({
        readjustment: parseFloat(reajusteFinal.toFixed(2)),
        details: { poolPart, techPart, scenario }, // Agora a variável 'scenario' existe!
        projections: {
          month12: parseFloat((reajusteFinal).toFixed(2)),
          month24: parseFloat((reajusteFinal * trendFactor).toFixed(2)),
          month36: parseFloat((reajusteFinal * Math.pow(trendFactor, 2)).toFixed(2)),
        }
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      
      {/* HEADER PREMIUM */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 bg-opacity-80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">
                Atuário.AI
              </h1>
              <p className="text-xs text-slate-500 font-medium">Sistema de Inteligência em Saúde</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Ambiente Seguro</span>
             </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA: INPUTS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200">
              <h2 className="text-2xl font-bold mb-2">Simulação</h2>
              <p className="text-indigo-100 text-sm mb-6">Preencha os dados da apólice para gerar a projeção atuarial.</p>
              
              <form onSubmit={handleCalculate} className="space-y-5">
                
                <InputGroup label="Mês de Aniversário" icon={Calendar}>
                  <select 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all [&>option]:text-slate-900"
                    value={formData.anniversaryMonth}
                    onChange={(e) => setFormData({...formData, anniversaryMonth: e.target.value})}
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </InputGroup>

                <InputGroup label="Operadora" icon={Building2}>
                  <select 
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all [&>option]:text-slate-900"
                    value={formData.operator}
                    onChange={(e) => setFormData({...formData, operator: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                  </select>
                </InputGroup>

                <InputGroup label="Porte da Empresa" icon={Users}>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'PME_I', label: 'PME Porte I (0-29)' },
                      { id: 'PME_II', label: 'PME Porte II (30+)' },
                      { id: 'EMPRESARIAL', label: 'Empresarial (Livre)' }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({...formData, companySize: type.id as CompanySize})}
                        className={`text-sm px-4 py-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          formData.companySize === type.id 
                            ? 'bg-white text-indigo-700 border-white font-semibold shadow-md' 
                            : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                        }`}
                      >
                        {type.label}
                        {formData.companySize === type.id && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Sinistralidade %" icon={Activity}>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      value={formData.claimsRatio}
                      onChange={(e) => setFormData({...formData, claimsRatio: e.target.value})}
                    />
                  </InputGroup>
                  <InputGroup label="VCMH %" icon={TrendingUp}>
                    <input 
                      type="number" 
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      value={formData.vcmh}
                      onChange={(e) => setFormData({...formData, vcmh: e.target.value})}
                    />
                  </InputGroup>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white text-indigo-700 font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-50 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin" />
                      Calculando...
                    </>
                  ) : (
                    <>
                      Gerar Análise <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* COLUNA DIREITA: RESULTADOS */}
          <div className="lg:col-span-8">
            {!result ? (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-400 p-8 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <BarChart3 className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-semibold text-slate-600">Aguardando Dados</h3>
                <p className="max-w-xs mt-2">Preencha os parâmetros à esquerda para visualizar a projeção atuarial inteligente.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* CARD PRINCIPAL */}
                <Card className="p-8 border-l-8 border-l-indigo-600 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Calculator className="w-32 h-32 text-indigo-900" />
                   </div>
                   <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Reajuste Sugerido</h2>
                        <div className="text-5xl font-extrabold text-slate-900 tracking-tight">
                          {result.readjustment}%
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <Badge variant="purple">{result.details.scenario}</Badge>
                         <div className="text-xs text-slate-500 text-right">
                           Composição: {result.details.poolPart}% Pool | {result.details.techPart}% Técnico
                         </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-6" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Projeção 12 Meses */}
                       <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Curto Prazo (12m)</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-700">{result.projections.month12}%</p>
                          <p className="text-xs text-slate-400 mt-1">Impacto imediato</p>
                       </div>

                       {/* Projeção 24 Meses */}
                       <div className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm ring-2 ring-indigo-50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-xs font-semibold text-indigo-600 uppercase">Médio Prazo (24m)</span>
                          </div>
                          <p className="text-2xl font-bold text-indigo-900">{result.projections.month24}%</p>
                          <p className="text-xs text-indigo-400 mt-1">Tendência VCMH+Tech</p>
                       </div>

                       {/* Projeção 36 Meses */}
                       <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span className="text-xs font-semibold text-slate-500 uppercase">Longo Prazo (36m)</span>
                          </div>
                          <p className="text-2xl font-bold text-slate-700">{result.projections.month36}%</p>
                          <p className="text-xs text-slate-400 mt-1">Cenário Crítico</p>
                       </div>
                    </div>
                   </div>
                </Card>

                {/* DETALHES TÉCNICOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-rose-100 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-rose-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Análise de Risco</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Sinistralidade Atual</span>
                        <span className={`font-medium ${parseFloat(formData.claimsRatio) > 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {formData.claimsRatio}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${parseFloat(formData.claimsRatio) > 75 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min(parseFloat(formData.claimsRatio), 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        O Break-Even Point (Ponto de Equilíbrio) considerado para esta operadora é de 70-75%.
                      </p>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-100 p-2 rounded-lg">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Insights da IA</h3>
                    </div>
                    <ul className="space-y-2">
                      <li className="flex gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>VCMH aplicado segue tendência de mercado das top 30 operadoras.</span>
                      </li>
                      <li className="flex gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Cálculo otimizado para {formData.companySize.replace('_', ' ')}.</span>
                      </li>
                      <li className="flex gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Sugestão: Negociar aporte técnico para reduzir o reajuste em 36m.</span>
                      </li>
                    </ul>
                  </Card>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}