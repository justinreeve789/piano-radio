<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackSource extends Model
{
    use HasFactory;

    public function track() {
        return $this->belongsTo('App\Models\Track');
    }

    public function has_youtube() {
    }

    public function youtube_video_exists() {
        // Use https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=ZLlfuX0lwq0&format=json
    }
}