# BudgetWise Frontend

Application Angular (v17) servant d'interface utilisateur pour gérer budgets, transactions et statistiques.

## Prérequis
- Node.js 18+
- npm 9+

## Installation
```bash
npm install
```

## Configuration
1. Copier `.env.example` vers `.env` et ajuster les variables:
   - `NG_APP_API_URL`: URL de l'API backend (ex: `http://localhost:8081/api`).
   - `NG_APP_PRODUCTION`: `false` pour le développement, `true` pour un build prod.
2. Le script `scripts/generate-env.cjs` génère automatiquement `src/environments/environment.generated.ts` avant chaque `start`, `build`, `test` ou `lint`.

## Lancer le serveur de développement
```bash
npm start
```
Le serveur écoute sur `http://localhost:4200/`.

## Build de production
```bash
npm run build -- --configuration production
```
Les artefacts sont générés dans `dist/budget-frontend`.

## Tests & lint
```bash
npm test
npm run lint
```

## Architecture
- `src/app/core`: services, guards et modèles partagés.
- `src/app/features`: composants fonctionnels (auth, dashboard, etc.).
- `src/app/shared`: composants UI réutilisables.

## Gestion des variables d'environnement
Les valeurs sont injectées à l'exécution via `environment.generated.ts`. Ne pas modifier ce fichier manuellement ; éditer `.env` puis relancer `npm start` ou `npm run build`.
