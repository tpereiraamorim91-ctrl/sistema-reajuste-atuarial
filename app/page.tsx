"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Card } from './components/Card';
import { Select } from './components/Select';
import { Input } from './components/Input';
import { Button } from './components/Button';
import { AnalysisResults } from './components/AnalysisResults';
import { Calculator, FileText, Loader, SlidersHorizontal } from 'lucide-react';
import { FormData, AnalysisResult, CompanySize, Operator } from './types';
import { OPERATORS, COMPANY_SIZES, MONTHS, BREAK_EVEN_POINT, POOL_READJUSTMENT_RATE, TREND_FACTOR } from './constants';
import { fetchVCMHData, calculateAllScenarios, generateProjections } from './services/actuarialService';

export default function App() {
  const [formData, setFormData] = useState<FormData>({
    anniversaryMonth: 'Janeiro',
    operator: 'Bradesco',
    companySize: 'PME_I',
    claimsRatio: 85,
    vcmh: 15,
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingVCMH, setIsFetchingVCMH] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'claimsRatio' || name === 'vcmh' ? parseFloat(value) : value,
    }));
  };

  const fetchAndSetVCMH = useCallback(async (operator: Operator) => {
    setIsFetchingVCMH(true);
    try {
      const vcmhValue = await fetchVCMHData(operator);
      setFormData(prev => ({ ...prev, vcmh: vcmhValue }));
    } catch (error) {
      console.error("Failed to fetch VCMH:", error);
      // Keep manual value if API fails
    } finally {
      setIsFetchingVCMH(false);
    }
  }, []);

  useEffect(() => {
    fetchAndSetVCMH(formData.operator as Operator);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.operator]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAnalysisResult(null);

    setTimeout(() => {
      const technicalReadjustment = (formData.claimsRatio / 100) / (BREAK_EVEN_POINT / 100) - 1 + (formData.vcmh / 100);
      
      const scenarios = calculateAllScenarios(technicalReadjustment, POOL_READJUSTMENT_RATE);
      const projections = generateProjections(scenarios, formData.vcmh / 100, TREND_FACTOR, formData.claimsRatio / 100, BREAK_EVEN_POINT / 100);

      setAnalysisResult({
        scenarios,
        projections,
        inputs: { ...formData }
      });

      setIsLoading(false);
    }, 1500); // Simulate processing time
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Card>
              <div className="flex items-center mb-6">
                <SlidersHorizontal className="w-6 h-6 text-brand-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Parâmetros de Análise</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Select label="Mês de Aniversário" name="anniversaryMonth" value={formData.anniversaryMonth} onChange={handleInputChange} options={MONTHS} />
                <Select label="Operadora" name="operator" value={formData.operator} onChange={handleInputChange} options={OPERATORS.map(op => op.name)} />
                <Select label="Porte da Empresa" name="companySize" value={formData.companySize} onChange={handleInputChange} options={Object.entries(COMPANY_SIZES).map(([key, value]) => ({ value: key, label: value }))} />
                <Input label="Sinistralidade Média (%)" name="claimsRatio" type="number" value={formData.claimsRatio} onChange={handleInputChange} placeholder="Ex: 85" />
                <div className="relative">
                  <Input label="VCMH (%)" name="vcmh" type="number" value={formData.vcmh} onChange={handleInputChange} placeholder="Ex: 15" />
                  {isFetchingVCMH && <Loader className="absolute right-3 top-9 h-5 w-5 animate-spin text-slate-400" />}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <><Loader className="w-5 h-5 animate-spin mr-2" /> Gerando Análise...</> : <><Calculator className="w-5 h-5 mr-2" /> Gerar Análise Atuarial</>}
                </Button>
              </form>
            </Card>
          </div>
          <div className="lg:col-span-8">
            {analysisResult ? (
              <AnalysisResults result={analysisResult} />
            ) : (
              <Card className="flex flex-col items-center justify-center h-full min-h-[400px] lg:min-h-0 text-center border-2 border-dashed border-slate-700 bg-slate-900/50">
                <FileText className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-300">Aguardando Análise</h3>
                <p className="text-slate-500 mt-2 max-w-sm">Preencha os parâmetros à esquerda e clique em "Gerar Análise Atuarial" para visualizar os cenários de reajuste e projeções de custo.</p>
              </Card>
            )}
          </div>
        </div>
        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Actuarial Intelligence System. Todos os direitos reservados.</p>
        </footer>
      </main>
    </div>
  );
}
