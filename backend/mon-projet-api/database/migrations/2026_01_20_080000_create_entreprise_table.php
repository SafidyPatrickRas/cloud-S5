<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entreprise', function (Blueprint $table) {
            $table->id('id_entreprise');
            $table->string('nom', 150);
            $table->string('contact', 150)->nullable();
            $table->string('telephone', 50)->nullable();
            $table->string('email', 150)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entreprise');
    }
};
