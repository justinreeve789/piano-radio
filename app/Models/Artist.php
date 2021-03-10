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
}