<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entreprise', function (Blueprint $table) {
            $table->increments('Id_entreprise');
            $table->string('nom', 100)->nullable();
            $table->dateTime('create_at')->nullable();
            $table->dateTime('update_at')->nullable();
            $table->boolean('is_deleted')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entreprise');
    }
};
