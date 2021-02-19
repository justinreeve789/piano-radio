<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\Album;
use App\Models\Track;
use Illuminate\Http\Request;

class TagController extends Controller
{
    public function index() {
        $model_name = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $model = new $model_name();
        return ['tags' => $model->getAllTags()];
    }

    public function get($artist_id, $album_id, $track_id) {
        $artist = Artist::with('artistTags')->where('id', $artist_id)->first();
        $album = Album::with('albumTags')->where('id', $album_id)->first();
        $track = Track::with('trackData')->with('trackSources')->with('trackTags')->where('id', $track_id)->first();

        return [
            'artist_tags' => $artist->artistTags,
            'album_tags' => $album->albumTags,
            'track_tags' => $track->trackTags,
        ];
    }
}