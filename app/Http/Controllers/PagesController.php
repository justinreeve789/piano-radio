<?php

namespace App\Http\Controllers;

use App\Models\Album;
use App\Models\Artist;
use App\Models\ArtistFeatured;
use Fusonic\OpenGraph\Elements\Image;
use Fusonic\OpenGraph\Elements\Video;
use Fusonic\OpenGraph\Objects\Website;
use Fusonic\OpenGraph\Publisher;
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

    /**
     * Return stats for the site.
     *
     * @return array
     */
    public function stats() {
        // Add the site-specific settings.
        $model = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $settings = new $model();
        return $settings->stats();
    }

    protected function opengraph() {
        $publisher = new Publisher();
        $object = new Website();

        // Basic information of the object
        $object->title = getenv('APP_NAME');
        $object->siteName = getenv('APP_NAME');
        $object->description = strip_tags(view('sites.' . strtolower(getenv('APP_SETTINGS_MODEL')))->render());
        $object->url = getenv('APP_URL');
        $object->locale = 'en_US';

        // Images
        $image = new Image(getenv('APP_URL') . getenv('HOME_BACKGROUND_URL'));
        $object->images[] = $image;

        return $publisher->generateHtml($object);
    }

    public function index() {
        $opengraph_html = $this->opengraph();
        $artists = Artist::has('artistTracks')->where('is_usable', '1')->inRandomOrder(date('YmdH'))->take(30)->get()->toArray();
        $featured_artist_ids = ArtistFeatured::where('boost', '>', 1)->pluck('artist_id')->toArray();
        $featured_artists = Artist::whereIn('id', $featured_artist_ids)->get()->toArray();
        $artists = array_merge($artists, $featured_artists);
        $artists = $this->seededShuffle($artists, date('YmdH'));
        return view('index', ['opengraph' => $opengraph_html, 'stats' => $this->stats(), 'artists' => $artists]);
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
                $query->with(['tracks' => function ($q) {
                    $q->with('trackSources');
                }])->orderBy('release_date', 'desc');
            }])->with(['sites' => function ($q) {
                $q->where('type', '!=', 'youtube')->orWhere('url', 'LIKE', '%youtube.com/channel/%');
            }])->where('id', $artist_id)->first();
            if ($artist) {
                return view('artist', ['artist' => $artist]);
            }
        } catch (\Exception $e) {
            abort(404);
        }
    }

    public function sitemap() {
        $sitemap = \App::make('sitemap');
        $sitemap->setCache('laravel.sitemap', 60);
        if (!$sitemap->isCached()) {
            $time = new \DateTime;
            $currenttime = $time->format(\DateTime::W3C);
            $sitemap->add(\URL::to('/'), $currenttime, '1.0', 'hourly');

            // Get the artist pages.
            $featured_artist_ids = ArtistFeatured::where('boost', '>', 1)->pluck('artist_id')->toArray();
            $artists = Artist::where('is_usable', '1')->get()->toArray();
            foreach ($artists as $artist) {
                $artist_name_url = str_replace(' ', '_', trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $artist['name'])));
                $url = '/' . $artist_name_url;
                if (in_array($artist['id'], $featured_artist_ids)) {
                    $priority = 0.9;
                } else {
                    $priority = 0.5;
                }
                $sitemap->add(\URL::to($url), $currenttime, $priority, 'monthly');
            }
        }

        return $sitemap->render('xml');
    }
}
