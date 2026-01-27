# lancement docker
docker compose up -d
# Supprime toutes les tables et relance les migrations Laravel
docker compose exec app php artisan migrate:fresh --force

echo "✅ Migration terminée !"
