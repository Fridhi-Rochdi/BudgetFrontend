import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Budget } from '../models/budget.model';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/budgets`;

  list(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.baseUrl);
  }

  create(payload: Omit<Budget, 'id'>): Observable<Budget> {
    return this.http.post<Budget>(this.baseUrl, payload);
  }

  update(id: number, payload: Omit<Budget, 'id'>): Observable<Budget> {
    return this.http.put<Budget>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
