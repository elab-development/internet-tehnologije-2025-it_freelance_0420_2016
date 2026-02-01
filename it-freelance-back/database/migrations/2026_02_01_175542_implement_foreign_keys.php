<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // PROJECTS -> users, categories.
        Schema::table('projects', function (Blueprint $table) {
            $table->foreign('client_id', 'fk_projects_client_id')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('category_id', 'fk_projects_category_id')
                ->references('id')->on('categories')
                ->onDelete('restrict');
        });

        // OFFERS -> users, projects.
        Schema::table('offers', function (Blueprint $table) {
            $table->foreign('freelancer_id', 'fk_offers_freelancer_id')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('project_id', 'fk_offers_project_id')
                ->references('id')->on('projects')
                ->onDelete('cascade');
        });

        // REVIEWS -> users, projects.
        Schema::table('reviews', function (Blueprint $table) {
            $table->foreign('client_id', 'fk_reviews_client_id')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('freelancer_id', 'fk_reviews_freelancer_id')
                ->references('id')->on('users')
                ->onDelete('cascade');

            $table->foreign('project_id', 'fk_reviews_project_id')
                ->references('id')->on('projects')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign('fk_reviews_client_id');
            $table->dropForeign('fk_reviews_freelancer_id');
            $table->dropForeign('fk_reviews_project_id');
        });

        Schema::table('offers', function (Blueprint $table) {
            $table->dropForeign('fk_offers_freelancer_id');
            $table->dropForeign('fk_offers_project_id');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropForeign('fk_projects_client_id');
            $table->dropForeign('fk_projects_category_id');
        });
    }
};
