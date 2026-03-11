<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    public function definition(): array
    {
    $users = ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZDg6aP4Lhm6eAW3kx5BELXhHYqMRni3vX5A&s",
    "https://img.freepik.com/free-photo/portrait-smiling-businessman-using-digital-tablet-waiting-area_107420-95802.jpg?semt=ais_hybrid&w=740&q=80",
    "https://thumbs.dreamstime.com/b/beautiful-african-american-business-woman-portrait-arms-folded-confident-happy-ceo-cheerful-smiling-businesswoman-corporate-162367854.jpg",
    "https://c8.alamy.com/comp/HPJD8G/square-image-of-well-dressed-young-black-corporate-woman-wearing-a-HPJD8G.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5HWJ7CRaIYS4fDoekfg5qBEHYekMf4qGb1g&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIwqpnILb8_XKsHDMxY5TeaZHZulMz4ufM2Q&s",
    "https://thumbs.dreamstime.com/b/african-american-man-examining-palm-office-desk-paperwork-binders-african-american-man-wearing-pink-shirt-examining-palm-431439864.jpg",
    "https://t3.ftcdn.net/jpg/06/16/55/08/360_F_616550819_rnEcH9vVVcep0dZgvAd3k8nn840uAueP.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRta1teVeO2LZhT0TBJS4wtvi5Q04wTRYQvg&s",
    "https://png.pngtree.com/png-clipart/20250101/original/pngtree-business-woman-full-body-image-png-image_18496455.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPG_ZgmPUDd8B2uDfb66XdozX2R1Cn3rRwXQ&s",
    "https://cdn.create.vista.com/api/media/small/160982490/stock-photo-confident-businesswoman-in-formal-wear",
    "https://as2.ftcdn.net/jpg/06/08/62/63/1000_F_608626357_tlw8plwGbAKiskFGlmvwEniWnUMGiUeL.jpg"];
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),

            'role' => 'client',
            'status' => 'active',
            'image_url' => fake()->randomElement($users),
            'description' => fake()->sentence(10),
            'skills' => fake()->words(5, true),
        ];
    }

    public function client(): static
    {
        return $this->state(fn () => [
            'role' => 'client',
        ]);
    }

    public function freelancer(): static
    {
        return $this->state(fn () => [
            'role' => 'freelancer',
        ]);
    }
}
