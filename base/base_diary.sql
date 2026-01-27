/* =========================================================
PROJET : Application de suivi des travaux routiers
VILLE  : Antananarivo
SGBD   : PostgreSQL + PostGIS
========================================================= */

/* =========================
EXTENSIONS
========================= */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS postgis;

/* =========================
TABLE ROLES
========================= */
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL UNIQUE
);

/* =========================
TABLE UTILISATEURS
========================= */
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    blocked BOOLEAN NOT NULL DEFAULT false,
    role_id INTEGER NOT NULL,
    failed_attempts INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

/* =========================
TABLE LOGIN ATTEMPTS
========================= */
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    blocked_until TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

/* =========================
TABLE SESSION
========================= */
CREATE TABLE session (
    id_session UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

/* =========================
TABLE ENTREPRISE
========================= */
CREATE TABLE entreprise (
    id_entreprise SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    contact VARCHAR(150),
    telephone VARCHAR(50),
    email VARCHAR(150),
    is_deleted BOOLEAN DEFAULT FALSE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =========================
TABLE PROBLEME ROUTIER (POINT CARTOGRAPHIQUE)
========================= */
CREATE TABLE probleme_routier (
    id_probleme UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    geom GEOMETRY (Point, 4326) NOT NULL,
    status VARCHAR(20) CHECK (
        status IN (
            'NOUVEAU',
            'EN_COURS',
            'TERMINE'
        )
    ) DEFAULT 'NOUVEAU',
    surface_m2 NUMERIC (10, 2),
    budget NUMERIC (14, 2),
    lieu VARCHAR(255),
    description TEXT,
    id_entreprise INT,
    is_deleted BOOLEAN DEFAULT FALSE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_probleme_entreprise FOREIGN KEY (id_entreprise) REFERENCES entreprise (id_entreprise) ON DELETE SET NULL
);

/* =========================
INDEX SPATIAL (PostGIS)
========================= */
CREATE INDEX idx_probleme_geom ON probleme_routier USING GIST (geom);

/* =========================
TABLE SIGNALEMENT (ACTION UTILISATEUR)
========================= */
CREATE TABLE signalement (
    id_signalement UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    id_probleme UUID NOT NULL,
    user_id UUID,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commentaire TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_signalement_probleme FOREIGN KEY (id_probleme) REFERENCES probleme_routier (id_probleme) ON DELETE CASCADE,
    CONSTRAINT fk_signalement_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

/* =========================
TABLE SYNC LOG
========================= */
CREATE TABLE sync_log (
    id_sync SERIAL PRIMARY KEY,
    type_sync VARCHAR(10) CHECK (type_sync IN ('PUSH', 'PULL')),
    date_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    manager_id UUID NOT NULL,
    resultat VARCHAR(10) CHECK (
        resultat IN ('SUCCESS', 'ERROR')
    ),
    details TEXT,
    CONSTRAINT fk_sync_manager FOREIGN KEY (manager_id) REFERENCES users (id)
);

/* =========================
VUE CARTE (POINTS + INFOS)
========================= */
CREATE VIEW v_carte_probleme AS
SELECT
    p.id_probleme,
    ST_Y (p.geom) AS latitude,
    ST_X (p.geom) AS longitude,
    p.status,
    p.surface_m2,
    p.budget,
    p.lieu,
    p.description,
    p.is_deleted,
    p.last_update,
    e.nom AS entreprise
FROM
    probleme_routier p
    LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise
WHERE p.is_deleted = FALSE;

/* =========================
VUE RECAP
========================= */
CREATE VIEW v_recap_probleme AS
SELECT
    COUNT(*) AS nb_points,
    SUM(surface_m2) AS total_surface,
    SUM(budget) AS total_budget,
    ROUND(
        (SUM(CASE WHEN status='TERMINE' THEN 1 ELSE 0 END)::NUMERIC * 100)
        / NULLIF(COUNT(*),0), 2
    ) AS avancement_pct
FROM probleme_routier
WHERE is_deleted = FALSE;

/* =========================
DONNÉES INITIALES
========================= */
-- Roles par défaut
INSERT INTO roles (libelle) VALUES ('UTILISATEUR'), ('MANAGER');

-- Manager par défaut
INSERT INTO
    users (
        email,
        password_hash,
        nom,
        prenom,
        role_id
    )
VALUES (
        'manager@travaux.mg',
        'HASH_A_REMPLACER',
        'Admin',
        'Manager',
        (
            SELECT id
            FROM roles
            WHERE
                libelle = 'MANAGER'
        )
    );

/* =========================================================
FIN DU SCRIPT
========================================================= */