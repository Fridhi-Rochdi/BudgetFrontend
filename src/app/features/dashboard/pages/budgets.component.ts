import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CategoryService } from '../../../core/services/category.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { Category } from '../../../core/models/category.model';
import { Expense } from '../../../core/models/expense.model';

interface BudgetRow {
  categoryId: number;
  name: string;
  type: Category['type'];
  spent: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ReactiveFormsModule],
  template: `
    <div class="budgets-page" *ngIf="!loading; else loadingState">
      <header class="page-header">
        <div>
          <h1>Budgets mensuels</h1>
          <p>Fixez des objectifs par catégorie et suivez l'avancement de vos dépenses.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="secondary-button" (click)="resetBudgets()" [disabled]="items.length === 0">
            Réinitialiser
          </button>
          <button type="button" class="primary-button" (click)="saveBudgets()" [disabled]="form.invalid">
            Enregistrer
          </button>
        </div>
      </header>

      <section class="summary" *ngIf="rows.length > 0">
        <div class="summary-card">
          <p>Total budgété</p>
          <h2>{{ totalBudget | number:'1.2-2' }} €</h2>
        </div>
        <div class="summary-card">
          <p>Total dépensé</p>
          <h2>{{ totalSpent | number:'1.2-2' }} €</h2>
        </div>
        <div class="summary-card" [class.positive]="balance >= 0" [class.negative]="balance < 0">
          <p>Écart global</p>
          <h2>{{ balance | number:'1.2-2' }} €</h2>
        </div>
      </section>

      <section class="panel" *ngIf="rows.length > 0; else emptyState">
        <form [formGroup]="form">
          <table class="data-table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Budget (€)</th>
                <th>Dépensé (€)</th>
                <th>Reste</th>
                <th>Progression</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let row of rows; let i = index" [class.over-budget]="isOverBudget(row, i)">
                <td>
                  <div class="category-name">
                    <span class="badge" [class.badge-income]="row.type === 'INCOME'" [class.badge-expense]="row.type === 'EXPENSE'">
                      {{ row.type === 'INCOME' ? 'Revenu' : 'Dépense' }}
                    </span>
                    <span>{{ row.name }}</span>
                  </div>
                </td>
                <td>
                  <input type="number" min="0" step="0.5" [formControl]="items.at(i).get('amount')" />
                </td>
                <td>{{ row.spent | number:'1.2-2' }}</td>
                <td [class.negative]="isOverBudget(row, i)">
                  <ng-container *ngIf="hasBudget(i); else noBudgetValue">
                    {{ remaining(row, i) | number:'1.2-2' }} €
                  </ng-container>
                  <ng-template #noBudgetValue>—</ng-template>
                </td>
                <td>
                  <div class="progress">
                    <div class="progress-fill" [style.width.%]="progress(row, i)" [class.over]="isOverBudget(row, i)"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </section>

      <section class="panel panel-tips" *ngIf="alerts.length > 0">
        <h2>Points d'attention</h2>
        <ul>
          <li *ngFor="let alert of alerts">{{ alert }}</li>
        </ul>
      </section>
    </div>

    <ng-template #loadingState>
      <div class="loading">
        <div class="loader"></div>
        <p>Chargement des budgets…</p>
      </div>
    </ng-template>

    <ng-template #emptyState>
      <div class="empty-state">
        <p>Aucune catégorie disponible pour le moment.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      background: #f4f6f8;
      color: #1f2933;
    }

    .budgets-page {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .page-header h1 {
      margin: 0 0 0.35rem;
      font-size: 1.75rem;
      font-weight: 600;
      color: #111827;
    }

    .page-header p {
      margin: 0;
      color: #4b5563;
      font-size: 0.95rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .primary-button,
    .secondary-button {
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
    }

    .primary-button {
      border: 1px solid #1f2937;
      background: #1f2937;
      color: white;
    }

    .primary-button:hover:not(:disabled) {
      background: #111827;
    }

    .secondary-button {
      border: 1px solid #d1d5db;
      background: white;
      color: #1f2933;
    }

    .secondary-button:hover {
      border-color: #9ca3af;
      color: #111827;
    }

    .primary-button:disabled,
    .secondary-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .summary-card h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2933;
    }

    .summary-card p {
      margin: 0;
      color: #4b5563;
      font-size: 0.9rem;
    }

    .summary-card.positive h2 {
      color: #047857;
    }

    .summary-card.negative h2 {
      color: #b91c1c;
    }

    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.5rem;
      box-shadow: 0 12px 30px -24px rgba(17, 24, 39, 0.45);
    }

    .panel-tips ul {
      margin: 0;
      padding-left: 1.2rem;
      color: #4b5563;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th,
    .data-table td {
      padding: 0.85rem 0.5rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
      font-size: 0.95rem;
    }

    .data-table th {
      color: #4b5563;
      font-weight: 600;
      background: #f9fafb;
    }

    .category-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 82px;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      background: #f3f4f6;
      color: #4b5563;
    }

    .badge-income {
      background: #ecfdf5;
      color: #047857;
    }

    .badge-expense {
      background: #fef2f2;
      color: #b91c1c;
    }

    input[type="number"] {
      width: 130px;
      padding: 0.55rem 0.65rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.95rem;
      color: #1f2937;
    }

    .progress {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #2563eb;
      transition: width 0.3s ease;
    }

    .progress-fill.over {
      background: #b91c1c;
    }

    .over-budget td {
      background: #fef2f2;
    }

    td.negative {
      color: #b91c1c;
      font-weight: 600;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 3rem 0;
      color: #6b7280;
    }

    .loader {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid #d1d5db;
      border-top-color: #1f2937;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: #4b5563;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1.5rem;
      }

      .summary {
        grid-template-columns: 1fr;
      }

      input[type="number"] {
        width: 100%;
      }

      .data-table {
        font-size: 0.9rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetsComponent implements OnInit, OnDestroy {
  protected categories: Category[] = [];
  protected expenses: Expense[] = [];
  protected rows: BudgetRow[] = [];
  protected alerts: string[] = [];
  protected loading = true;
  protected totalBudget = 0;
  protected totalSpent = 0;
  protected balance = 0;
  private readonly destroy$ = new Subject<void>();
  private valueChangesSubscribed = false;

  readonly form: FormGroup = this.fb.group({
    items: this.fb.array<FormGroup>([])
  });

  constructor(private readonly fb: FormBuilder,
              private readonly categoryService: CategoryService,
              private readonly expenseService: ExpenseService,
              private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get items(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  saveBudgets(): void {
    const storageValue: Record<number, number> = {};
    this.items.controls.forEach(control => {
      const categoryId = control.get('categoryId')?.value as number;
      const amountControl = control.get('amount');
      const rawAmount = Number(amountControl?.value ?? 0);
      storageValue[categoryId] = rawAmount > 0 ? rawAmount : 0;
    });
    localStorage.setItem('budgetwise.budgets', JSON.stringify(storageValue));
    this.updateTotals();
  }

  resetBudgets(): void {
    localStorage.removeItem('budgetwise.budgets');
    this.items.controls.forEach(control => control.get('amount')?.setValue(null));
    this.updateTotals();
  }

  hasBudget(index: number): boolean {
    return this.budgetValue(index) > 0;
  }

  remaining(row: BudgetRow, index: number): number {
    const budget = this.budgetValue(index);
    return budget - row.spent;
  }

  progress(row: BudgetRow, index: number): number {
    const budget = this.budgetValue(index);
    if (budget <= 0) {
      return 0;
    }
    const ratio = Math.min((row.spent / budget) * 100, 100);
    return Number.isFinite(ratio) ? Math.round(ratio) : 0;
  }

  isOverBudget(row: BudgetRow, index: number): boolean {
    const budget = this.budgetValue(index);
    return budget > 0 && row.spent > budget;
  }

  private loadData(): void {
    forkJoin({
      categories: this.categoryService.list(),
      expenses: this.expenseService.list()
    }).subscribe({
      next: ({ categories, expenses }) => {
        this.categories = categories;
        this.expenses = expenses;
        this.buildRows();
        this.buildForm();
        this.updateTotals();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private buildRows(): void {
    const totalsByCategory = new Map<number, number>();
    this.expenses.forEach(expense => {
      const current = totalsByCategory.get(expense.categoryId) ?? 0;
      totalsByCategory.set(expense.categoryId, current + Math.abs(expense.amount));
    });

    this.rows = this.categories
      .filter(category => category.type === 'EXPENSE' && !category.archived)
      .map(category => ({
        categoryId: category.id,
        name: category.name,
        type: category.type,
        spent: totalsByCategory.get(category.id) ?? 0
      }));
  }

  private buildForm(): void {
    const savedBudgets = this.readBudgetsFromStorage();
    this.items.clear();
    this.rows.forEach(row => {
      this.items.push(this.fb.group({
        categoryId: [row.categoryId],
        amount: [savedBudgets[row.categoryId] ?? null, [Validators.min(0)]]
      }));
    });
    if (!this.valueChangesSubscribed) {
      this.form.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.updateTotals());
      this.valueChangesSubscribed = true;
    }
  }

  private updateTotals(): void {
    let totalBudget = 0;
    let totalSpent = 0;
    const newAlerts: string[] = [];

    this.rows.forEach((row, index) => {
      const budget = this.budgetValue(index);
      totalBudget += budget;
      totalSpent += row.spent;
      if (budget > 0 && row.spent > budget) {
        newAlerts.push(`${row.name} dépasse le budget prévu de ${(row.spent - budget).toFixed(2)} €.`);
      }
    });

    if (totalBudget > 0 && totalSpent < totalBudget * 0.8) {
      newAlerts.push('Vous disposez encore d\'une marge confortable sur votre budget global. Pensez à renforcer votre épargne.');
    }
    if (totalBudget > 0 && totalSpent > totalBudget) {
      newAlerts.push('Le total des dépenses dépasse le budget global défini pour la période.');
    }
    if (this.rows.length > 0 && totalBudget === 0) {
      newAlerts.push('Aucun budget n\'est encore défini. Fixez des montants cibles pour suivre vos dépenses.');
    }

    this.totalBudget = totalBudget;
    this.totalSpent = totalSpent;
    this.balance = totalBudget - totalSpent;
    this.alerts = newAlerts;
    this.cdr.markForCheck();
  }

  private readBudgetsFromStorage(): Record<number, number> {
    const raw = localStorage.getItem('budgetwise.budgets');
    if (!raw) {
      return {};
    }
    try {
      return JSON.parse(raw) as Record<number, number>;
    } catch (error) {
      return {};
    }
  }

  private budgetValue(index: number): number {
    return Number(this.items.at(index).get('amount')?.value ?? 0);
  }
}
