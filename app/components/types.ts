
export type CompanySize = 'PME_I' | 'PME_II' | 'Empresarial';
export type Operator = 'Bradesco' | 'SulAmérica' | 'Amil' | 'Unimed' | 'Porto Seguro' | 'NotreDame Intermédica' | 'Hapvida' | 'Prevent Senior' | 'Allianz' | 'Sompo' | 'Care Plus' | 'Omint' | 'Golden Cross' | 'QSaúde' | 'Alice' | 'Sami' | 'Seguros Unimed' | 'Central Nacional Unimed' | 'Amil One' | 'Lincx' | 'Vitallis' | 'BioVida' | 'São Cristóvão' | 'Trasmontano' | 'Santa Helena' | 'GNDI Minas' | 'Promed' | 'Unimed-BH' | 'Samp' | 'São Francisco';

export interface FormData {
  anniversaryMonth: string;
  operator: string;
  companySize: CompanySize;
  claimsRatio: number;
  vcmh: number;
}

export interface ReadjustmentScenario {
  name: string;
  description: string;
  rate: number;
}

export interface Projection {
  period: string;
  projectedRate: number;
  cumulativeIncrease: number;
}

export interface AnalysisResult {
  scenarios: ReadjustmentScenario[];
  projections: Projection[];
  inputs: FormData;
}
