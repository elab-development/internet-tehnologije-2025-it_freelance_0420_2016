<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1 admin (fiksan nalog).
        User::create([
            'name' => 'Admin',
            'email' => 'admin@itfreelance.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
            'image_url' => null,
            'description' => 'Administrator sistema.',
            'skills' => null,
        ]);

        // Klijenti.
        User::factory()->count(5)->client()->create();

        // Freelanceri.
        User::factory()->count(8)->freelancer()->create();
    }
}
