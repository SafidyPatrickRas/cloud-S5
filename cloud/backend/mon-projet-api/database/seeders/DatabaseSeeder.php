<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('role')->insert([
            [
                'libelle' => 'ADMIN',
                'niveau' => '10',
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => false
            ],
            [
                'libelle' => 'UTILISATEUR',
                'niveau' => '1',
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => false
            ]
        ]);

        DB::table('entreprise')->insert([
            [
                'nom' => 'Feno SARL',
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => false
            ],
            [
                'nom' => 'Mapk SA',
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => false
            ]
        ]);

        DB::table('status')->insert([
            [
                'libelle' => 'Nouveau',
                'niveau' => 1,
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => 'non'
            ],
            [
                'libelle' => 'En cours',
                'niveau' => 2,
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => 'non'
            ]
        ]);

        DB::table('utilisateur')->insert([
            [
                'email' => 'admin@example.com',
                'mdp' => Hash::make('password'),
                'create_at' => $now,
                'update_at' => $now,
                'id_deleted' => false,
                'fire_user_id' => 'firebase_admin_01',
                'Id_role' => 1
            ],
            [
                'email' => 'agent@example.com',
                'mdp' => Hash::make('password'),
                'create_at' => $now,
                'update_at' => $now,
                'id_deleted' => false,
                'fire_user_id' => 'firebase_agent_01',
                'Id_role' => 2
            ]
        ]);

        DB::table('signalement')->insert([
            [
                'create_at' => $now,
                'update_at' => $now,
                'position_' => '-18.8792,47.5079',
                'commentaire' => 'Route dégradée',
                'is_deleted' => false,
                'Id_status' => 1,
                'Id_utilisateur' => 1
            ],
            [
                'create_at' => $now,
                'update_at' => $now,
                'position_' => '-18.9100,47.5200',
                'commentaire' => 'Poteau endommagé',
                'is_deleted' => false,
                'Id_status' => 2,
                'Id_utilisateur' => 2
            ]
        ]);

        DB::table('probleme')->insert([
            [
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => false,
                'budget' => 15000.50,
                'surface' => 120.75,
                'Id_entreprise' => 1,
                'Id_signalement' => 1
            ],
            [
                'create_at' => $now,
                'update_at' => $now,
                'is_deleted' => false,
                'budget' => 8000.00,
                'surface' => 60.50,
                'Id_entreprise' => 2,
                'Id_signalement' => 2
            ]
        ]);
    }
}
