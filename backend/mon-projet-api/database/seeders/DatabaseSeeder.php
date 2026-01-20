<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seeder Roles
        DB::table('roles')->insert([
            ['libelle' => 'UTILISATEUR'],
            ['libelle' => 'MANAGER']
        ]);

        // Seeder Manager par défaut
        $managerId = \Illuminate\Support\Str::uuid()->toString();
        
        DB::table('users')->insert([
            'id' => $managerId,
            'email' => 'manager@travaux.mg',
            'password' => Hash::make('manager123'),
            'nom' => 'Admin',
            'prenom' => 'Manager',
            'role_id' => DB::table('roles')->where('libelle', 'MANAGER')->value('id'),
            'blocked' => false,
            'failed_attempts' => 0,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Créer le LoginAttempt pour le manager
        DB::table('login_attempts')->insert([
            'user_id' => $managerId,
            'attempts' => 0,
            'blocked_until' => null,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Seeder Entreprises
        $entreprises = [
            ['nom' => 'BTP Madagascar', 'contact' => 'Jean Rakoto', 'telephone' => '+261 34 12 345 67', 'email' => 'contact@btpmadagascar.mg'],
            ['nom' => 'Routes & Travaux', 'contact' => 'Marie Razafi', 'telephone' => '+261 33 98 765 43', 'email' => 'info@routestravaux.mg'],
            ['nom' => 'Entreprise Générale', 'contact' => 'Paul Andria', 'telephone' => '+261 32 11 223 344', 'email' => 'generale@entreprise.mg']
        ];

        foreach ($entreprises as $entreprise) {
            DB::table('entreprise')->insert($entreprise);
        }

        // Seeder Problèmes Routiers (exemples à Antananarivo)
        $problemes = [
            [
                'id_probleme' => \Illuminate\Support\Str::uuid()->toString(),
                'geom' => DB::raw("ST_SetSRID(ST_MakePoint(47.5079, -18.8792), 4326)"), // Analakely
                'status' => 'NOUVEAU',
                'surface_m2' => 25.50,
                'budget' => 5000000.00,
                'id_entreprise' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_probleme' => \Illuminate\Support\Str::uuid()->toString(),
                'geom' => DB::raw("ST_SetSRID(ST_MakePoint(47.5361, -18.9134), 4326)"), // Ivato
                'status' => 'EN_COURS',
                'surface_m2' => 50.00,
                'budget' => 10000000.00,
                'id_entreprise' => 2,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id_probleme' => \Illuminate\Support\Str::uuid()->toString(),
                'geom' => DB::raw("ST_SetSRID(ST_MakePoint(47.5205, -18.8655), 4326)"), // Ambohijatovo
                'status' => 'TERMINE',
                'surface_m2' => 15.75,
                'budget' => 3000000.00,
                'id_entreprise' => 3,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($problemes as $probleme) {
            DB::table('probleme_routier')->insert($probleme);
        }
    }
}
