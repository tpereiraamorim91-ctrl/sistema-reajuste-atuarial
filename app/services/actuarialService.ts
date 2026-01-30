
import { Operator, ReadjustmentScenario, Projection } from '../types';

/**
 * Simula a busca de dados de VCMH de uma API externa.
 * Retorna um valor semi-aleatório baseado no nome da operadora para consistência.
 * @param operator O nome da operadora.
 * @returns Uma promessa que resolve para o valor de VCMH em porcentagem.
 */
export const fetchVCMHData = (operator: Operator): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Gera um hash simples do nome da operadora para ter um valor "consistente"
      const hash = operator.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const baseVCMH = 12 + (hash % 8); // Varia entre 12% e 19%
      const randomFactor = (Math.random() - 0.5) * 2; // de -1 a 1
      const finalVCMH = parseFloat((baseVCMH + randomFactor).toFixed(2));
      resolve(finalVCMH);
    }, 500);
  });
};

/**
 * Calcula os diferentes cenários de reajuste baseados na ponderação.
 * @param technicalReadjustment O reajuste técnico puro.
 * @param poolRate O reajuste do pool de risco da ANS.
 * @returns Um array de cenários de reajuste.
 */
export const calculateAllScenarios = (technicalReadjustment: number, poolRate: number): ReadjustmentScenario[] => {
  const scenarios: ReadjustmentScenario[] = [
    {
      name: 'Cenário A: 100% Pool',
      description: 'Típico para PME I (0-29 vidas). Reajuste definido pelo agrupamento de contratos da ANS.',
      rate: poolRate,
    },
    {
      name: 'Cenário B: 50% Pool / 50% Técnico',
      description: 'Ponto de partida comum em negociações para PME II (30-99 vidas).',
      rate: (poolRate * 0.5) + (technicalReadjustment * 0.5),
    },
    {
      name: 'Cenário C: 70% Pool / 30% Técnico',
      description: 'Negociação alternativa para PME II, com maior peso no pool.',
      rate: (poolRate * 0.7) + (technicalReadjustment * 0.3),
    },
    {
      name: 'Cenário D: 100% Técnico',
      description: 'Aplicado a grandes empresas com análise de risco individual.',
      rate: technicalReadjustment,
    }
  ];
  return scenarios;
};

/**
 * Gera projeções futuras de reajuste e custo acumulado.
 * @param scenarios Os cenários de reajuste calculados para o primeiro ano.
 * @param initialVcmh VCMH inicial em decimal.
 * @param trendFactor Fator de tendência da inflação médica.
 * @param claimsRatio Sinistralidade em decimal.
 * @param bep Break-even point em decimal.
 * @returns Um array de projeções para 12, 24 e 36 meses.
 */
export const generateProjections = (scenarios: ReadjustmentScenario[], initialVcmh: number, trendFactor: number, claimsRatio: number, bep: number): Projection[] => {
  const technicalReadjustmentYear1 = scenarios.find(s => s.name === 'Cenário D: 100% Técnico')?.rate || 0;

  const vcmhYear2 = initialVcmh * (1 + trendFactor);
  const technicalReadjustmentYear2 = claimsRatio / bep - 1 + vcmhYear2;

  const vcmhYear3 = vcmhYear2 * (1 + trendFactor);
  const technicalReadjustmentYear3 = claimsRatio / bep - 1 + vcmhYear3;
  
  // Para simplificação, usamos a projeção técnica para os anos futuros.
  // Em uma aplicação real, a ponderação de pool também poderia ser projetada.
  const projections: Projection[] = [
    {
      period: '12 Meses',
      projectedRate: technicalReadjustmentYear1,
      cumulativeIncrease: (1 + technicalReadjustmentYear1) - 1,
    },
    {
      period: '24 Meses',
      projectedRate: technicalReadjustmentYear2,
      cumulativeIncrease: (1 + technicalReadjustmentYear1) * (1 + technicalReadjustmentYear2) - 1,
    },
    {
      period: '36 Meses',
      projectedRate: technicalReadjustmentYear3,
      cumulativeIncrease: (1 + technicalReadjustmentYear1) * (1 + technicalReadjustmentYear2) * (1 + technicalReadjustmentYear3) - 1,
    }
  ];

  return projections;
};
