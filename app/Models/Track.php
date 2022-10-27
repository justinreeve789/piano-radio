<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Track extends Model
{
    use HasFactory;

    /**
     * Relationship for the primary artist.
     */
    public function artists() {
        return $this->belongsToMany('App\Models\Artist', 'artist_tracks')->using('App\Models\ArtistTrack');
    }

    public function artist() {
        return $this->hasOne('App\Models\Artist', 'artist_id', 'id');
    }

    public function album() {
        return $this->belongsTo('App\Models\Album', 'album_id', 'id');
    }

    public function trackData() {
        return $this->hasOne('App\Models\TrackData');
    }

    public function trackSources() {
        return $this->hasMany('App\Models\TrackSource');
    }

    public function trackTags() {
        return $this->hasMany('App\Models\TrackTag');
    }

    public function youtube() {
        self::with('trackSources')->where('track_sources.type', 'youtube')->first();
    }

    public function saveFromSpotifyData($data) {
        $this->name = $data->name;
        $this->disc_number = $data->disc_number;
        $this->track_number = $data->track_number;
        $this->spotify_id = $data->id;
        $this->duration_ms = $data->duration_ms;
        $this->save();
    }

    public function saveFromYouTubeData($video, ?int $album_id = null, ?int $artist_id = null) {
        $this->name = $video->title;
        $this->disc_number = 1;
        $this->track_number = 0;
        $this->duration_ms = ($video->duration * 1000);
        $this->album_id = $album_id;
        $this->artist_id = $artist_id;
        $this->save();
    }

    public static function formatMilliseconds($milliseconds) {
        $seconds = floor($milliseconds / 1000);
        $seconds = $seconds % 3600;
        return gmdate((int) date('i', $seconds) . date(':s', $seconds));
    }
}