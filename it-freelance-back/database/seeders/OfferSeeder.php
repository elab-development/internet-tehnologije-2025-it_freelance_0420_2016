<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    public function run(): void
    {
        $freelancers = User::where('role', 'freelancer')->get();
        $projects = Project::all();

        if ($freelancers->isEmpty() || $projects->isEmpty()) {
            return;
        }

        // Za svaki projekat napravi 0-3 offer-a.
        foreach ($projects as $project) {
            $count = rand(0, 3);

            for ($i = 0; $i < $count; $i++) {
                Offer::factory()->create([
                    'project_id' => $project->id,
                    'freelancer_id' => $freelancers->random()->id,
                ]);
            }
        }
    }
}
