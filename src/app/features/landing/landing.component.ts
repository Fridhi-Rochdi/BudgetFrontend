import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero__content">
        <h1>Maîtrisez votre budget personnel avec BudgetWise</h1>
        <p>
          Suivez vos dépenses, définissez vos objectifs et visualisez votre santé financière
          grâce à un tableau de bord clair et moderne.
        </p>
        <div class="hero__actions">
          <a routerLink="/auth/register" class="btn btn--primary">Commencer gratuitement</a>
          <a routerLink="/auth/login" class="btn btn--ghost">Se connecter</a>
        </div>
      </div>
      <div class="hero__illustration">
        <div class="card">
          <h3>Total dépensé</h3>
          <p class="card__value">1 245 €</p>
          <p class="card__caption">Derniers 30 jours</p>
        </div>
        <div class="card">
          <h3>Budget restant</h3>
          <p class="card__value">755 €</p>
          <p class="card__caption">Objectif mensuel : 2 000 €</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      min-height: 100vh;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      align-items: center;
      gap: 3rem;
      padding: 3rem;
    }

    .hero__content h1 {
      font-size: clamp(2rem, 4vw, 3.4rem);
      margin-bottom: 1rem;
    }

    .hero__content p {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      max-width: 520px;
    }

    .hero__actions {
      display: flex;
      gap: 1rem;
    }

    .btn {
      padding: 0.85rem 1.8rem;
      border-radius: 999px;
      font-weight: 600;
      transition: background 0.2s ease;
    }
    .btn--primary {
      background: var(--primary);
      color: white;
    }
    .btn--primary:hover {
      background: var(--primary-dark);
    }
    .btn--ghost {
      border: 1px solid var(--primary);
      color: var(--primary);
    }

    .hero__illustration {
      display: grid;
      gap: 1.5rem;
    }
    .card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
    }
    .card__value {
      font-size: 2rem;
      font-weight: 700;
      margin: 0.5rem 0;
    }
    .card__caption {
      color: #64748b;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {}
