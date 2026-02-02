<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'price' => $this->price,
            'comment' => $this->comment,
            'status' => $this->status,
            'date_and_time' => $this->date_and_time,

            'freelancer' => new UserResource($this->whenLoaded('freelancer')),
            'project' => new ProjectResource($this->whenLoaded('project')),
        ];
    }
}
