<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // USERS (bez unique i bez FK).
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email');          // unique se dodaje kasnije.
            $table->string('password');

            $table->string('role')->nullable();       // client | freelancer | admin (po potrebi).
            $table->string('status')->nullable();     // active/inactive itd.
            $table->string('image_url')->nullable();

            $table->text('description')->nullable();
            $table->text('skills')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        // CATEGORIES (bez unique).
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // unique se dodaje kasnije.
            $table->timestamps();
        });

        // PROJECTS (bez FK).
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('budget', 12, 2)->nullable();
            $table->string('status')->nullable();
            $table->string('image_url')->nullable();

            // FK kolone, ali bez FK ograničenja u ovoj migraciji.
            $table->unsignedBigInteger('client_id');   // users.id
            $table->unsignedBigInteger('category_id'); // categories.id

            $table->timestamps();
        });

        // OFFERS (bez FK).
        Schema::create('offers', function (Blueprint $table) {
            $table->id();

            $table->decimal('price', 12, 2);
            $table->text('comment')->nullable();
            $table->string('status')->nullable();
            $table->dateTime('date_and_time')->nullable();

            // FK kolone, ali bez FK ograničenja u ovoj migraciji.
            $table->unsignedBigInteger('freelancer_id'); // users.id
            $table->unsignedBigInteger('project_id');    // projects.id

            $table->timestamps();
        });

        // REVIEWS (bez FK).
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            $table->unsignedTinyInteger('grade'); // npr. 1-5.
            $table->text('comment')->nullable();
            $table->dateTime('date_and_time')->nullable();

            // FK kolone, ali bez FK ograničenja u ovoj migraciji.
            $table->unsignedBigInteger('client_id');     // users.id
            $table->unsignedBigInteger('freelancer_id'); // users.id
            $table->unsignedBigInteger('project_id');    // projects.id

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('offers');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('users');
    }
};
