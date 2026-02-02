<?php

namespace App\Http\Controllers;

use App\Http\Resources\MetricsResource;
use App\Models\Category;
use App\Models\Offer;
use App\Models\Project;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    public function dashboard(Request $request)
    {
        // Ako želiš da metrike vidi samo admin, odkomentariši ovo.
        // $user = $request->user();
        // if (! $user || $user->role !== 'admin') {
        //     abort(403, 'Samo admin može da vidi metrike.');
        // }

        // 1) USERS.
        $totalUsers = User::count();
        $clientsCount = User::where('role', 'client')->count();
        $freelancersCount = User::where('role', 'freelancer')->count();
        $adminsCount = User::where('role', 'admin')->count();

        // 2) PROJECTS.
        $totalProjects = Project::count();
        $projectsByStatus = Project::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status ?? 'unknown',
                'total' => (int) $row->total,
            ]);

        // 3) OFFERS.
        $totalOffers = Offer::count();
        $avgOfferPrice = (float) (Offer::avg('price') ?? 0);

        $offersByStatus = Offer::select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status ?? 'unknown',
                'total' => (int) $row->total,
            ]);

        // 4) REVIEWS.
        $totalReviews = Review::count();
        $avgReviewGrade = (float) (Review::avg('grade') ?? 0);

        // 5) TOP LISTE (korisno za dashboard).
        // Top kategorije po broju projekata.
        $topCategories = Category::query()
            ->leftJoin('projects', 'projects.category_id', '=', 'categories.id')
            ->select('categories.id', 'categories.name', DB::raw('COUNT(projects.id) as projects_count'))
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('projects_count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'projects_count' => (int) $row->projects_count,
            ]);

        // Top freelanceri po prosečnoj oceni (min 1 review).
        $topFreelancersByGrade = User::query()
            ->where('role', 'freelancer')
            ->join('reviews', 'reviews.freelancer_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.name',
                DB::raw('AVG(reviews.grade) as avg_grade'),
                DB::raw('COUNT(reviews.id) as reviews_count')
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('avg_grade')
            ->orderByDesc('reviews_count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'avg_grade' => round((float) $row->avg_grade, 2),
                'reviews_count' => (int) $row->reviews_count,
            ]);

        // Top klijenti po broju projekata.
        $topClientsByProjects = User::query()
            ->where('role', 'client')
            ->join('projects', 'projects.client_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.name',
                DB::raw('COUNT(projects.id) as projects_count')
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('projects_count')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'name' => $row->name,
                'projects_count' => (int) $row->projects_count,
            ]);

        $data = [
            'users' => [
                'total' => $totalUsers,
                'clients' => $clientsCount,
                'freelancers' => $freelancersCount,
                'admins' => $adminsCount,
            ],
            'projects' => [
                'total' => $totalProjects,
                'by_status' => $projectsByStatus,
            ],
            'offers' => [
                'total' => $totalOffers,
                'avg_price' => round($avgOfferPrice, 2),
                'by_status' => $offersByStatus,
            ],
            'reviews' => [
                'total' => $totalReviews,
                'avg_grade' => round($avgReviewGrade, 2),
            ],
            'top' => [
                'categories_by_projects' => $topCategories,
                'freelancers_by_grade' => $topFreelancersByGrade,
                'clients_by_projects' => $topClientsByProjects,
            ],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Dashboard metrike.',
            'data' => [
                'metrics' => new MetricsResource($data),
            ],
        ]);
    }
}
