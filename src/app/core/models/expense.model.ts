export interface Expense {
  id: number;
  categoryId: number;
  amount: number;
  expenseDate: string;
  notes?: string;
  paymentMethod?: string;
}
