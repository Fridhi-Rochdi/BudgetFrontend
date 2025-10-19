export interface CategoryTotal {
  label: string;
  total: number;
}

export interface TrendPoint {
  date: string;
  total: number;
}

export interface StatisticsSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  totalsByCategory: CategoryTotal[];
  dailyTrend: TrendPoint[];
}
