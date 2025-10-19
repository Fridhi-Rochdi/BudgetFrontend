import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/expenses`;

  list(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.baseUrl);
  }

  create(payload: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.post<Expense>(this.baseUrl, payload);
  }

  update(id: number, payload: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
