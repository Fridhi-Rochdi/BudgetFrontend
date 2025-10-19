import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, CommonModule, NgFor, NgIf } from '@angular/common';
import { BehaviorSubject, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { StatisticsService } from '../../../core/services/statistics.service';
import { StatisticsSummary } from '../../../core/models/statistics.model';

type PeriodKey = 'month' | 'quarter' | 'year';

interface PeriodOption {
  key: PeriodKey;
  label: string;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, AsyncPipe],
  template: `
    <div class="overview-page">
      <ng-container *ngIf="summary$ | async as summary; else loading">
        <header class="page-header">
          <div class="headline">
            <div>
              <h1>Tableau de bord</h1>
              <p class="subtext">Vue d'ensemble de vos finances personnelles.</p>
            </div>
            <div class="period-picker">
              <button
                type="button"
                *ngFor="let period of periods"
                [class.active]="period.key === selectedPeriod"
                (click)="selectPeriod(period.key)">
                {{ period.label }}
              </button>
            </div>
          </div>
          <p class="current-period">Période : {{ getCurrentPeriod() }}</p>
        </header>

        <section class="summary-grid">
          <article class="summary-card">
            <p class="card-title">Revenus</p>
            <p class="card-value positive">{{ summary.totalIncome | number:'1.2-2' }} €</p>
          </article>
          <article class="summary-card">
            <p class="card-title">Dépenses</p>
            <p class="card-value negative">{{ summary.totalExpense | number:'1.2-2' }} €</p>
          </article>
          <article class="summary-card">
            <p class="card-title">Épargne nette</p>
            <p class="card-value" [class.positive]="summary.netSavings >= 0" [class.negative]="summary.netSavings < 0">
              {{ summary.netSavings | number:'1.2-2' }} €
            </p>
          </article>
        </section>

        <section class="content-grid">
          <article class="panel">
            <div class="panel-header">
              <h2>Répartition par catégorie</h2>
              <span class="panel-info">{{ summary.totalsByCategory.length }} catégories</span>
            </div>
            <ng-container *ngIf="summary.totalsByCategory.length > 0; else emptyCategory">
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
                    <td>
                      <span class="category-dot" [style.background]="getCategoryColor(i)"></span>
                      {{ item.label }}
                    </td>
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
            <ng-template #emptyCategory>
              <p class="empty-message">Aucune donnée disponible pour cette période.</p>
            </ng-template>
          </article>

          <article class="panel">
            <div class="panel-header">
              <h2>Tendance quotidienne</h2>
              <span class="panel-info">{{ summary.dailyTrend.length }} jours</span>
            </div>
            <ng-container *ngIf="summary.dailyTrend.length > 0; else emptyTrend">
              <div class="trend-chart">
                <div class="trend-bar" *ngFor="let point of summary.dailyTrend">
                  <div
                    class="bar"
                    [style.height.%]="normalizeValue(point.total)"
                    [class.positive]="point.total >= 0"
                    [class.negative]="point.total < 0"></div>
                  <span class="bar-date">{{ point.date | date:'dd/MM' }}</span>
                  <span class="bar-value">{{ point.total | number:'1.0-0' }} €</span>
                </div>
              </div>
            </ng-container>
            <ng-template #emptyTrend>
              <p class="empty-message">Aucune transaction enregistrée.</p>
            </ng-template>
          </article>
        </section>

        <section class="summary-list">
          <div class="summary-item">
            <span class="label">Total revenus</span>
            <span class="value">{{ summary.totalIncome | number:'1.2-2' }} €</span>
          </div>
          <div class="summary-item">
            <span class="label">Total dépenses</span>
            <span class="value">{{ summary.totalExpense | number:'1.2-2' }} €</span>
          </div>
          <div class="summary-item">
            <span class="label">Solde net</span>
            <span class="value">{{ summary.netSavings | number:'1.2-2' }} €</span>
          </div>
        </section>
      </ng-container>

      <ng-template #loading>
        <div class="loading">
          <div class="loader"></div>
          <p>Chargement des données…</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 2rem;
        background: #f4f6f8;
        color: #1f2933;
      }

      .overview-page {
        max-width: 1100px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1.5rem 2rem;
        border-radius: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        box-shadow: 0 8px 24px -18px rgba(17, 24, 39, 0.45);
      }

      .headline {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }

      .page-header h1 {
        margin: 0;
        font-size: 1.6rem;
        color: #111827;
        font-weight: 600;
      }

      .subtext {
        font-size: 0.95rem;
        color: #6b7280;
        margin: 0.35rem 0 0;
      }

      .current-period {
        margin: 0;
        font-size: 0.9rem;
        color: #4b5563;
      }

      .period-picker {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .period-picker button {
        border: 1px solid #d1d5db;
        background: white;
        color: #1f2933;
        padding: 0.55rem 1rem;
        border-radius: 20px;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }

      .period-picker button.active {
        background: #111827;
        color: white;
        border-color: #111827;
      }

      .period-picker button:hover {
        border-color: #9ca3af;
      }

      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .summary-card {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: #ffffff;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        box-shadow: 0 12px 28px -24px rgba(17, 24, 39, 0.6);
      }

      .card-title {
        font-size: 0.9rem;
        color: #6b7280;
        margin: 0;
      }

      .card-value {
        font-size: 1.6rem;
        margin: 0;
        color: #1f2933;
        font-weight: 600;
      }

      .card-value.positive {
        color: #047857;
      }

      .card-value.negative {
        color: #b91c1c;
      }

      .content-grid {
        display: grid;
        grid-template-columns: 1.75fr 1fr;
        gap: 1.75rem;
        margin-bottom: 2rem;
      }

      .panel {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: white;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        box-shadow: 0 12px 30px -24px rgba(17, 24, 39, 0.5);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
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

      .data-table td:first-child {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .category-dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        display: inline-block;
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
        min-height: 200px;
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

      .summary-list {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        background: white;
        padding: 1.5rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .summary-item {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .label {
        font-size: 0.85rem;
        color: #6b7280;
      }

      .value {
        font-size: 1.05rem;
        color: #1f2933;
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

      @media (max-width: 768px) {
        :host {
          padding: 1.5rem;
        }

        .headline {
          flex-direction: column;
          align-items: flex-start;
        }

        .content-grid {
          grid-template-columns: 1fr;
        }

        .trend-chart {
          gap: 0.75rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverviewComponent {
  readonly periods: PeriodOption[] = [
    { key: 'month', label: 'Ce mois' },
    { key: 'quarter', label: 'Ce trimestre' },
    { key: 'year', label: 'Cette année' }
  ];

  selectedPeriod: PeriodKey = 'month';

  private readonly period$ = new BehaviorSubject<PeriodKey>(this.selectedPeriod);
  private currentRange = this.resolveRange(this.selectedPeriod);
  private currentSummary: StatisticsSummary | null = null;

  readonly summary$: Observable<StatisticsSummary> = this.period$.pipe(
    switchMap((period: PeriodKey) => {
      const range = this.resolveRange(period);
      this.currentRange = range;
      this.selectedPeriod = period;
      return this.statisticsService.getSummary(range.start, range.end);
    }),
    tap((summary: StatisticsSummary) => {
      this.currentSummary = summary;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(private readonly statisticsService: StatisticsService) {}

  selectPeriod(period: PeriodKey): void {
    if (period !== this.selectedPeriod) {
      this.period$.next(period);
    }
  }

  getCurrentPeriod(): string {
    return `${this.formatDate(this.currentRange.start)} - ${this.formatDate(this.currentRange.end)}`;
  }

  getCategoryPercentage(value: number): number {
    if (!this.currentSummary) {
      return 0;
    }
    const total = this.currentSummary.totalsByCategory.reduce((sum, item) => sum + Math.abs(item.total), 0);
    return total > 0 ? (Math.abs(value) / total) * 100 : 0;
  }

  normalizeValue(value: number): number {
    if (!this.currentSummary || this.currentSummary.dailyTrend.length === 0) {
      return 0;
    }
    const max = Math.max(...this.currentSummary.dailyTrend.map(point => Math.abs(point.total)), 1);
    return (Math.abs(value) / max) * 100;
  }

  getCategoryColor(index: number): string {
    const palette = ['#2563eb', '#7c3aed', '#dc2626', '#059669', '#c2410c', '#0891b2'];
    return palette[index % palette.length];
  }

  private resolveRange(period: PeriodKey): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (period === 'quarter') {
      start.setMonth(start.getMonth() - 2);
    } else if (period === 'year') {
      start.setMonth(0, 1);
    }

    return {
      start: start.toISOString().substring(0, 10),
      end: end.toISOString().substring(0, 10)
    };
  }

  private formatDate(raw: string): string {
    return new Date(raw).toLocaleDateString('fr-FR');
  }
}
