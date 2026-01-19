# Se connecter depuis le container PostgreSQL

```bash
	docker compose exec postgres psql -U laravel -d laravel
```
# Migration

```bash
	docker compose exec app php artisan migrate
```

# Postgres 

## supprimer toutes les tables

```bash
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

```

# Swagger 

## reload swagger 

```bash
	
	docker compose exec app php artisan l5-swagger:generate 

```

## lien swagger

```bash
	
	http://localhost:8000/api/documentation 

```


