<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Album extends Model
{
    use HasFactory;

    public function saveFromSpotifyData($data) {
        $this->name = $data->name;
        $this->total_tracks = $data->total_tracks;
        $this->image_url = isset($data->images[0]) ? $data->images[0]->url : null;
        $this->release_date = date('Y-m-d', strtotime($data->release_date));
        $this->spotify_id = $data->id;
        $this->save();
    }
}
