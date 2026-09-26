# Contribuer à Babydja

## Workflow Git
1. Créer une branche depuis `main` : `feat/<ticket>` ou `fix/<ticket>`
2. Commits conventionnels : `feat:`, `fix:`, `chore:`, `docs:`
3. Ouvrir une PR vers `main` — la CI doit passer
4. Revue par un autre contributeur avant merge

## Règles
- Jamais de secrets dans le code — tout passe par `.env` (ignoré par git)
- Toute modification de `schema.prisma` inclut une migration
- Pas de fichiers binaires lourds (images > 1 Mo) — utiliser le stockage média
- Tests pour les chemins critiques (réservation, paiement)

## Environnement
Voir le README. Docker fournit Postgres + Redis.
