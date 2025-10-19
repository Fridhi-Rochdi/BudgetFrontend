import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StatisticsSummary } from '../models/statistics.model';

interface StatisticsApiResponse {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  totalsByCategory: Record<string, number>;
  dailyTrend: Array<{ date: string; total: number }>;
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private readonly http = inject(HttpClient);

  getSummary(start: string, end: string) {
    const params = new HttpParams().set('start', start).set('end', end);
    return this.http
      .get<StatisticsApiResponse>(`${environment.apiUrl}/statistics`, { params })
      .pipe(
        map((data: StatisticsApiResponse) => ({
          totalIncome: data.totalIncome,
          totalExpense: data.totalExpense,
          netSavings: data.netSavings,
          totalsByCategory: Object.entries(data.totalsByCategory || {}).map(([label, total]) => ({
            label,
            total
          })),
          dailyTrend: data.dailyTrend || []
        }) as StatisticsSummary)
      );
  }
}
