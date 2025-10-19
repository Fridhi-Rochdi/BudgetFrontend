export interface Budget {
  id: number;
  categoryId?: number;
  amount: number;
  periodStart: string;
  periodEnd: string;
}
