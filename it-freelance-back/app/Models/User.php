<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'description',
        'skills',
        'image_url',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function projectsAsClient()
    {
        return $this->hasMany(Project::class, 'client_id');
    }

    public function offersAsFreelancer()
    {
        return $this->hasMany(Offer::class, 'freelancer_id');
    }

    public function reviewsAsClient()
    {
        return $this->hasMany(Review::class, 'client_id');
    }

    public function reviewsAsFreelancer()
    {
        return $this->hasMany(Review::class, 'freelancer_id');
    }
}
