import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth">
      <div class="auth__card">
        <h2>Connexion</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="vous@email.com" />
          <div class="error" *ngIf="form.controls.email.invalid && form.controls.email.touched">
            Email invalide
          </div>

          <label>Mot de passe</label>
          <input type="password" formControlName="password" placeholder="********" />
          <div class="error" *ngIf="form.controls.password.invalid && form.controls.password.touched">
            Mot de passe requis
          </div>

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>
        <p class="auth__switch">
          Pas encore de compte ? <a routerLink="/auth/register">Créer un compte</a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    .auth {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-light);
      padding: 2rem;
    }
    .auth__card {
      background: white;
      border-radius: 1rem;
      padding: 2.5rem;
      width: min(100%, 420px);
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
    }
    h2 {
      margin-top: 0;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    label {
      font-weight: 600;
      display: block;
      margin-bottom: 0.5rem;
    }
    input {
      width: 100%;
      padding: 0.85rem;
      margin-bottom: 1rem;
      border-radius: 0.75rem;
      border: 1px solid #cbd5f5;
      background: #f8fafc;
    }
    button {
      width: 100%;
      padding: 0.9rem;
      border: none;
      border-radius: 0.75rem;
      background: var(--primary);
      color: white;
      font-size: 1rem;
      font-weight: 600;
    }
    button:disabled {
      background: #94a3b8;
    }
    .error {
      color: #dc2626;
      margin-top: -0.5rem;
      margin-bottom: 1rem;
      font-size: 0.85rem;
    }
    .auth__switch {
      text-align: center;
      margin-top: 1rem;
    }
    .auth__switch a {
      color: var(--primary);
      font-weight: 600;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });
  loading = false;

  constructor(private readonly fb: FormBuilder,
              private readonly authService: AuthService,
              private readonly router: Router) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  this.loading = true;
  const payload = this.form.getRawValue();
  this.authService.login(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/app');
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        const message = err.error?.message || 'Erreur de connexion';
        alert(message);
        this.form.setErrors({ invalidCredentials: true });
      }
    });
  }
}
