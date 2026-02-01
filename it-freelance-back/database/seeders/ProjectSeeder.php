<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $clients = User::where('role', 'client')->get();
        $categories = Category::all();

        // Ako nema klijenata ili kategorija, nema smisla praviti projekte.
        if ($clients->isEmpty() || $categories->isEmpty()) {
            return;
        }

        // Napravi 10 projekata.
        Project::factory()->count(10)->make()->each(function ($project) use ($clients, $categories) {
            $project->client_id = $clients->random()->id;
            $project->category_id = $categories->random()->id;
            $project->save();
        });
    }
}
