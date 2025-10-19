import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { StatisticsService } from '../../../core/services/statistics.service';
import { StatisticsSummary } from '../../../core/models/statistics.model';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="statistics-page">
      <header class="page-header">
        <div>
          <h1>Statistiques</h1>
          <p>Suivez vos revenus, vos dépenses et votre épargne sur la période sélectionnée.</p>
        </div>
        <form [formGroup]="rangeForm" (ngSubmit)="reload()" class="range-form">
          <label>
            Début
            <input type="date" formControlName="start" />
          </label>
          <label>
            Fin
            <input type="date" formControlName="end" />
          </label>
          <button type="submit">Actualiser</button>
        </form>
      </header>

      <ng-container *ngIf="summary; else loading">
        <section class="summary-grid">
          <article class="summary-card">
            <h2>Revenus</h2>
            <p class="amount positive">{{ summary.totalIncome | number:'1.2-2' }} €</p>
          </article>
          <article class="summary-card">
            <h2>Dépenses</h2>
            <p class="amount negative">{{ summary.totalExpense | number:'1.2-2' }} €</p>
          </article>
          <article class="summary-card">
            <h2>Épargne nette</h2>
            <p class="amount" [class.positive]="summary.netSavings >= 0" [class.negative]="summary.netSavings < 0">
              {{ summary.netSavings | number:'1.2-2' }} €
            </p>
          </article>
        </section>

        <section class="panels">
          <article class="panel">
            <div class="panel-header">
              <h2>Répartition par catégorie</h2>
              <span class="panel-info">{{ summary.totalsByCategory.length }} catégories</span>
            </div>
            <ng-container *ngIf="summary.totalsByCategory.length > 0; else noCategory">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Part</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of summary.totalsByCategory; let i = index">
                    <td>{{ item.label }}</td>
                    <td>{{ item.total | number:'1.2-2' }} €</td>
                    <td class="progress-cell">
                      <div class="progress">
                        <div class="progress-fill"
                             [style.width.%]="getCategoryPercentage(item.total)"
                             [style.background]="getCategoryColor(i)"></div>
                      </div>
                      <span>{{ getCategoryPercentage(item.total) | number:'1.0-0' }}%</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </ng-container>
            <ng-template #noCategory>
              <p class="empty-message">Aucune donnée pour cette période.</p>
            </ng-template>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Tendance quotidienne</h2>
              <span class="panel-info">{{ summary.dailyTrend.length }} jours</span>
            </div>
            <ng-container *ngIf="summary.dailyTrend.length > 0; else noTrend">
              <div class="trend-chart">
                <div class="trend-bar" *ngFor="let point of summary.dailyTrend">
                  <div class="bar"
                       [style.height.%]="normalized(point.total)"
                       [class.positive]="point.total >= 0"
                       [class.negative]="point.total < 0"></div>
                  <span class="bar-date">{{ point.date | date:'dd/MM' }}</span>
                  <span class="bar-value">{{ point.total | number:'1.0-0' }} €</span>
                </div>
              </div>
            </ng-container>
            <ng-template #noTrend>
              <p class="empty-message">Aucune transaction enregistrée.</p>
            </ng-template>
          </article>
        </section>
      </ng-container>

      <ng-template #loading>
        <div class="loading">
          <div class="loader"></div>
          <p>Chargement des statistiques…</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .statistics-page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 1rem 0 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      padding: 1.5rem 2rem;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #f9fafb;
      margin-bottom: 2rem;
    }
    .page-header h1 {
      margin: 0;
      font-size: 1.75rem;
      color: #1f2933;
    }
    .page-header p {
      margin: 0.5rem 0 0;
      color: #4b5563;
      font-size: 0.95rem;
    }

    .range-form {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .range-form label {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: #374151;
    }
    .range-form input {
      padding: 0.55rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: white;
      font-size: 0.95rem;
      color: #1f2937;
    }
    .range-form button {
      padding: 0.6rem 1.4rem;
      border-radius: 8px;
      border: 1px solid #1f2937;
      background: #1f2937;
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .range-form button:hover {
      background: #111827;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.25rem 1.5rem;
    }
    .summary-card h2 {
      margin: 0 0 0.4rem;
      font-size: 1rem;
      color: #1f2933;
      font-weight: 600;
    }
    .amount {
      margin: 0;
      font-size: 1.6rem;
      font-weight: 700;
      color: #1f2933;
    }
    .amount.positive {
      color: #047857;
    }
    .amount.negative {
      color: #b91c1c;
    }

    .panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }
    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }
    .panel-header h2 {
      margin: 0;
      font-size: 1.1rem;
      color: #1f2933;
      font-weight: 600;
    }
    .panel-info {
      color: #6b7280;
      font-size: 0.85rem;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th,
    .data-table td {
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
      font-size: 0.95rem;
    }
    .data-table th {
      background: #f9fafb;
      color: #4b5563;
      font-weight: 600;
    }
    .progress-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .progress {
      flex: 1;
      height: 6px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #2563eb;
    }
    .empty-message {
      margin: 0;
      color: #6b7280;
      font-size: 0.95rem;
      padding: 1rem 0;
    }

    .trend-chart {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      min-height: 220px;
      padding: 0.5rem 0;
      overflow-x: auto;
    }
    .trend-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
      min-width: 46px;
    }
    .bar {
      width: 100%;
      max-width: 28px;
      border-radius: 4px 4px 0 0;
      background: #1f2937;
      transition: opacity 0.2s ease;
    }
    .bar.positive {
      background: #047857;
    }
    .bar.negative {
      background: #b91c1c;
    }
    .trend-bar:hover .bar {
      opacity: 0.8;
    }
    .bar-date {
      font-size: 0.75rem;
      color: #4b5563;
    }
    .bar-value {
      font-size: 0.75rem;
      color: #1f2933;
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
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .range-form {
        width: 100%;
      }
      .range-form button {
        width: 100%;
      }
      .trend-chart {
        gap: 0.75rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent implements OnInit {
  summary: StatisticsSummary | null = null;

  readonly rangeForm = this.fb.group({
    start: [this.startOfMonth()],
    end: [this.endOfMonth()]
  });

  constructor(private readonly fb: FormBuilder,
              private readonly statisticsService: StatisticsService,
              private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    const { start, end } = this.rangeForm.getRawValue();
    if (!start || !end) {
      return;
    }
    this.statisticsService.getSummary(start, end).subscribe((summary: StatisticsSummary) => {
      this.summary = summary;
      this.cdr.markForCheck();
    });
  }

  normalized(value: number): number {
    if (!this.summary) {
      return 0;
    }
    const max = Math.max(...this.summary.dailyTrend.map(point => Math.abs(point.total)), 1);
    return (Math.abs(value) / max) * 100;
  }

  getCategoryPercentage(value: number): number {
    if (!this.summary) {
      return 0;
    }
    const total = this.summary.totalsByCategory.reduce((sum, item) => sum + Math.abs(item.total), 0);
    return total > 0 ? (Math.abs(value) / total) * 100 : 0;
  }

  getCategoryColor(index: number): string {
    const colors = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#c2410c', '#0891b2'];
    return colors[index % colors.length];
  }

  private startOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10);
  }

  private endOfMonth(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().substring(0, 10);
  }
}
