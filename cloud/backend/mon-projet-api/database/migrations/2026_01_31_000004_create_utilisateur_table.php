<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateur', function (Blueprint $table) {
            $table->increments('Id_utilisateur');
            $table->string('email', 150)->nullable();
            $table->string('mdp', 150)->nullable();
            $table->dateTime('create_at')->nullable();
            $table->dateTime('update_at')->nullable();
            $table->boolean('id_deleted')->default(false);
            $table->string('fire_user_id', 50)->nullable();
            $table->unsignedInteger('Id_role');

            $table->foreign('Id_role')->references('Id_role')->on('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateur');
    }
};
