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
        Schema::table('signalement', function (Blueprint $table) {
            $table->boolean('is_deleted')->default(false)->after('commentaire');
            $table->timestamp('last_update')->useCurrent()->after('is_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('signalement', function (Blueprint $table) {
            $table->dropColumn(['is_deleted', 'last_update']);
        });
    }
};
