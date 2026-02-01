<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OfferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'price' => fake()->numberBetween(100, 4000),
            'comment' => fake()->sentence(10),
            'status' => fake()->randomElement(['pending', 'accepted', 'rejected']),
            'date_and_time' => fake()->dateTimeBetween('-30 days', 'now'),

            // Freelancer je user sa rolom freelancer.
            'freelancer_id' => User::query()->where('role', 'freelancer')->inRandomOrder()->value('id')
                ?? User::factory()->freelancer(),

            // Offer je za tačno jedan projekat.
            'project_id' => Project::query()->inRandomOrder()->value('id')
                ?? Project::factory(),
        ];
    }
}
