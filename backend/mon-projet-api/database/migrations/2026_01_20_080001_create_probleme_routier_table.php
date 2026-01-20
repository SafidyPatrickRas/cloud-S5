<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Activer PostGIS
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');
        
        Schema::create('probleme_routier', function (Blueprint $table) {
            $table->uuid('id_probleme')->primary();
            // La colonne geometry sera ajoutée via raw SQL pour PostGIS
            $table->string('status', 20)->default('NOUVEAU');
            $table->decimal('surface_m2', 10, 2)->nullable();
            $table->decimal('budget', 14, 2)->nullable();
            $table->unsignedBigInteger('id_entreprise')->nullable();
            $table->timestamps();

            $table->foreign('id_entreprise')
                  ->references('id_entreprise')
                  ->on('entreprise')
                  ->onDelete('set null');
        });

        // Ajouter la colonne géométrique avec PostGIS
        DB::statement('ALTER TABLE probleme_routier ADD COLUMN geom GEOMETRY(Point, 4326) NOT NULL');
        
        // Créer l'index spatial
        DB::statement('CREATE INDEX idx_probleme_geom ON probleme_routier USING GIST (geom)');
        
        // Ajouter la contrainte CHECK pour le status
        DB::statement("ALTER TABLE probleme_routier ADD CONSTRAINT check_status CHECK (status IN ('NOUVEAU', 'EN_COURS', 'TERMINE'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('probleme_routier');
    }
};
