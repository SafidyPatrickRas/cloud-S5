<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signale_probleme', function (Blueprint $table) {
            $table->unsignedInteger('Id_signalement');
            $table->unsignedInteger('Id_probleme');

            $table->primary(['Id_signalement', 'Id_probleme']);
            $table->foreign('Id_signalement')->references('Id_signalement')->on('signalement');
            $table->foreign('Id_probleme')->references('Id_probleme')->on('probleme');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signale_probleme');
    }
};
