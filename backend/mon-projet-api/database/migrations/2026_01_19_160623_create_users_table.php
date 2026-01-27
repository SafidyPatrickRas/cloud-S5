<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('nom', 100)->nullable();
            $table->string('prenom', 100)->nullable();
            $table->boolean('blocked')->default(false);
            $table->foreignId('role_id')->constrained('roles');
            $table->integer('failed_attempts')->default(0);
            $table->boolean('is_deleted')->default(false);
            $table->timestamp('last_update')->nullable();
            $table->string('firebase_uid')->nullable()->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
