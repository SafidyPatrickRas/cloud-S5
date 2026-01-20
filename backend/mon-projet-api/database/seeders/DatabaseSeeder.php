<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // seed roles and a manager user
        $this->call(\Database\Seeders\RolesSeeder::class);

        // create a manager user if not exists
        \App\Models\User::factory()->create([
            'email' => 'test@example.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role_id' => 2,
            'nom' => 'Test',
            'prenom' => 'User',
        ]);
    }
}
