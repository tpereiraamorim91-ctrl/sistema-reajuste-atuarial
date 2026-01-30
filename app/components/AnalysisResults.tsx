
import React from 'react';
import { AnalysisResult } from '../types';
import { Card } from './Card';
import { BarChart, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { COMPANY_SIZES } from '../constants';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

const formatPercent = (value: number) => {
  if (isNaN(value) || !isFinite(value)) return 'N/A';
  return `${(value * 100).toFixed(2)}%`;
};

const getRateColor = (rate: number) => {
  if (rate < 0.15) return 'text-green-400';
  if (rate < 0.25) return 'text-amber-400';
  return 'text-red-400';
};

const getIconForRate = (rate: number) => {
    if (rate < 0.15) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (rate < 0.25) return <AlertTriangle className="w-6 h-6 text-amber-500" />;
    return <AlertTriangle className="w-6 h-6 text-red-500" />;
};

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result }) => {
  const { scenarios, projections, inputs } = result;

  const relevantScenario = scenarios.find(s => {
    if(inputs.companySize === 'PME_I') return s.name.includes('100% Pool');
    if(inputs.companySize === 'PME_II') return s.name.includes('50% Pool');
    if(inputs.companySize === 'Empresarial') return s.name.includes('100% Técnico');
    return false;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Card>
          <div className="flex items-center mb-4">
            <Info className="w-6 h-6 text-brand-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Resumo da Análise</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
             <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-sm text-slate-400">Porte da Empresa</p>
                <p className="font-bold text-base truncate">{COMPANY_SIZES[inputs.companySize]}</p>
             </div>
             <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-sm text-slate-400">Operadora</p>
                <p className="font-bold text-base">{inputs.operator}</p>
             </div>
             <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-sm text-slate-400">Sinistralidade</p>
                <p className="font-bold text-base">{inputs.claimsRatio}%</p>
             </div>
             <div className="bg-slate-700/50 p-3 rounded-lg">
                <p className="text-sm text-slate-400">VCMH</p>
                <p className="font-bold text-base">{inputs.vcmh}%</p>
             </div>
          </div>
          {relevantScenario && (
             <div className="mt-6 bg-brand-950/50 border border-brand-700 p-4 rounded-lg text-center">
                 <h3 className="text-lg font-semibold text-brand-300">Reajuste Mais Provável para seu Porte</h3>
                 <p className={`text-4xl font-bold my-2 ${getRateColor(relevantScenario.rate)}`}>
                     {formatPercent(relevantScenario.rate)}
                 </p>
                 <p className="text-sm text-slate-400">{relevantScenario.name}</p>
             </div>
          )}
        </Card>
      </div>

      <div>
        <Card>
          <div className="flex items-center mb-4">
            <BarChart className="w-6 h-6 text-brand-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Cenários de Reajuste</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((scenario) => (
              <div key={scenario.name} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{scenario.name}</h3>
                    <p className="text-sm text-slate-400">{scenario.description}</p>
                  </div>
                  <div className={`text-2xl font-bold ${getRateColor(scenario.rate)}`}>
                    {formatPercent(scenario.rate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <div>
        <Card>
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-brand-400 mr-3" />
            <h2 className="text-2xl font-bold text-white">Projeções de Custo Futuro</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projections.map((proj) => (
              <div key={proj.period} className="bg-slate-700/50 p-6 rounded-xl flex flex-col items-center text-center border border-slate-600/50">
                {getIconForRate(proj.cumulativeIncrease)}
                <h3 className="text-lg font-bold text-slate-200 mt-2">{proj.period}</h3>
                <p className="text-sm text-slate-400 mb-3">Aumento Acumulado</p>
                <p className={`text-4xl font-extrabold tracking-tighter ${getRateColor(proj.cumulativeIncrease)}`}>
                  {formatPercent(proj.cumulativeIncrease)}
                </p>
                <p className="text-xs text-slate-500 mt-2">Reajuste projetado no período: {formatPercent(proj.projectedRate)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
