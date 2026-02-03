<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('probleme', function (Blueprint $table) {
            $table->increments('Id_probleme');
            $table->dateTime('create_at')->nullable();
            $table->dateTime('update_at')->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->decimal('budget', 15, 2)->nullable();
            $table->decimal('surface', 15, 2)->nullable();
            $table->unsignedInteger('Id_entreprise');

            $table->foreign('Id_entreprise')->references('Id_entreprise')->on('entreprise');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('probleme');
    }
};
