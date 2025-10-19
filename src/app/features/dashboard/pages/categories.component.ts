import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="categories-page">
      <header class="page-header">
        <div>
          <h1>Catégories</h1>
          <p>Gérez les catégories utilisées pour vos revenus et dépenses.</p>
        </div>
        <button type="button" class="primary-button" (click)="showModal = true">
          Ajouter une catégorie
        </button>
      </header>

      <section class="panel">
        <ng-container *ngIf="categories.length > 0; else noCategories">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let category of categories">
                <td>{{ category.name }}</td>
                <td>
                  <span class="badge" [class.badge-income]="category.type === 'INCOME'" [class.badge-expense]="category.type === 'EXPENSE'">
                    {{ category.type === 'INCOME' ? 'Revenu' : 'Dépense' }}
                  </span>
                </td>
                <td>
                  <span class="badge" [class.badge-active]="!category.archived" [class.badge-archived]="category.archived">
                    {{ category.archived ? 'Archivée' : 'Active' }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <button type="button" class="text-button" (click)="toggleArchive(category)">
                      {{ category.archived ? 'Réactiver' : 'Archiver' }}
                    </button>
                    <button type="button" class="text-button danger" (click)="remove(category)">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </ng-container>
        <ng-template #noCategories>
          <div class="empty-state">
            <p>Aucune catégorie enregistrée pour le moment.</p>
            <button type="button" class="secondary-button" (click)="showModal = true">
              Créer une catégorie
            </button>
          </div>
        </ng-template>
      </section>
    </div>

    <div class="modal-overlay" *ngIf="showModal" (click)="showModal = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>Nouvelle catégorie</h2>
          <button type="button" class="icon-button" (click)="showModal = false" aria-label="Fermer">
            ×
          </button>
        </header>
        <form [formGroup]="form" (ngSubmit)="create()" class="modal-form">
          <div class="form-field">
            <label for="category-name">Nom de la catégorie</label>
            <input id="category-name" type="text" formControlName="name" placeholder="Ex : Alimentation" />
          </div>
          <div class="form-field">
            <label for="category-type">Type</label>
            <select id="category-type" formControlName="type">
              <option value="EXPENSE">Dépense</option>
              <option value="INCOME">Revenu</option>
            </select>
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

    .categories-page {
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

    .primary-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .primary-button:hover:not(:disabled) {
      background: #111827;
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

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 82px;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      font-size: 0.85rem;
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

    .badge-active {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .badge-archived {
      background: #f3f4f6;
      color: #6b7280;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
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

      .actions {
        flex-direction: column;
        align-items: flex-start;
      }

      .text-button {
        padding: 0.25rem 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  showModal = false;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['EXPENSE', Validators.required]
  });

  constructor(private readonly fb: FormBuilder,
              private readonly categoryService: CategoryService,
              private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.load();
  }

  create(): void {
    if (this.form.invalid) {
      return;
    }
    this.loading = true;
    this.cdr.markForCheck();
    this.categoryService.create({ ...this.form.value, archived: false } as Omit<Category, 'id'>).subscribe({
      next: category => {
        this.categories = [...this.categories, category];
        this.form.reset({ name: '', type: 'EXPENSE' });
        this.loading = false;
        this.showModal = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleArchive(category: Category): void {
    const updated = { ...category, archived: !category.archived };
    this.categoryService.update(category.id, updated).subscribe(res => {
      this.categories = this.categories.map(c => (c.id === category.id ? res : c));
      this.cdr.markForCheck();
    });
  }

  remove(category: Category): void {
    this.categoryService.delete(category.id).subscribe(() => {
      this.categories = this.categories.filter(c => c.id !== category.id);
      this.cdr.markForCheck();
    });
  }

  private load(): void {
    this.categoryService.list().subscribe(categories => {
      this.categories = categories;
      this.cdr.markForCheck();
    });
  }
}
