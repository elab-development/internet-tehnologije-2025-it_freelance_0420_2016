<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'budget' => $this->budget,
            'status' => $this->status,
            'image_url' => $this->image_url,

            'category' => new CategoryResource($this->whenLoaded('category')),
            'client' => new UserResource($this->whenLoaded('client')),

            'created_at' => $this->created_at,
        ];
    }
}
