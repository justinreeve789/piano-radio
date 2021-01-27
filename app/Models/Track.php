<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    use HasFactory;

    public function trackData() {
        return $this->hasOne('App\Models\TrackData');
    }

    public function trackSources() {
        return $this->hasMany('App\Models\TrackSource');
    }

    public function youtube() {
        self::with('trackSources')->where('track_sources.type', 'youtube')->first();
    }

    /**
     * Relationship for the primary artist.
     */
    public function artist() {
    }

    public function saveFromSpotifyData($data) {
        $this->name = $data->name;
        $this->disc_number = $data->disc_number;
        $this->track_number = $data->track_number;
        $this->spotify_id = $data->id;
        $this->duration_ms = $data->duration_ms;
        $this->save();
    }
}
