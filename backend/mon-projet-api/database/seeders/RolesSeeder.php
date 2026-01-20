<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insertOrIgnore([
            ['libelle' => 'UTILISATEUR', 'created_at' => now(), 'updated_at' => now()],
            ['libelle' => 'MANAGER', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
