<?php

namespace App\Http\Controllers;

use App\Http\Resources\OfferResource;
use App\Models\Offer;
use App\Models\Project;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    // Lista offer-a za jedan projekat.
    public function indexByProject(Project $project)
    {
        $offers = Offer::with(['freelancer'])
            ->where('project_id', $project->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista ponuda za projekat.',
            'data' => [
                'project_id' => $project->id,
                'offers' => OfferResource::collection($offers),
            ],
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'freelancer') {
            abort(403, 'Samo freelancer može da pošalje ponudu.');
        }

        $validated = $request->validate([
            'price' => ['required', 'numeric', 'min:0'],
            'comment' => ['nullable', 'string', 'max:3000'],
        ]);

        $offer = Offer::create([
            'price' => $validated['price'],
            'comment' => $validated['comment'] ?? null,
            'status' => 'pending',
            'date_and_time' => now(),
            'freelancer_id' => $user->id,
            'project_id' => $project->id,
        ]);

        $offer->load(['freelancer', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Ponuda poslata.',
            'data' => ['offer' => new OfferResource($offer)],
        ], 201);
    }

    public function update(Request $request, Offer $offer)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'freelancer') {
            abort(403, 'Samo freelancer može da menja ponudu.');
        }

        if ($offer->freelancer_id !== $user->id) {
            abort(403, 'Možeš menjati samo svoje ponude.');
        }

        // Jednostavno pravilo: menjaš cenu/komentar, status ostaje (ili admin/client kasnije menja).
        $validated = $request->validate([
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'comment' => ['sometimes', 'nullable', 'string', 'max:3000'],
        ]);

        $offer->update($validated);
        $offer->load(['freelancer', 'project']);

        return response()->json([
            'success' => true,
            'message' => 'Ponuda izmenjena.',
            'data' => ['offer' => new OfferResource($offer)],
        ]);
    }

    public function destroy(Request $request, Offer $offer)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'freelancer') {
            abort(403, 'Samo freelancer može da obriše ponudu.');
        }

        if ($offer->freelancer_id !== $user->id) {
            abort(403, 'Možeš obrisati samo svoje ponude.');
        }

        $offer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ponuda obrisana.',
            'data' => null,
        ]);
    }
}
