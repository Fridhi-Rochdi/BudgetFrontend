import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'app',
    canActivate: [authGuard],
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      {
        path: 'guide',
        loadComponent: () => import('./features/dashboard/pages/guide.component').then(m => m.GuideComponent)
      },
      {
        path: 'tableau-de-bord',
        loadComponent: () => import('./features/dashboard/pages/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'budgets',
        loadComponent: () => import('./features/dashboard/pages/budgets.component').then(m => m.BudgetsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/dashboard/pages/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'transactions',
        loadComponent: () => import('./features/dashboard/pages/transactions.component').then(m => m.TransactionsComponent)
      },
      {
        path: 'statistiques',
        loadComponent: () => import('./features/dashboard/pages/statistics.component').then(m => m.StatisticsComponent)
      },
      {
        path: 'analyses',
        loadComponent: () => import('./features/dashboard/pages/insights.component').then(m => m.InsightsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
