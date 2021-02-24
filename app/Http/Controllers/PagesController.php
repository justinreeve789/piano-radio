<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PagesController extends Controller
{
    public function index() {
        return view('index');
    }

    public function radio(Request $request, $type = null, $id = null) {
        if (in_array($type, ['artist', 'album']) && $id !== null) {
            return view('radio', ['type' => $type, 'id' => $id]);
        }
        return view('radio');
    }

    public function stats() {
        $sql = "SELECT COUNT(DISTINCT youtube_url) AS total
                FROM _music m
                WHERE is_usable = 1 AND youtube_id IS NOT NULL";
        $track_count = \DB::select(\DB::raw($sql));

        $sql = "SELECT COUNT(DISTINCT album_id) AS total
                FROM _music
                WHERE is_usable = 1 AND youtube_id IS NOT NULL";
        $album_count = \DB::select(\DB::raw($sql));

        $sql = "SELECT COUNT(DISTINCT artist_id) AS total
                FROM _music
                WHERE is_usable = 1 AND youtube_id IS NOT NULL";
        $artist_count = \DB::select(\DB::raw($sql));

        return [
            'tracks' => $track_count[0]->total,
            'albums' => $album_count[0]->total,
            'artists' => $artist_count[0]->total,
            'plays' => 0,
        ];
    }
}
