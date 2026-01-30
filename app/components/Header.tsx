
import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <ShieldCheck className="w-8 h-8 text-brand-500" />
        <div className="ml-4">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Sistema de Inteligência de Reajuste
          </h1>
          <p className="text-sm text-slate-400">Análise Atuarial de Planos de Saúde</p>
        </div>
      </div>
    </header>
  );
};
