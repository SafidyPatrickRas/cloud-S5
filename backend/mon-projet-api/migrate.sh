# lancement docker
sudo docker compose up -d
# Supprime toutes les tables, relance les migrations et les seeders
sudo docker compose exec app php artisan migrate:fresh --seed --force

echo "✅ Migration terminée !"
