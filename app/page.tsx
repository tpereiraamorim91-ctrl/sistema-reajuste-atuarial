'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Users, Calendar, AlertCircle, CheckCircle, BarChart3, Shield, ArrowRight } from 'lucide-react';

// --- MOCK DATA: SIMULAÇÃO DE API DE OPERADORAS E VCMH ---
const OPERATORS_DATA = [
  { id: 'amil', name: 'Amil', vcmh: 14.5 },
  { id: 'bradesco', name: 'Bradesco Saúde', vcmh: 15.2 },
  { id: 'sulamerica', name: 'SulAmérica', vcmh: 14.8 },
  { id: 'unimed', name: 'Unimed (CNU)', vcmh: 13.9 },
  { id: 'notredame', name: 'NotreDame Intermédica', vcmh: 12.5 },
  { id: 'porto', name: 'Porto Seguro', vcmh: 14.2 },
];

// --- LOGIC: CÁLCULOS ATUARIAIS ---
type CalculationResult = {
  readjustment: number;
  technicalReajust: number;
  poolReajust: number;
  projectedCost12: number;
  projectedCost24: number;
  projectedCost36: number;
  scenarioName: string;
};

export default function HealthInsuranceAdjuster() {
  // Estado do Formulário
  const [operator, setOperator] = useState(OPERATORS_DATA[0].id);
  const [customVcmh, setCustomVcmh] = useState<number | ''>('');
  const [lossRatio, setLossRatio] = useState<number | ''>(''); // Sinistralidade
  const [lives, setLives] = useState<number | ''>('');
  const [segment, setSegment] = useState('pme1'); // pme1, pme2, emp
  const [currentCost, setCurrentCost] = useState<number | ''>(''); // Custo atual para projeção
  const [results, setResults] = useState<CalculationResult | null>(null);

  // Efeito para buscar VCMH automático
  useEffect(() => {
    const selectedOp = OPERATORS_DATA.find(op => op.id === operator);
    if (selectedOp) {
      setCustomVcmh(selectedOp.vcmh);
    }
  }, [operator]);

  // Função "Cérebro Atuarial"
  const calculate = () => {
    if (lossRatio === '' || lives === '' || customVcmh === '' || currentCost === '') return;

    const vcmhDecimal = Number(customVcmh) / 100;
    const lossRatioDecimal = Number(lossRatio) / 100;
    const breakEvenPoint = 0.70; // Meta técnica de 70%

    // 1. Cálculo Técnico Puro (Fórmula Padrão de Mercado)
    // Reajuste Técnico = (Sinistralidade / Meta) - 1 + VCMH (simplificado para projeção)
    // Fórmula mais precisa: Variação de Custo + Desvio de Sinistralidade
    const technicalReajust = ((lossRatioDecimal / breakEvenPoint) - 1) + vcmhDecimal;
    
    // 2. Definição dos Pesos (Pool vs Técnico)
    let weightPool = 0;
    let weightTech = 0;
    let scenarioName = "";

    if (segment === 'pme1') {
      // 0-29 vidas: 100% Pool (Regra ANS/Mercado)
      weightPool = 1.0;
      weightTech = 0.0;
      scenarioName = "PME I (Pool 100%)";
    } else if (segment === 'pme2') {
      // 30+ vidas: Cenário Híbrido (Ex: 50/50 ou 70/30)
      // Vamos usar uma lógica inteligente baseada na sinistralidade
      if (lossRatioDecimal > 0.85) {
         // Sinistralidade alta, tende a ir para técnico para proteger a carteira, mas vamos usar 50/50
         weightPool = 0.5;
         weightTech = 0.5;
         scenarioName = "PME II (Híbrido 50/50)";
      } else {
         weightPool = 0.7;
         weightTech = 0.3;
         scenarioName = "PME II (Híbrido 70/30)";
      }
    } else {
      // Empresarial: 100% Técnico
      weightPool = 0.0;
      weightTech = 1.0;
      scenarioName = "Empresarial (Técnico Puro)";
    }

    // O "Pool" geralmente segue o VCMH de mercado + um spread de segurança, ou um índice fixo.
    // Vamos assumir que o Reajuste Pool é muito próximo do VCMH + 2% de spread.
    const poolReajust = vcmhDecimal + 0.02;

    // 3. Reajuste Final Ponderado
    const finalReajust = (poolReajust * weightPool) + (technicalReajust * weightTech);

    // 4. Projeções Futuras (Juros Compostos sobre Inflação Médica)
    // Trend Factor: A inflação médica tende a acelerar. 
    const trendFactorYear1 = 1 + finalReajust;
    const trendFactorYear2 = 1 + (vcmhDecimal * 1.1); // VCMH cresce 10% no ano 2
    const trendFactorYear3 = 1 + (vcmhDecimal * 1.2); // VCMH cresce 20% no ano 3

    const proj12 = Number(currentCost) * trendFactorYear1;
    const proj24 = proj12 * trendFactorYear2;
    const proj36 = proj24 * trendFactorYear3;

    setResults({
      readjustment: finalReajust * 100,
      technicalReajust: technicalReajust * 100,
      poolReajust: poolReajust * 100,
      projectedCost12: proj12,
      projectedCost24: proj24,
      projectedCost36: proj36,
      scenarioName
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Actuary.AI</h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest">Sistema de Inteligência de Reajuste</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-300">Banco de Dados ANS: Conectado</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* COLUNA DA ESQUERDA: INPUTS */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="flex items-center gap-2 text-lg font-semibold mb-6 text-slate-800">
              <Calculator className="w-5 h-5 text-blue-600" />
              Parâmetros do Contrato
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Operadora de Saúde</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                >
                  {OPERATORS_DATA.map(op => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Porte / Segmento</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                >
                  <option value="pme1">PME Porte I (0-29 vidas)</option>
                  <option value="pme2">PME Porte II (30+ vidas)</option>
                  <option value="emp">Empresarial (Livre Adesão)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Vidas</label>
                   <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        className="w-full pl-9 p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        placeholder="Ex: 45"
                        value={lives}
                        onChange={(e) => setLives(Number(e.target.value))}
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Sinistralidade (%)</label>
                   <div className="relative">
                      <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        className="w-full pl-9 p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        placeholder="Ex: 85.5"
                        value={lossRatio}
                        onChange={(e) => setLossRatio(e.target.value as any)}
                      />
                   </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">VCMH Aplicável (%)</label>
                <div className="relative">
                   <TrendingUp className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                   <input 
                     type="number" 
                     className="w-full pl-9 p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-blue-50 text-blue-900 font-semibold"
                     value={customVcmh}
                     onChange={(e) => setCustomVcmh(Number(e.target.value))}
                   />
                </div>
                <p className="text-xs text-slate-500 mt-1">Busca automática ou inserção manual.</p>
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Custo Total Atual (R$)</label>
                 <input 
                   type="number" 
                   className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                   placeholder="Ex: 50000.00"
                   value={currentCost}
                   onChange={(e) => setCurrentCost(e.target.value as any)}
                 />
              </div>

              <button 
                onClick={calculate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Gerar Análise Atuarial
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA: RESULTADOS */}
        <div className="lg:col-span-2 space-y-6">
          {!results ? (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 border-dashed p-12 text-slate-400">
              <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">Preencha os dados ao lado para processar a inteligência.</p>
            </div>
          ) : (
            <>
              {/* CARD DESTAQUE: REAJUSTE CALCULADO */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Reajuste Sugerido ({results.scenarioName})</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-bold tracking-tighter text-emerald-400">
                      {results.readjustment.toFixed(2)}%
                    </span>
                    <span className="mb-2 text-slate-300 font-medium">aplicação imediata</span>
                  </div>
                  <div className="mt-6 flex gap-6 text-sm">
                    <div>
                      <span className="block text-slate-500">Viés Técnico</span>
                      <span className="font-mono text-white">{results.technicalReajust.toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Viés Pool</span>
                      <span className="font-mono text-white">{results.poolReajust.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
                {/* Background decorative blob */}
                <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
              </div>

              {/* GRID DE PROJEÇÕES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ProjectionCard 
                  months={12} 
                  value={results.projectedCost12} 
                  baseline={Number(currentCost)} 
                />
                <ProjectionCard 
                  months={24} 
                  value={results.projectedCost24} 
                  baseline={Number(currentCost)} 
                />
                <ProjectionCard 
                  months={36} 
                  value={results.projectedCost36} 
                  baseline={Number(currentCost)} 
                />
              </div>

              {/* ANÁLISE QUALITATIVA (SIMULADA IA) */}
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                <h4 className="flex items-center gap-2 text-blue-900 font-semibold mb-3">
                  <CheckCircle className="w-5 h-5" />
                  Insight da IA Atuarial
                </h4>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Considerando uma sinistralidade de <strong>{lossRatio}%</strong> e o VCMH de <strong>{customVcmh}%</strong>, 
                  o contrato apresenta um desvio técnico. Para o porte <strong>{segment.toUpperCase()}</strong>, 
                  o sistema aplicou uma lógica de {results.scenarioName}. Recomenda-se negociação focada em 
                  gestão de crônicos para reduzir o impacto no ano 2.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Componente Auxiliar (Dentro do mesmo arquivo para evitar erro de import)
function ProjectionCard({ months, value, baseline }: { months: number, value: number, baseline: number }) {
  const increase = ((value - baseline) / baseline) * 100;
  
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Calendar className="w-4 h-4" />
          {months} Meses
        </div>
        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
          +{increase.toFixed(0)}% acum.
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-800">
        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
      </div>
      <p className="text-xs text-slate-400 mt-1">Custo projetado mensal</p>
    </div>
  );
}