<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Artist;
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

    public function artist(Request $request, $id) {
        // If the id isn't numeric, interpret as the artist's alphanumericized name.
        if (!is_numeric($id)) {
            $sql = "SELECT *
                    FROM artists
                    WHERE LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '')) = :name";
            $name = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $id));
            $artist = \DB::select($sql, ['name' => $name]);
            if (!empty($artist)) {
                $artist = Artist::with(['albums' => function($query) {
                    $query->orderBy('release_date', 'desc');
                }])->with('sites')->where('id', $artist[0]->id)->first();
                return view('artist', ['artist' => $artist]);
            }
            abort(404);
        }
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
