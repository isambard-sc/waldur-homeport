import { PaymentProfile } from 'waldur-js-client';

export type ChartData = Array<{
  label: string;
  value: number | string;
  xAxisValue?: any;
  itemStyle?: any;
}>;

export interface Chart {
  title: string;
  units?: string;
  current: number | string;
  total: number;
  data: ChartData;
  changes?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface CostChart extends Chart {
  incurred?: ChartData;
  compensation?: ChartData;
}

export interface CreditChart extends Chart {
  remaining?: ChartData;
}

export interface Scope {
  url?: string;
  payment_profiles?: PaymentProfile[];
}
