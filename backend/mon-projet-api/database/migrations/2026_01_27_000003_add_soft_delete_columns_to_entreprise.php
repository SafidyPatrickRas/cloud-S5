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
        Schema::table('entreprise', function (Blueprint $table) {
            $table->boolean('is_deleted')->default(false)->after('email');
            $table->timestamp('last_update')->useCurrent()->after('is_deleted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entreprise', function (Blueprint $table) {
            $table->dropColumn(['is_deleted', 'last_update']);
        });
    }
};
