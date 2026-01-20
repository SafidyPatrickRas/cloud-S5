<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_log', function (Blueprint $table) {
            $table->id('id_sync');
            $table->string('type_sync', 10);
            $table->timestamp('date_sync')->useCurrent();
            $table->uuid('manager_id');
            $table->string('resultat', 10)->nullable();
            $table->text('details')->nullable();

            $table->foreign('manager_id')
                  ->references('id')
                  ->on('users');
        });

        // Ajouter les contraintes CHECK
        DB::statement("ALTER TABLE sync_log ADD CONSTRAINT check_type_sync CHECK (type_sync IN ('PUSH', 'PULL'))");
        DB::statement("ALTER TABLE sync_log ADD CONSTRAINT check_resultat CHECK (resultat IN ('SUCCESS', 'ERROR'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_log');
    }
};
