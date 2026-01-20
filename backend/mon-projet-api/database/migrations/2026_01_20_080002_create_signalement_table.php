<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signalement', function (Blueprint $table) {
            $table->uuid('id_signalement')->primary();
            $table->uuid('id_probleme');
            $table->uuid('user_id')->nullable();
            $table->timestamp('date_signalement')->useCurrent();
            $table->text('commentaire')->nullable();

            $table->foreign('id_probleme')
                  ->references('id_probleme')
                  ->on('probleme_routier')
                  ->onDelete('cascade');
            
            $table->foreign('user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signalement');
    }
};
