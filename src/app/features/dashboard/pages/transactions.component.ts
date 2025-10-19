import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ExpenseService } from '../../../core/services/expense.service';
import { CategoryService } from '../../../core/services/category.service';
import { Expense } from '../../../core/models/expense.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="transactions-page">
      <header class="page-header">
        <div>
          <h1>Transactions</h1>
          <p>Suivez et consignez vos revenus et dépenses au quotidien.</p>
        </div>
        <button type="button" class="primary-button" (click)="showModal = true">
          Nouvelle transaction
        </button>
      </header>

      <section class="panel">
        <ng-container *ngIf="expenses.length > 0; else emptyState">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Montant</th>
                <th>Catégorie</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let expense of expenses">
                <td>{{ expense.expenseDate | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span class="amount" [class.income]="getCategoryType(expense.categoryId) === 'INCOME'" [class.expense]="getCategoryType(expense.categoryId) === 'EXPENSE'">
                    {{ getCategoryType(expense.categoryId) === 'INCOME' ? '+' : '-' }}{{ expense.amount | number:'1.2-2' }} €
                  </span>
                </td>
                <td>{{ categoryName(expense.categoryId) }}</td>
                <td>{{ expense.notes || '—' }}</td>
                <td>
                  <button type="button" class="text-button danger" (click)="remove(expense)">
                    Supprimer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </ng-container>
        <ng-template #emptyState>
          <div class="empty-state">
            <p>Aucune transaction enregistrée.</p>
            <button type="button" class="secondary-button" (click)="showModal = true">
              Ajouter une transaction
            </button>
          </div>
        </ng-template>
      </section>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>Nouvelle transaction</h2>
          <button type="button" class="icon-button" (click)="showModal = false" aria-label="Fermer">
            ×
          </button>
        </header>
        <form [formGroup]="form" (ngSubmit)="create()" class="modal-form">
          <div class="form-field">
            <label for="amount">Montant (€)</label>
            <input id="amount" type="number" step="0.01" formControlName="amount" placeholder="Ex : 25.50" />
          </div>
          <div class="form-field">
            <label for="expense-date">Date</label>
            <input id="expense-date" type="date" formControlName="expenseDate" />
          </div>
          <div class="form-field">
            <label for="category">Catégorie</label>
            <select id="category" formControlName="categoryId">
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }} ({{ category.type === 'INCOME' ? 'Revenu' : 'Dépense' }})
              </option>
            </select>
          </div>
          <div class="form-field">
            <label for="notes">Notes (optionnel)</label>
            <input id="notes" type="text" formControlName="notes" placeholder="Ex : Restaurant" />
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary-button" (click)="showModal = false">Annuler</button>
            <button type="submit" class="primary-button" [disabled]="form.invalid || loading">
              <span *ngIf="!loading">Ajouter</span>
              <span *ngIf="loading">Ajout en cours…</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      background: #f4f6f8;
      color: #1f2933;
    }

    .transactions-page {
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

    .primary-button {
      padding: 0.65rem 1.4rem;
      border-radius: 999px;
      border: 1px solid #1f2937;
      background: #1f2937;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .primary-button:hover:not(:disabled) {
      background: #111827;
    }

    .primary-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .secondary-button {
      padding: 0.6rem 1.2rem;
      border-radius: 999px;
      border: 1px solid #d1d5db;
      background: white;
      color: #1f2933;
      font-weight: 600;
      cursor: pointer;
      transition: border-color 0.2s ease, color 0.2s ease;
    }

    .secondary-button:hover {
      border-color: #9ca3af;
      color: #111827;
    }

    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.5rem;
      box-shadow: 0 12px 30px -24px rgba(17, 24, 39, 0.45);
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

    .amount {
      font-weight: 600;
    }

    .amount.income {
      color: #047857;
    }

    .amount.expense {
      color: #b91c1c;
    }

    .text-button {
      border: none;
      background: none;
      color: #1f2937;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .text-button:hover {
      text-decoration: underline;
    }

    .text-button.danger {
      color: #b91c1c;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: #4b5563;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 39, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      width: min(500px, 100%);
      box-shadow: 0 20px 60px -24px rgba(17, 24, 39, 0.4);
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #111827;
    }

    .icon-button {
      border: none;
      background: none;
      font-size: 1.35rem;
      line-height: 1;
      cursor: pointer;
      color: #4b5563;
      padding: 0.25rem;
    }

    .icon-button:hover {
      color: #1f2937;
    }

    .modal-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .form-field label {
      font-weight: 600;
      color: #1f2933;
      font-size: 0.95rem;
    }

    .form-field input,
    .form-field select {
      padding: 0.65rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: #fff;
      font-size: 0.95rem;
      color: #1f2937;
    }

    .form-field select {
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding-top: 0.5rem;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1.5rem;
      }

      .page-header {
        align-items: flex-start;
      }

      .page-header h1 {
        font-size: 1.5rem;
      }

      .data-table {
        font-size: 0.9rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionsComponent implements OnInit {
  categories: Category[] = [];
  expenses: Expense[] = [];
  loading = false;
  showModal = false;

  readonly form = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    expenseDate: [new Date().toISOString().substring(0, 10), Validators.required],
    categoryId: [null as number | null, Validators.required],
    notes: ['']
  });

  constructor(private readonly fb: FormBuilder,
              private readonly expenseService: ExpenseService,
              private readonly categoryService: CategoryService,
              private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    const raw = this.form.getRawValue();
    const payload: Omit<Expense, 'id'> = {
      amount: Number(raw.amount),
      expenseDate: raw.expenseDate ?? new Date().toISOString().substring(0, 10),
      categoryId: Number(raw.categoryId),
      notes: raw.notes ?? undefined,
      paymentMethod: undefined
    };
    this.expenseService.create(payload).subscribe({
      next: expense => {
        this.expenses = [expense, ...this.expenses];
        this.loading = false;
        this.showModal = false;
        this.form.reset({
          amount: null,
          expenseDate: new Date().toISOString().substring(0, 10),
          categoryId: this.categories[0]?.id ?? null,
          notes: ''
        });
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  remove(expense: Expense): void {
    this.expenseService.delete(expense.id).subscribe(() => {
      this.expenses = this.expenses.filter(e => e.id !== expense.id);
      this.cdr.markForCheck();
    });
  }

  categoryName(id: number): string {
    return this.categories.find(category => category.id === id)?.name ?? 'Inconnue';
  }

  getCategoryType(id: number): 'INCOME' | 'EXPENSE' {
    return this.categories.find(category => category.id === id)?.type ?? 'EXPENSE';
  }

  private loadData(): void {
    this.categoryService.list().subscribe(categories => {
      this.categories = categories;
      if (!this.form.controls.categoryId.value && categories.length > 0) {
        this.form.controls.categoryId.setValue(categories[0].id);
      }
      this.cdr.markForCheck();
    });
    this.expenseService.list().subscribe(expenses => {
      this.expenses = expenses;
      this.cdr.markForCheck();
    });
  }
}
