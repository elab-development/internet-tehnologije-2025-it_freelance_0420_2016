<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    public function definition(): array
    {
        return [
            'grade' => fake()->numberBetween(1, 5),
            'comment' => fake()->sentence(12),
            'date_and_time' => fake()->dateTimeBetween('-30 days', 'now'),

            // Review se odnosi na jednog client user-a.
            'client_id' => User::query()->where('role', 'client')->inRandomOrder()->value('id')
                ?? User::factory()->client(),

            // Review se odnosi na jednog freelancer user-a.
            'freelancer_id' => User::query()->where('role', 'freelancer')->inRandomOrder()->value('id')
                ?? User::factory()->freelancer(),

            // Review se odnosi na jedan projekat.
            'project_id' => Project::query()->inRandomOrder()->value('id')
                ?? Project::factory(),
        ];
    }
}
