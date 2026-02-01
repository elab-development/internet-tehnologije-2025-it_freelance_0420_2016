<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unique('email', 'uq_users_email');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->unique('name', 'uq_categories_name');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->unique(
                ['project_id', 'client_id', 'freelancer_id'],
                'uq_reviews_project_client_freelancer'
            );
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique('uq_reviews_project_client_freelancer');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropUnique('uq_categories_name');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('uq_users_email');
        });
    }
};
