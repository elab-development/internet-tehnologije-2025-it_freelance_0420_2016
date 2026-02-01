<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),

            'role' => 'client',
            'status' => 'active',
            'image_url' => fake()->imageUrl(300, 300, 'people', true),
            'description' => fake()->sentence(10),
            'skills' => fake()->words(5, true),
        ];
    }

    public function client(): static
    {
        return $this->state(fn () => [
            'role' => 'client',
        ]);
    }

    public function freelancer(): static
    {
        return $this->state(fn () => [
            'role' => 'freelancer',
        ]);
    }
}
