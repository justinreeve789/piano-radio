<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PagesController extends Controller
{
    public function index() {
        return view('index');
    }

    public function stats() {
        $sql = "SELECT COUNT(*) AS total
                FROM _music m
                WHERE is_usable = 1 AND youtube_id IS NOT NULL";
        $track_count = \DB::select(\DB::raw($sql));

        $sql = "SELECT COUNT(*) AS total
                FROM albums
                WHERE is_usable = 1";
        $album_count = \DB::select(\DB::raw($sql));

        $sql = "SELECT COUNT(*) AS total
                FROM artists
                WHERE is_usable = 1";
        $artist_count = \DB::select(\DB::raw($sql));

        return [
            'tracks' => $track_count[0]->total,
            'albums' => $album_count[0]->total,
            'artists' => $artist_count[0]->total,
            'plays' => 0,
        ];
    }
}
