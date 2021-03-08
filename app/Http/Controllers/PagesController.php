<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Artist;
use App\Models\ArtistFeatured;
use Illuminate\Http\Request;

class PagesController extends Controller
{
    /**
     * Shuffles an array in a repeatable manner, if the same $seed is provided.
     *
     * @param array &$items The array to be shuffled.
     * @param integer $seed The result of the shuffle will be the same for the same input ($items and $seed). If not given, uses the current time as seed.
     * @return void
     */
    protected function seededShuffle(array &$items, $seed = false) {
        $items = array_values($items);
        mt_srand($seed ? $seed : time());
        for ($i = count($items) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            list($items[$i], $items[$j]) = array($items[$j], $items[$i]);
        }
        return $items;
    }

    public function index() {
        $artists = Artist::where('is_usable', '1')->inRandomOrder(date('Ymd'))->take(24)->get()->toArray();
        $featured_artist_ids = ArtistFeatured::where('boost', '>', 1)->pluck('artist_id')->toArray();
        $featured_artists = Artist::whereIn('id', $featured_artist_ids)->get()->toArray();
        $artists = array_merge($artists, $featured_artists);
        $artists = $this->seededShuffle($artists, date('Ymd'));
        return view('index', ['stats' => $this->stats(), 'artists' => $artists]);
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
                $artist_id = $artist[0]->id;
            }
        } else {
            $artist_id = $id;
        }

        try {
            $artist = Artist::with(['albums' => function ($query) {
                $query->orderBy('release_date', 'desc');
            }])->with('sites')->where('id', $artist_id)->first();
            if ($artist) {
                return view('artist', ['artist' => $artist]);
            }
        } catch (\Exception $e) {
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

        return (object) [
            'tracks' => $track_count[0]->total,
            'albums' => $album_count[0]->total,
            'artists' => $artist_count[0]->total,
            'plays' => 0,
        ];
    }
}
