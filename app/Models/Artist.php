<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Artist extends Model
{
    use HasFactory;

    public function albums() {
        return $this->hasManyThrough('App\Models\Album', 'App\Models\ArtistAlbum', 'artist_id', 'id', 'id', 'album_id');
    }

    public function artistTracks() {
        return $this->hasMany('App\Models\ArtistTrack');
    }

    public function artistTags() {
        return $this->hasMany('App\Models\ArtistTag');
    }

    public function sites() {
        return $this->hasMany('App\Models\ArtistSite');
    }

    public function artistUrl() {
        return $_ENV['APP_URL'] . '/' . str_replace(' ', '_', trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $this->name)));
    }

    public static function updateExtras() {
        \DB::table('artists as a')
            ->join('_artists_extra as ae', 'a.id', '=', 'ae.artist_id')
            ->leftJoin('artist_featured as af', 'a.id', '=', 'af.artist_id')
            ->update([
                'a.usable_tracks_count' => \DB::raw('ae.usable_tracks_count'),
                'a.allowed_tracks_per_day' => \DB::raw('ae.allowed_tracks_per_day + af.tracks_per_day_modifier'),
            ]);
    }
}