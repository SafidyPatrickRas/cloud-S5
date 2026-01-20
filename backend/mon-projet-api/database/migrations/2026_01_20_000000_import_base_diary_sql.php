<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create PostGIS and uuid extensions if they don't exist
        DB::statement('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');

        // Roles
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            libelle VARCHAR(50) NOT NULL UNIQUE,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );
        SQL
        );

        // Users (use uuid default if function exists)
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            nom VARCHAR(100),
            prenom VARCHAR(100),
            blocked BOOLEAN NOT NULL DEFAULT false,
            role_id INTEGER NOT NULL,
            failed_attempts INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles (id)
        );
        SQL
        );

        // Login attempts
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS login_attempts (
            id SERIAL PRIMARY KEY,
            user_id UUID NOT NULL,
            attempts INTEGER NOT NULL DEFAULT 0,
            blocked_until TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        SQL
        );

        // Session table
        // note: users.id in the project migrations is an integer (bigint), so use BIGINT for the FK to avoid type mismatch
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS session (
            id_session UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id BIGINT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_valid BOOLEAN DEFAULT TRUE,
            CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        SQL
        );

        // Entreprise
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS entreprise (
            id_entreprise SERIAL PRIMARY KEY,
            nom VARCHAR(150) NOT NULL,
            contact VARCHAR(150),
            telephone VARCHAR(50),
            email VARCHAR(150)
        );
        SQL
        );

        // Probleme routier with geometry column
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS probleme_routier (
            id_probleme UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            geom geometry(Point, 4326) NOT NULL,
            status VARCHAR(20) CHECK (status IN ('NOUVEAU','EN_COURS','TERMINE')) DEFAULT 'NOUVEAU',
            surface_m2 NUMERIC(10,2),
            budget NUMERIC(14,2),
            id_entreprise INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_probleme_entreprise FOREIGN KEY (id_entreprise) REFERENCES entreprise (id_entreprise) ON DELETE SET NULL
        );
        SQL
        );

        // Spatial index
        DB::statement('CREATE INDEX IF NOT EXISTS idx_probleme_geom ON probleme_routier USING GIST (geom)');

        // Signalement
        // use BIGINT for user reference to match existing users.id type
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS signalement (
            id_signalement UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            id_probleme UUID NOT NULL,
            user_id BIGINT,
            date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            source VARCHAR(20) CHECK (source IN ('LOCAL','FIREBASE')) DEFAULT 'LOCAL',
            commentaire TEXT,
            CONSTRAINT fk_signalement_probleme FOREIGN KEY (id_probleme) REFERENCES probleme_routier (id_probleme) ON DELETE CASCADE,
            CONSTRAINT fk_signalement_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
        );
        SQL
        );

        // Sync log
        // use BIGINT for manager reference to match existing users.id type
        DB::statement(<<<'SQL'
        CREATE TABLE IF NOT EXISTS sync_log (
            id_sync SERIAL PRIMARY KEY,
            type_sync VARCHAR(10) CHECK (type_sync IN ('PUSH','PULL')),
            date_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            manager_id BIGINT NOT NULL,
            resultat VARCHAR(10) CHECK (resultat IN ('SUCCESS','ERROR')),
            details TEXT,
            CONSTRAINT fk_sync_manager FOREIGN KEY (manager_id) REFERENCES users (id)
        );
        SQL
        );

        // Views
        DB::statement(<<<'SQL'
        CREATE OR REPLACE VIEW v_carte_probleme AS
        SELECT
            p.id_probleme,
            ST_Y(p.geom) AS latitude,
            ST_X(p.geom) AS longitude,
            p.status,
            p.surface_m2,
            p.budget,
            e.nom AS entreprise
        FROM probleme_routier p
        LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise;
        SQL
        );

        DB::statement(<<<'SQL'
        CREATE OR REPLACE VIEW v_recap_probleme AS
        SELECT
            COUNT(*) AS nb_points,
            SUM(surface_m2) AS total_surface,
            SUM(budget) AS total_budget,
            ROUND((SUM(CASE WHEN status='TERMINE' THEN 1 ELSE 0 END)::NUMERIC * 100) / NULLIF(COUNT(*),0), 2) AS avancement_pct
        FROM probleme_routier;
        SQL
        );

        // Initial data: roles and default manager (use upsert to avoid duplicates)
        DB::statement("INSERT INTO roles (libelle, created_at, updated_at) VALUES ('UTILISATEUR', NOW(), NOW()) ON CONFLICT (libelle) DO NOTHING");
        DB::statement("INSERT INTO roles (libelle, created_at, updated_at) VALUES ('MANAGER', NOW(), NOW()) ON CONFLICT (libelle) DO NOTHING");

        // Insert default manager row in a safe way: adapt to existing users table column names
        if (Schema::hasTable('users')) {
            $roleId = DB::table('roles')->where('libelle', 'MANAGER')->value('id');
            $email = 'manager@travaux.mg';
            $data = [
                'role_id' => $roleId,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // optional columns: only add if the column exists in the users table
            if (Schema::hasColumn('users', 'nom')) {
                $data['nom'] = 'Admin';
            }
            if (Schema::hasColumn('users', 'prenom')) {
                $data['prenom'] = 'Manager';
            }
            if (Schema::hasColumn('users', 'blocked')) {
                $data['blocked'] = false;
            }
            if (Schema::hasColumn('users', 'failed_attempts')) {
                $data['failed_attempts'] = 0;
            }

            if (Schema::hasColumn('users', 'password_hash')) {
                $data['password_hash'] = 'HASH_A_REMPLACER';
            } elseif (Schema::hasColumn('users', 'password')) {
                $data['password'] = 'HASH_A_REMPLACER';
            }

            DB::table('users')->updateOrInsert(['email' => $email], $data);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop views and tables (if they exist)
        DB::statement('DROP VIEW IF EXISTS v_carte_probleme');
        DB::statement('DROP VIEW IF EXISTS v_recap_probleme');

        Schema::dropIfExists('sync_log');
        Schema::dropIfExists('signalement');
        Schema::dropIfExists('probleme_routier');
        Schema::dropIfExists('entreprise');
        Schema::dropIfExists('session');
        Schema::dropIfExists('login_attempts');
        // Note: do not drop users/roles by default to avoid removing application data
    }
};
