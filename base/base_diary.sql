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
TABLE UTILISATEUR
========================= */
CREATE TABLE app_user (
    id_user UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    role VARCHAR(20) CHECK (
        role IN ('UTILISATEUR', 'MANAGER')
    ) NOT NULL,
    failed_attempts INT DEFAULT 0,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* =========================
TABLE SESSION
========================= */
CREATE TABLE session (
    id_session UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    id_user UUID NOT NULL,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_session_user FOREIGN KEY (id_user) REFERENCES app_user (id_user) ON DELETE CASCADE
);

/* =========================
TABLE ENTREPRISE
========================= */
CREATE TABLE entreprise (
    id_entreprise SERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    contact VARCHAR(150),
    telephone VARCHAR(50),
    email VARCHAR(150)
);

/* =========================================================
TABLE PROBLEME ROUTIER (LE POINT CARTOGRAPHIQUE)
========================================================= */
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
    id_entreprise INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_probleme_entreprise FOREIGN KEY (id_entreprise) REFERENCES entreprise (id_entreprise) ON DELETE SET NULL
);

/* =========================
INDEX SPATIAL (PostGIS)
========================= */
CREATE INDEX idx_probleme_geom ON probleme_routier USING GIST (geom);

/* =========================================================
TABLE SIGNALEMENT (ACTION UTILISATEUR)
========================================================= */
CREATE TABLE signalement (
    id_signalement UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    id_probleme UUID NOT NULL,
    id_user UUID,
    date_signalement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(20) CHECK (
        source IN ('LOCAL', 'FIREBASE')
    ) DEFAULT 'LOCAL',
    commentaire TEXT,
    CONSTRAINT fk_signalement_probleme FOREIGN KEY (id_probleme) REFERENCES probleme_routier (id_probleme) ON DELETE CASCADE,
    CONSTRAINT fk_signalement_user FOREIGN KEY (id_user) REFERENCES app_user (id_user) ON DELETE SET NULL
);

/* =========================================================
TABLE SYNC LOG
========================================================= */
CREATE TABLE sync_log (
    id_sync SERIAL PRIMARY KEY,
    type_sync VARCHAR(10) CHECK (type_sync IN ('PUSH', 'PULL')),
    date_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_manager UUID NOT NULL,
    resultat VARCHAR(10) CHECK (
        resultat IN ('SUCCESS', 'ERROR')
    ),
    details TEXT,
    CONSTRAINT fk_sync_manager FOREIGN KEY (id_manager) REFERENCES app_user (id_user)
);

/* =========================================================
VUE CARTE (POINTS + INFOS)
========================================================= */
CREATE VIEW v_carte_probleme AS
SELECT
    p.id_probleme,
    ST_Y (p.geom) AS latitude,
    ST_X (p.geom) AS longitude,
    p.status,
    p.surface_m2,
    p.budget,
    e.nom AS entreprise
FROM
    probleme_routier p
    LEFT JOIN entreprise e ON p.id_entreprise = e.id_entreprise;

/* =========================================================
VUE RÉCAPITULATIVE
========================================================= */
CREATE VIEW v_recap_probleme AS
SELECT
    COUNT(*) AS nb_points,
    SUM(surface_m2) AS total_surface,
    SUM(budget) AS total_budget,
    ROUND(
        (SUM(CASE WHEN status = 'TERMINE' THEN 1 ELSE 0 END)::NUMERIC * 100)
        / NULLIF(COUNT(*), 0),
        2
    ) AS avancement_pct
FROM probleme_routier;

/* =========================================================
DONNÉE INITIALE : MANAGER PAR DÉFAUT
========================================================= */
INSERT INTO
    app_user (
        email,
        password_hash,
        nom,
        prenom,
        role
    )
VALUES (
        'manager@travaux.mg',
        'HASH_A_REMPLACER',
        'Admin',
        'Manager',
        'MANAGER'
    );

/* =========================================================
FIN DU SCRIPT
========================================================= */