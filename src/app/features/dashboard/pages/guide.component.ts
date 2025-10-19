import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="guide">
      <header>
        <h1>Guide d'utilisation</h1>
        <p>Un tour rapide pour maîtriser BudgetWise et tirer le meilleur de vos finances.</p>
      </header>

      <article class="panel">
        <h2>1. Commencez par vos catégories</h2>
        <p>
          Personnalisez vos catégories dans l'onglet <strong>Catégories</strong>. Classez vos dépenses et revenus,
          archivez celles que vous n'utilisez plus pour garder une vue claire.
        </p>
      </article>

      <article class="panel">
        <h2>2. Enregistrez vos transactions</h2>
        <p>
          Depuis <strong>Transactions</strong>, ajoutez vos entrées et sorties. Plus vos données sont complètes,
          plus les analyses seront pertinentes.
        </p>
      </article>

      <article class="panel">
        <h2>3. Fixez vos budgets</h2>
        <p>
          Dans <strong>Budgets</strong>, définissez des objectifs par catégorie. Ajustez les montants chaque mois et
          consultez les alertes pour rester dans vos limites.
        </p>
      </article>

      <article class="panel">
        <h2>4. Analysez vos statistiques</h2>
        <p>
          Les sections <strong>Tableau de bord</strong>, <strong>Statistiques</strong> et <strong>Analyses</strong>
          vous offrent une vision synthétique et des conseils personnalisés.
        </p>
      </article>

      <article class="panel">
        <h2>5. Besoin d'aide ?</h2>
        <p>
          Consultez la section support dans la barre latérale ou écrivez-nous :
          <a href="mailto:support&#64;budgetwise.app">support&#64;budgetwise.app</a>.
        </p>
      </article>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      padding: 2rem;
      background: #f4f6f8;
      color: #1f2933;
    }

    .guide {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    header h1 {
      margin: 0 0 0.35rem;
      font-size: 1.75rem;
      font-weight: 600;
      color: #111827;
    }

    header p {
      margin: 0;
      color: #4b5563;
      font-size: 0.95rem;
    }

    .panel {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      box-shadow: 0 12px 30px -24px rgba(17, 24, 39, 0.45);
    }

    .panel h2 {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
      color: #1f2933;
    }

    .panel p {
      margin: 0;
      color: #4b5563;
      line-height: 1.6;
    }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1.5rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuideComponent {}
