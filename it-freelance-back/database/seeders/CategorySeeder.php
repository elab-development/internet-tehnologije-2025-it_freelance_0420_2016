<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Primer kategorija (čitljivo i jasno).
        $names = ['Web Development', 'Design', 'Writing'];

        foreach ($names as $name) {
            Category::create(['name' => $name]);
        }
    }
}
