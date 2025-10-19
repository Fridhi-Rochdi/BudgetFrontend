import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../../core/services/statistics.service';
import { StatisticsSummary } from '../../../core/models/statistics.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface InsightCard {
  title: string;
  value: string;
  description: string;
  positive?: boolean;
}

interface InsightSet {
  summary: StatisticsSummary;
  cards: InsightCard[];
  focusCategory?: { name: string; total: number; share: number };
  bestDay?: { label: string; total: number };
  suggestions: string[];
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="insights" *ngIf="insights$ | async as insights">
      <header class="page-header">
        <div>
          <h1>Analyses et conseils</h1>
          <p>Un aperçu rapide pour comprendre votre dynamique financière actuelle.</p>
        </div>
      </header>

      <div class="cards-grid">
        <article class="metric-card" *ngFor="let card of insights.cards" [class.positive]="card.positive">
          <h2>{{ card.title }}</h2>
          <p class="value">{{ card.value }}</p>
          <p class="desc">{{ card.description }}</p>
        </article>
      </div>

      <div class="layout-panels">
        <article class="panel">
          <h2>Catégorie la plus active</h2>
          <ng-container *ngIf="insights.focusCategory; else emptyCategory">
            <p class="highlight">{{ insights.focusCategory.name }}</p>
            <p class="detail">
              {{ insights.focusCategory.total | number:'1.2-2' }} € sur la période
              ({{ insights.focusCategory.share | number:'1.0-1' }}% des dépenses)
            </p>
          </ng-container>
          <ng-template #emptyCategory>
            <p class="muted">Aucune donnée disponible pour le moment.</p>
          </ng-template>
        </article>

        <article class="panel">
          <h2>Tendance quotidienne</h2>
          <ng-container *ngIf="insights.bestDay; else emptyTrend">
            <p class="highlight">{{ insights.bestDay.label }}</p>
            <p class="detail">{{ insights.bestDay.total | number:'1.2-2' }} € d'épargne nette ce jour-là.</p>
            <p class="muted">Utilisez cette dynamique pour planifier vos dépenses importantes.</p>
          </ng-container>
          <ng-template #emptyTrend>
            <p class="muted">Saisissez davantage de transactions pour activer cette analyse.</p>
          </ng-template>
        </article>
      </div>

      <section class="panel suggestions" *ngIf="insights.suggestions.length > 0">
        <h2>Suggestions personnalisées</h2>
        <ul>
          <li *ngFor="let suggestion of insights.suggestions">{{ suggestion }}</li>
        </ul>
      </section>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      background: #f4f6f8;
      color: #1f2933;
    }

    .insights {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
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

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }

    .metric-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .metric-card h2 {
      margin: 0;
      font-size: 1rem;
      color: #4b5563;
      font-weight: 600;
    }

    .metric-card .value {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 600;
      color: #1f2937;
    }

    .metric-card .desc {
      margin: 0;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .metric-card.positive .value {
      color: #047857;
    }

    .layout-panels {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }

    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      min-height: 160px;
    }

    .panel h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #111827;
    }

    .highlight {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: #1f2937;
    }

    .detail {
      margin: 0;
      color: #4b5563;
      font-size: 0.95rem;
    }

    .muted {
      margin: 0;
      color: #9ca3af;
      font-size: 0.9rem;
    }

    .suggestions ul {
      margin: 0;
      padding-left: 1.2rem;
      color: #4b5563;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1.5rem;
      }

      .cards-grid {
        grid-template-columns: 1fr;
      }

      .layout-panels {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsightsComponent {
  private readonly range = this.resolveCurrentMonthRange();

  private readonly insightsSource$: Observable<InsightSet> = this.statisticsService
    .getSummary(this.range.start, this.range.end)
    .pipe(map(summary => this.computeInsights(summary)));

  readonly insights$ = this.insightsSource$;

  constructor(private readonly statisticsService: StatisticsService) {}

  private computeInsights(summary: StatisticsSummary): InsightSet {
  const income = summary.totalIncome ?? 0;
  const expenses = summary.totalExpense ?? 0;
  const net = summary.netSavings ?? income - expenses;
    const savingRate = income > 0 ? Math.max((net / income) * 100, 0) : 0;
    const averageDaily = summary.dailyTrend.length > 0
      ? summary.dailyTrend.reduce((sum, day) => sum + day.total, 0) / summary.dailyTrend.length
      : 0;

    const topCategories = [...summary.totalsByCategory].sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
    const primaryCategory = topCategories[0];
    const categoryShare = primaryCategory && expenses > 0
      ? Math.min((Math.abs(primaryCategory.total) / expenses) * 100, 100)
      : 0;

    const rawBestDay = summary.dailyTrend.reduce<{ total: number; label: string } | undefined>((acc, day) => {
      if (!acc || day.total > acc.total) {
        return { total: day.total, label: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }) };
      }
      return acc;
    }, undefined);
    const bestDay = rawBestDay && rawBestDay.total > 0 ? rawBestDay : undefined;

    const cards: InsightCard[] = [
      {
        title: 'Solde net',
        value: `${net.toFixed(2)} €`,
        description: net >= 0 ? 'Votre période reste positive.' : 'Surveillez vos dépenses pour revenir à l\'équilibre.',
        positive: net >= 0
      },
      {
        title: 'Taux d\'épargne',
        value: `${savingRate.toFixed(1)} %`,
        description: savingRate >= 20 ? 'Excellent niveau d\'épargne.' : 'Objectif recommandé : viser 20 %.',
        positive: savingRate >= 20
      },
      {
        title: 'Dépense moyenne / jour',
        value: `${averageDaily.toFixed(2)} €`,
        description: summary.dailyTrend.length > 0 ? 'Basé sur les transactions saisies.' : 'Ajoutez vos transactions pour enrichir cette donnée.'
      },
      {
        title: 'Catégories actives',
        value: `${summary.totalsByCategory.length}`,
        description: 'Continuez à catégoriser vos dépenses pour un meilleur suivi.'
      }
    ];

    const suggestions: string[] = [];
    if (expenses > 0 && primaryCategory && Math.abs(primaryCategory.total) > expenses * 0.35) {
      suggestions.push(`Vos dépenses sont concentrées sur ${primaryCategory.label}. Vérifiez si certaines peuvent être réduites.`);
    }
    if (savingRate < 10 && income > 0) {
      suggestions.push('Votre taux d\'épargne est en dessous de 10 %. Essayez de fixer un virement automatique vers un compte épargne.');
    }
    if (income > 0 && averageDaily > income / 30) {
      suggestions.push('Les dépenses quotidiennes dépassent vos revenus journaliers moyens. Réévaluez vos dépenses récurrentes.');
    }
    if (suggestions.length === 0 && net > 0) {
      suggestions.push('Vous êtes sur la bonne voie. Conservez ce rythme et ajustez les budgets si nécessaire.');
    }

    return {
      summary,
      cards,
      focusCategory: primaryCategory
        ? {
            name: primaryCategory.label,
            total: Math.abs(primaryCategory.total),
            share: categoryShare
          }
        : undefined,
      bestDay,
      suggestions
    };
  }

  private resolveCurrentMonthRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10)
    };
  }
}
