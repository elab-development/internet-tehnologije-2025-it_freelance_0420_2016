<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::with(['category', 'client'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista projekata.',
            'data' => ['projects' => ProjectResource::collection($projects)],
        ]);
    }

    public function show(Project $project)
    {
        $project->load(['category', 'client']);

        return response()->json([
            'success' => true,
            'message' => 'Detalji projekta.',
            'data' => ['project' => new ProjectResource($project)],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'client') {
            abort(403, 'Samo client može da kreira projekat.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:150'],
            'description' => ['nullable', 'string', 'max:5000'],
            'budget' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'string', 'max:50'],
            'image_url' => ['nullable', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
        ]);

        $project = Project::create([
            ...$validated,
            'client_id' => $user->id,
            'status' => $validated['status'] ?? 'open',
        ]);

        $project->load(['category', 'client']);

        return response()->json([
            'success' => true,
            'message' => 'Projekat kreiran.',
            'data' => ['project' => new ProjectResource($project)],
        ], 201);
    }

    public function update(Request $request, Project $project)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'client') {
            abort(403, 'Samo client može da menja projekat.');
        }

        if ($project->client_id !== $user->id) {
            abort(403, 'Možeš menjati samo svoje projekte.');
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:150'],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'budget' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'status' => ['sometimes', 'nullable', 'string', 'max:50'],
            'image_url' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:categories,id'],
        ]);

        $project->update($validated);
        $project->load(['category', 'client']);

        return response()->json([
            'success' => true,
            'message' => 'Projekat izmenjen.',
            'data' => ['project' => new ProjectResource($project)],
        ]);
    }

    public function destroy(Request $request, Project $project)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'client') {
            abort(403, 'Samo client može da obriše projekat.');
        }

        if ($project->client_id !== $user->id) {
            abort(403, 'Možeš obrisati samo svoje projekte.');
        }

        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projekat obrisan.',
            'data' => null,
        ]);
    }
}
