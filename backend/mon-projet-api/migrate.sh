#!/bin/bash
# Script simple : Fresh + Migrate (supprime toutes les tables et ré-exécute les migrations)

# Copier .env.docker vers .env si .env n'existe pas
if [ ! -f .env ]; then
    echo "📋 Création du fichier .env depuis .env.docker..."
    cp .env.docker .env
    echo "✅ Fichier .env créé"
fi

# Vérifier si APP_KEY est vide et générer si nécessaire
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "🔑 Génération de la clé d'application Laravel..."
    docker compose up -d
    docker compose exec app php artisan key:generate
    echo "✅ Clé générée"
fi

docker compose exec app php artisan migrate:fresh --force
