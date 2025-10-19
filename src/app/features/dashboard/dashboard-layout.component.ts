import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subject } from 'rxjs';
import { filter, startWith, takeUntil } from 'rxjs/operators';

interface NavItem {
  label: string;
  path: string;
  subtitle: string;
  exact?: boolean;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, AsyncPipe, NgIf, NgFor],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar__brand">BudgetWise</div>
        <nav class="sidebar__nav">
          <a *ngFor="let item of navigation"
             [routerLink]="item.path"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.exact ?? true }">
            <span class="nav__label">{{ item.label }}</span>
            <span class="nav__subtitle">{{ item.subtitle }}</span>
          </a>
        </nav>
        <section class="sidebar__section">
          <h3>Raccourcis</h3>
          <a class="shortcut" routerLink="/app/transactions">Nouvelle transaction</a>
          <a class="shortcut" routerLink="/app/budgets">Ajuster les budgets</a>
        </section>
        <section class="sidebar__section sidebar__support">
          <h3>Support</h3>
          <p>Consultez notre FAQ ou contactez-nous en cas de besoin.</p>
          <a class="support-link" href="mailto:support&#64;budgetwise.app">support&#64;budgetwise.app</a>
        </section>
      </aside>
      <main>
        <header class="topbar">
          <div>
            <div class="topbar__title">{{ currentTitle }}</div>
            <p class="topbar__subtitle" *ngIf="currentSubtitle">{{ currentSubtitle }}</p>
          </div>
          <div class="topbar__profile" *ngIf="authService.currentUser$ | async as user">
            <div class="topbar__avatar">{{ user.fullName.charAt(0) }}</div>
            <div>
              <div class="topbar__name">{{ user.fullName }}</div>
              <button type="button" (click)="onLogout()">Se déconnecter</button>
            </div>
          </div>
        </header>
        <section class="content">
          <router-outlet></router-outlet>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      background: var(--bg-light);
      padding-left: 280px;
      display: flex;
      flex-direction: column;
    }

    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      width: 280px;
      background: #111827;
      color: rgba(255, 255, 255, 0.92);
      padding: 2rem 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
      overflow-y: auto;
    }

    .sidebar__brand {
      font-size: 1.6rem;
      font-weight: 700;
    }

    .sidebar__nav {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar__nav a {
      display: block;
      padding: 0.8rem 1rem;
      border-radius: 1rem;
      color: inherit;
      background: transparent;
      transition: background 0.2s ease;
    }

    .sidebar__nav a.active,
    .sidebar__nav a:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .nav__label {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .nav__subtitle {
      display: block;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.65);
      margin-top: 0.2rem;
    }

    .sidebar__section {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .sidebar__section h3 {
      margin: 0;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(255, 255, 255, 0.6);
    }

    .shortcut {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.55rem 0.85rem;
      border-radius: 0.65rem;
      background: rgba(255, 255, 255, 0.1);
      color: inherit;
      text-decoration: none;
      font-size: 0.85rem;
      transition: background 0.2s ease;
    }

    .shortcut:hover {
      background: rgba(255, 255, 255, 0.18);
    }

    .sidebar__support p {
      margin: 0;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .support-link {
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
    }

    main {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .topbar {
      background: white;
      padding: 1.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e2e8f0;
    }

    .topbar__title {
      font-size: 1.4rem;
      font-weight: 600;
      color: #111827;
    }

    .topbar__subtitle {
      margin: 0.35rem 0 0;
      font-size: 0.9rem;
      color: #6b7280;
    }

    .topbar__profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .topbar__avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--primary);
      display: grid;
      place-items: center;
      color: white;
      font-weight: 700;
    }

    .topbar__profile button {
      border: none;
      background: transparent;
      color: var(--primary);
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }

    .content {
      padding: 2rem;
      overflow-y: auto;
      flex: 1;
    }

    @media (max-width: 960px) {
      .layout {
        padding-left: 0;
      }

      .sidebar {
        display: none;
        position: static;
        width: auto;
      }

      .content {
        padding: 1.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutComponent implements OnDestroy {
  protected readonly navigation: NavItem[] = [
    {
      label: 'Guide d\'utilisation',
      path: '/app/guide',
      subtitle: 'Découvrez les fonctionnalités pas à pas.'
    },
    {
      label: 'Tableau de bord',
      path: '/app/tableau-de-bord',
      subtitle: 'Vue synthétique de vos finances.'
    },
    {
      label: 'Budgets',
      path: '/app/budgets',
      subtitle: 'Fixez vos objectifs par catégorie.'
    },
    {
      label: 'Transactions',
      path: '/app/transactions',
      subtitle: 'Suivez vos entrées et sorties.'
    },
    {
      label: 'Catégories',
      path: '/app/categories',
      subtitle: 'Organisez vos dépenses et revenus.'
    },
    {
      label: 'Statistiques',
      path: '/app/statistiques',
      subtitle: 'Analysez vos tendances.'
    },
    {
      label: 'Analyses & Conseils',
      path: '/app/analyses',
      subtitle: 'Des pistes concrètes pour avancer.'
    }
  ];

  protected currentTitle = this.navigation[0].label;
  protected currentSubtitle = this.navigation[0].subtitle;
  private readonly destroy$ = new Subject<void>();

  constructor(public readonly authService: AuthService,
              private readonly router: Router,
              private readonly cdr: ChangeDetectorRef) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith<NavigationEnd | null>(null),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.updateHeader(event?.urlAfterRedirects ?? this.router.url);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }

  private updateHeader(url: string): void {
    const cleanUrl = url.split('?')[0].split(';')[0];
    const match = this.navigation.find(item => cleanUrl.startsWith(item.path));
    if (match) {
      this.currentTitle = match.label;
      this.currentSubtitle = match.subtitle;
    } else {
      this.currentTitle = 'BudgetWise';
      this.currentSubtitle = 'Pilotez votre budget au quotidien.';
    }
    this.cdr.markForCheck();
  }
}
