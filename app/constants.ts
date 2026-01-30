
import { Operator, CompanySize } from './types';

export const OPERATORS: { name: Operator }[] = [
  { name: 'Bradesco' }, { name: 'SulAmérica' }, { name: 'Amil' }, { name: 'Unimed' }, 
  { name: 'Porto Seguro' }, { name: 'NotreDame Intermédica' }, { name: 'Hapvida' }, 
  { name: 'Prevent Senior' }, { name: 'Allianz' }, { name: 'Sompo' }, { name: 'Care Plus' },
  { name: 'Omint' }, { name: 'Golden Cross' }, { name: 'QSaúde' }, { name: 'Alice' }, 
  { name: 'Sami' }, { name: 'Seguros Unimed' }, { name: 'Central Nacional Unimed' }, 
  { name: 'Amil One' }, { name: 'Lincx' }, { name: 'Vitallis' }, { name: 'BioVida' }, 
  { name: 'São Cristóvão' }, { name: 'Trasmontano' }, { name: 'Santa Helena' }, 
  { name: 'GNDI Minas' }, { name: 'Promed' }, { name: 'Unimed-BH' }, { name: 'Samp' }, 
  { name: 'São Francisco' }
];

export const COMPANY_SIZES: { [key in CompanySize]: string } = {
  PME_I: 'PME Porte I (0-29 vidas)',
  PME_II: 'PME Porte II (30+ vidas)',
  Empresarial: 'Empresarial (Livre Negociação)',
};

export const MONTHS: string[] = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const BREAK_EVEN_POINT = 75; // Meta de sinistralidade em %
export const POOL_READJUSTMENT_RATE = 0.155; // Reajuste do Pool de Risco da ANS (simulado) em decimal
export const TREND_FACTOR = 0.05; // Fator de tendência de 5% para projeções futuras (inflação médica composta)
