<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\MetricsController;
use Illuminate\Support\Facades\Route;

// Auth.
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Public (svi mogu da gledaju).
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project}', [ProjectController::class, 'show']);

Route::get('/projects/{project}/offers', [OfferController::class, 'indexByProject']);
Route::get('/projects/{project}/reviews', [ReviewController::class, 'indexByProject']);

// Protected (samo ulogovani).
Route::middleware('auth:sanctum')->group(function () {

    // Auth.
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Categories (admin-only logika je u kontroleru).
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Projects (client-only logika je u kontroleru).
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);

    // Offers (freelancer-only logika je u kontroleru).
    Route::post('/projects/{project}/offers', [OfferController::class, 'store']);
    Route::put('/offers/{offer}', [OfferController::class, 'update']);
    Route::delete('/offers/{offer}', [OfferController::class, 'destroy']);

    // Reviews (client-only logika je u kontroleru).
    Route::post('/projects/{project}/reviews', [ReviewController::class, 'store']);

    // Metrics (admin-only logika je u kontroleru).
    Route::get('/metrics/dashboard', [MetricsController::class, 'dashboard']);
});
