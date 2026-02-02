<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MetricsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'users' => $this['users'],
            'projects' => $this['projects'],
            'offers' => $this['offers'],
            'reviews' => $this['reviews'],
            'top' => $this['top'],
        ];
    }
}
