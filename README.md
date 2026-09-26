# Babydja 🇨🇮

Plateforme de réservation multi-tenant pour **hôtels et locations de véhicules**
en Côte d'Ivoire — paiements Mobile Money (CinetPay), notifications SMS
(Africa's Talking), parrainage et messagerie temps réel.

## Architecture

- **apps/api** — NestJS 10, Prisma (PostgreSQL), Redis, BullMQ, Socket.IO, Swagger
- **apps/web** — Next.js 16, React 19, Tailwind 4, React Query, Zustand, PWA

Monorepo npm workspaces.

## Démarrage

```bash
# 1. Infrastructure (Postgres + Redis)
docker compose up -d

# 2. Variables d'environnement
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# renseigner les secrets (JWT, Google OAuth, CinetPay, R2, Firebase...)

# 3. Dépendances + base de données
npm install
npm run prisma:migrate --workspace=apps/api
npm run prisma:seed --workspace=apps/api

# 4. Lancer
npm run dev:api   # http://localhost:3001/api/v1 (docs: /api/docs)
npm run dev:web   # http://localhost:3000
```

## Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev:api` / `dev:web` | Développement |
| `npm run build:api` / `build:web` | Build production |
| `npm run test:api` | Tests unitaires API |
| `npm run prisma:studio` | Explorateur de base de données |

## Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md). CI obligatoire sur chaque PR.
