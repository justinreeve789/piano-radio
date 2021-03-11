<?php

namespace App\Console\Commands;

use App\Models\Artist;
use App\Models\ArtistSite;
use Illuminate\Console\Command;

class GetSites extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:getsites {--artistid=} {--newest}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Use DuckDuckGo to find artist sites.';

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
        $starttime = microtime(true);

        $artist_id = $this->option('artistid');
        $newest = $this->option('newest');
        $total = 0;

        if ($artist_id) {
            $artists = Artist::with(['sites' => function($query) {
                $query->get()->keyBy('type');
            }])->where('id', $artist_id)->get();
        } else if ($newest) {
            $artists = Artist::with(['sites' => function($query) {
                $query->get()->keyBy('type');
            }])->where('is_usable', 1)->orderBy('created_at', 'desc')->get();
        } else {
            $artists = Artist::with(['sites' => function($query) {
                $query->get()->keyBy('type');
            }])->where('is_usable', 1)->get();
        }

        foreach ($artists as $artist) {
            $types = [];
            foreach ($artist->sites as $site) {
                $types[$site->type] = $site;
            }

            $commands = [];

            if (!isset($types['personal'])) {
                $commands['personal'] = 'ddgr -x --json "' . $artist->name . '" music';
            }

            if (!isset($types['sheetmusic'])) {
                $commands['sheetmusic'] = 'ddgr -x --json "' . $artist->name . '" "sheet music"';
            }

            foreach ($commands as $type => $cmd) {
                $json = shell_exec($cmd);
                $results = json_decode($json);

                $artist_name = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $artist->name)));
                $artist_name = trim(preg_replace('/\s\s+/', ' ', $artist_name));

                for ($i = 0; $i < 3; $i++) {
                    if (!isset($results[$i]) || $i > 2) {
                        break;
                    }

                    // Skip if the URL is one of "those" sites.
                    $url = $results[$i]->url;
                    if (strpos($url, '.ru/') !== false) {
                        continue;
                    } else if (strpos($url, 'musify.club') !== false) {
                        continue;
                    }

                    $title = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", $results[$i]->title)));
                    $title = trim(preg_replace('/\s\s+/', ' ', $title));
                    $abstract = trim(strtolower(preg_replace("/[^0-9a-zA-Z]/", "", strip_tags($results[$i]->abstract))));
                    $abstract = trim(preg_replace('/\s\s+/', ' ', $abstract));

                    if (strpos($title, $artist_name) === false &&
                        strpos($abstract, $artist_name) === false) {
                        continue;
                    }

                    // Check that an artist doesn't already have the site.
                    $site = ArtistSite::where('url', $url)->first();

                    // Determine if we need to change the type.
                    if (strpos($url, 'facebook.com') !== false) {
                        $savetype = 'facebook';
                    } else if (strpos($url, 'instagram.com') !== false) {
                        $savetype = 'instagram';
                    } else if (strpos($url, 'pinterest.com') !== false) {
                        $savetype = 'pinterest';
                    } else if (strpos($url, 'twitter.com') !== false) {
                        $savetype = 'twitter';
                    } else if (strpos($url, 'soundcloud.com') !== false) {
                        $savetype = 'soundcloud';
                    } else if (strpos($url, 'bandcamp.com') !== false) {
                        $savetype = 'bandcamp';
                    } else if (strpos($url, 'spotify.com') !== false) {
                        $savetype = 'spotify';
                    } else if (strpos($url, 'apple.com') !== false) {
                        $savetype = 'apple';
                    } else if (strpos($url, 'youtube.com/user') !== false) {
                        $savetype = 'youtube';
                    } else if (strpos($url, 'youtube.com/channel') !== false) {
                        $savetype = 'youtube';
                    } else {
                        $savetype = $type;
                    }

                    if (!$site) {
                        $site = new ArtistSite();
                        $site->artist_id = $artist->id;
                        $site->type = $savetype;
                        $site->name = $results[$i]->title;
                        $site->url = $results[$i]->url;
                        $site->created_at = time();
                        $site->updated_at = time();
                        $site->save();
                        $total++;
                        print_r($site->toArray());
                        sleep(5);
                        break;
                    }
                }
            }
        }

        $endtime = microtime(true);

        echo '
        Added ' . $total . ' records in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
