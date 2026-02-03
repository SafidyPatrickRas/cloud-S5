<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status', function (Blueprint $table) {
            $table->increments('Id_status');
            $table->string('libelle', 50)->nullable();
            $table->integer('niveau')->nullable();
            $table->dateTime('create_at')->nullable();
            $table->dateTime('update_at')->nullable();
            $table->string('is_deleted', 50)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status');
    }
};
