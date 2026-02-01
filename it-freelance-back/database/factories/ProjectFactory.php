<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'budget' => fake()->numberBetween(200, 5000),
            'status' => fake()->randomElement(['open', 'in_progress', 'closed']),
            'image_url' => fake()->imageUrl(600, 400, 'business', true),

            // Važno. Klijent je user sa rolom client.
            'client_id' => User::query()->where('role', 'client')->inRandomOrder()->value('id')
                ?? User::factory()->client(),

            // Projekat pripada jednoj kategoriji.
            'category_id' => Category::query()->inRandomOrder()->value('id')
                ?? Category::factory(),
        ];
    }
}
