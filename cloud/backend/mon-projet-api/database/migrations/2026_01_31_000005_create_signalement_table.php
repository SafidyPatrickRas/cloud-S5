<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signalement', function (Blueprint $table) {
            $table->increments('Id_signalement');
            $table->dateTime('create_at')->nullable();
            $table->dateTime('update_at')->nullable();
            $table->text('position_')->nullable();
            $table->string('commentaire', 200)->nullable();
            $table->boolean('is_deleted')->default(false);
            $table->unsignedInteger('Id_status');
            $table->unsignedInteger('Id_utilisateur');

            $table->foreign('Id_status')->references('Id_status')->on('status');
            $table->foreign('Id_utilisateur')->references('Id_utilisateur')->on('utilisateur');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signalement');
    }
};
