<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista kategorija.',
            'data' => ['categories' => CategoryResource::collection($categories)],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Samo admin može da kreira kategorije.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $category = Category::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategorija kreirana.',
            'data' => ['category' => new CategoryResource($category)],
        ], 201);
    }

    public function update(Request $request, Category $category)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Samo admin može da menja kategorije.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kategorija izmenjena.',
            'data' => ['category' => new CategoryResource($category)],
        ]);
    }

    public function destroy(Request $request, Category $category)
    {
        $user = $request->user();
        if (! $user || $user->role !== 'admin') {
            abort(403, 'Samo admin može da briše kategorije.');
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategorija obrisana.',
            'data' => null,
        ]);
    }
}
