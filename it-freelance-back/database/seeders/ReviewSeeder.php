<?php

namespace Database\Seeders;

use App\Models\Offer;
use App\Models\Project;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::where('role', 'client')->get();
        $freelancers = User::where('role', 'freelancer')->get();
        $projects = Project::all();

        if ($clients->isEmpty() || $freelancers->isEmpty() || $projects->isEmpty()) {
            return;
        }

        // Za svaki projekat napravi 0-2 review-a.
        foreach ($projects as $project) {
            $count = rand(0, 2);

            for ($i = 0; $i < $count; $i++) {
                $clientId = $project->client_id;

                // Logičnije. Ako projekat ima offer-e, uzmi freelancera iz nekog offer-a.
                $offerFreelancerId = Offer::where('project_id', $project->id)->inRandomOrder()->value('freelancer_id');
                $freelancerId = $offerFreelancerId ?? $freelancers->random()->id;

                // Unique zaštita. Ne pravimo isti (project_id, client_id, freelancer_id) dva puta.
                $exists = Review::where('project_id', $project->id)
                    ->where('client_id', $clientId)
                    ->where('freelancer_id', $freelancerId)
                    ->exists();

                if ($exists) {
                    continue;
                }

                Review::factory()->create([
                    'project_id' => $project->id,
                    'client_id' => $clientId,
                    'freelancer_id' => $freelancerId,
                ]);
            }
        }
    }
}
