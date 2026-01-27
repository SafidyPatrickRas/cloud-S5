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
        Schema::table('probleme_routier', function (Blueprint $table) {
            $table->string('lieu', 255)->nullable()->after('budget');
            $table->text('description')->nullable()->after('lieu');
            $table->boolean('is_deleted')->default(false)->after('description');
            $table->timestamp('last_update')->useCurrent()->after('is_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('probleme_routier', function (Blueprint $table) {
            $table->dropColumn(['lieu', 'description', 'is_deleted', 'last_update']);
        });
    }
};
