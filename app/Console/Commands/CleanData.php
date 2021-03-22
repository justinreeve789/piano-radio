<?php

namespace App\Console\Commands;

use App\Models\Album;
use App\Models\Artist;
use App\Models\ArtistAttempt;
use App\Models\ArtistSite;
use App\Models\Settings\Metal;
use Illuminate\Console\Command;
use Symfony\Component\DomCrawler\Crawler as DomCrawler;

class CleanData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Validate the data integrity.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $settings_model = strtolower(getenv('APP_SETTINGS_MODEL'));
        $this->$settings_model();
        return 0;
    }

    /**
     * We're going to go through metal-archives.com and make sure we have at least one matching album with what's recorded.
     * If we don't, we'll flag our artist as unusable.
     */
    protected function metal() {
        $genres = [
            'heavy',
            'orchestral',
            'power',
            'folk',
            'gothic',
            'black',
            'death',
            'doom',
            'electronic',
            'avantgarde',
            'grindcore',
            'groove',
            'metalcore',
            'progressive',
            'speed',
            'thrash',
        ];

        $attempts = ArtistAttempt::whereNotNull('external_id')->where('type', 'clean')->get()->keyBy('external_id');

        foreach ($genres as $genre) {
            $start = 0;
            do {
                $url = 'https://www.metal-archives.com/browse/ajax-genre/g/' . $genre . '/json/1?sEcho=1&iColumns=4&sColumns=&iDisplayStart=' . $start . '&iDisplayLength=500&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=false&_=1616137282390';
                $json = file_get_contents($url);
                $results = json_decode($json);
                foreach ($results->aaData as $band) {
                    preg_match('/href=(["\'])([^\1]*)\1/i', $band[0], $m);
                    $band = (object) [
                        'url' => $m[2],
                        'name' => strip_tags($band[0]),
                        'country' => $band[1],
                        'subgenre' => $band[2],
                        'status' => strip_tags($band[3]),
                    ];

                    // Skip non-active bands.
                    if ($band->status != 'Active') {
                        continue;
                    }

                    // Find the band in our records. If it doesn't exist, just skip it.
                    $artist = Artist::where('name', $band->name)->where('is_usable', 1)->first();
                    if (!$artist) {
                        continue;
                    }

                    // Load the discography from metal-archives.com. If we can't find it, just skip it.
                    $url_parts = explode('/', $band->url);
                    $band_id = $url_parts[count($url_parts) - 1];
                    if (!is_numeric($band_id)) {
                        continue;
                    }

                    // Check if we're already marked the attempt.
                    if (isset($attempts[$band_id])) {
                        continue;
                    }

                    // Mark the attempt.
                    $attempt = new ArtistAttempt();
                    $attempt->name = $band->name;
                    $attempt->external_id = $band_id;
                    $attempt->type = 'clean';
                    $attempt->created_at = time();
                    $attempt->updated_at = time();
                    $attempt->save();

                    // Get the discography.
                    $url = 'https://www.metal-archives.com/band/discography/id/' . $band_id . '/tab/all';
                    $html = file_get_contents($url);
                    $domCrawler = new DomCrawler($html);
                    foreach ($domCrawler->filter('a') as $content) {
                        $node = new DomCrawler($content);
                        $album_name = $node->text();

                        // Try just matching it against what we have first. If that doesn't work, start stripping it down to alphanumeric characters.
                        $album = Album::where('name', $album_name)->first();
                        if ($album) {
                            $this->update_metal_sites($artist->id, $band_id);
                            continue 2;
                        }

                        $album_name = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $album_name)));
                        if ($album_name != '') {
                            $album = Album::whereRaw("LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '')) = ? ", [$album_name])->pluck('name')->first();
                            if ($album) {
                                $this->update_metal_sites($artist->id, $band_id);
                                continue 2;
                            }
                        }

                        echo 'Could not find match for artist ' . $band->name . ': Checked ' . $album_name . '
';
                    }

                    // No matching album found. Mark the artist as unusable.
                    echo 'Artist ' . $band->name . ' is not usable.
';
                    $artist->is_usable = 0;
                    $artist->save();
                }

                $start += 500;
            } while (!empty($results->aaData));
        }
    }

    protected function update_metal_sites($artist_id, $band_id) {
        // Make sure there's some sites to include.
        $url = 'https://www.metal-archives.com/link/ajax-list/type/band/id/' . $band_id;
        $html = file_get_contents($url);
        $domCrawler = new DomCrawler($html);
        $links = $domCrawler->filter('#linksTableOfficial a')->links();

        if (!empty($links)) {
            // Just clean out the artist's current sites.
            ArtistSite::where('artist_id', $artist_id)->delete();
        }

        foreach ($links as $link) {
            $url = $link->getUri();

            $site = new ArtistSite();
            $site->artist_id = $artist_id;
            $site->url = $url;
            $site->created_at = time();
            $site->updated_at = time();

            if (strpos($url, 'amazon.com') !== false) {
                $type = 'amazon';
            } else if (strpos($url, 'apple.com') !== false) {
                $type = 'apple';
            } else if (strpos($url, 'bandcamp.com') !== false) {
                $type = 'bandcamp';
            } else if (strpos($url, 'facebook.com') !== false) {
                $type = 'facebook';
            } else if (strpos($url, 'instagram.com') !== false) {
                $type = 'instagram';
            } else if (strpos($url, 'myspace.com') !== false) {
                $type = 'myspace';
            } else if (strpos($url, 'reverbnation.com') !== false) {
                $type = 'reverbnation';
            } else if (strpos($url, 'soundclick.com') !== false) {
                $type = 'soundclick';
            } else if (strpos($url, 'soundcloud.com') !== false) {
                $type = 'soundcloud';
            } else if (strpos($url, 'spotify.com') !== false) {
                $type = 'spotify';
            } else if (strpos($url, 'twitter.com') !== false) {
                $type = 'twitter';
            } else if (strpos($url, 'youtube.com') !== false) {
                $type = 'youtube';
            } else {
                $type = 'other';
            }
            $site->type = $type;

            $site->save();
        }
    }
}
