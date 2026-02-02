<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReviewResource;
use App\Models\Offer;
use App\Models\Project;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Lista review-a za projekat.
    public function indexByProject(Project $project)
    {
        $reviews = Review::with(['client', 'freelancer'])
            ->where('project_id', $project->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista utisaka za projekat.',
            'data' => [
                'project_id' => $project->id,
                'reviews' => ReviewResource::collection($reviews),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'client') {
            abort(403, 'Samo client može da ostavi review.');
        }

        // Client može da ocenjuje samo svoj projekat.
        if ($project->client_id !== $user->id) {
            abort(403, 'Možeš ostaviti review samo za svoj projekat.');
        }

        $validated = $request->validate([
            'freelancer_id' => ['required', 'integer', 'exists:users,id'],
            'grade' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:3000'],
        ]);

        // Freelancer mora imati bar jedan offer na tom projektu.
        $hasOffer = Offer::where('project_id', $project->id)
            ->where('freelancer_id', $validated['freelancer_id'])
            ->exists();

        if (! $hasOffer) {
            return response()->json([
                'success' => false,
                'message' => 'Ne možeš ostaviti review za ovog freelancera.',
                'errors' => ['freelancer' => ['Freelancer nema ponudu na ovom projektu.']],
            ], 422);
        }

        $review = Review::create([
            'grade' => $validated['grade'],
            'comment' => $validated['comment'] ?? null,
            'date_and_time' => now(),
            'client_id' => $user->id,
            'freelancer_id' => $validated['freelancer_id'],
            'project_id' => $project->id,
        ]);

        $review->load(['client', 'freelancer', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Review dodat.',
            'data' => ['review' => new ReviewResource($review)],
        ], 201);
    }
}
