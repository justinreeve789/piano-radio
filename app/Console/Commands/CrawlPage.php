<?php

namespace App\Console\Commands;

use App\Models\Artist;
use App\Models\ArtistAttempt;
use App\Models\Settings\Metal;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Console\Command;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\UriInterface;
use Spatie\Crawler\Crawler;
use Spatie\Crawler\CrawlInternalUrls;
use Spatie\Crawler\CrawlObserver;
use Spatie\Crawler\CrawlProfile;
use Symfony\Component\DomCrawler\Crawler as DomCrawler;

class MetalCrawlObserver extends CrawlObserver {
    public function crawled(UriInterface $url,
                            ResponseInterface $response,
                            UriInterface $foundOnUrl = null) {
        $domCrawler = new DomCrawler(
            (string) $response->getBody()
        );

        $genre_links = $domCrawler->filter('#content_wrapper a')->links();
//        $bands = $domCrawler->filter('table#bandListGenre')->filter('tr')->each(function ($tr, $i) {
//            return $tr->filter('td')->each(function ($td, $i) {
//                echo $td;
//            });
//        });

        $bands = $domCrawler->filter('#bandListGenre');
    }

    public function crawlFailed(UriInterface $url,
                                RequestException $requestException,
                                UriInterface $foundOnUrl = null) {
    }
}

class MetalCrawlProfile extends CrawlProfile {
    public function shouldCrawl($url): bool {
        return true;
    }
}

class CrawlPage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'crawl:page {domain : The domain to crawl}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crawl a web site.';

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
        $domain = $this->argument('domain');
        if ($domain == 'solopianoradio.com') {
            $url = 'https://' . $domain . '/cdstore.htm';
            $url = '/var/www/dev.pianoradio.org/cdstore.htm';
        }

        if ($domain == 'metal-archives.com') {
            $url = 'https://' . $domain . '/browse/genre';
        }

        if ($domain == 'metal-archives.com') {
            $genres = [
//              'heavy',
//              'orchestral',
//                'power',
//                'folk',
//                'gothic',
//                'black',
//                'death',
//                'doom',
//                'electronic',
//                'avantgarde',
//                'grindcore',
//                'groove',
                'metalcore',
                'progressive',
                'speed',
                'thrash',
            ];

            $attempts = ArtistAttempt::get()->keyBy('name');

            foreach ($genres as $genre) {
                $start = 0;
                do {
                    $url = 'https://www.metal-archives.com/browse/ajax-genre/g/' . $genre . '/json/1?sEcho=1&iColumns=4&sColumns=&iDisplayStart=' . $start . '&iDisplayLength=500&mDataProp_0=0&mDataProp_1=1&mDataProp_2=2&mDataProp_3=3&iSortCol_0=0&sSortDir_0=asc&iSortingCols=1&bSortable_0=true&bSortable_1=true&bSortable_2=true&bSortable_3=false&_=1616137282390';
                    $json = file_get_contents($url);
                    $results = json_decode($json);
                    foreach ($results->aaData as $band) {
                        preg_match('/href=(["\'])([^\1]*)\1/i', $band[0], $m);
                        $band = (object) [
                            'band_url' => $m[2],
                            'band_name' => strip_tags($band[0]),
                            'country' => $band[1],
                            'subgenre' => $band[2],
                            'status' => strip_tags($band[3]),
                        ];

                        // Skip non-active bands.
                        if ($band->status != 'Active') {
                            echo 'Skipping non-active band ' . $band->band_name . '
';
                            continue;
                        }

                        // Skip existing artist attempts.
                        // TODO: Remove this.
                        if (isset($attempts[$band->band_name])) {
                            echo 'Already attempted ' . $band->band_name . '
';
                            continue;
                        }

                        // TODO: Search band discography and sites.

                        echo 'Adding ' . $band->band_name . '
';
                        try {
                            $exit_code = $this->call('music:addartist', [
                                '--tag' => [$genre, 'country:' . $band->country], 'name' => $band->band_name
                            ]);
                        } catch (\Exception $e) {
                            // A rate limit likely occurred. Wait for a bit then try again.
                            echo 'Rate limit hit. Waiting 15 seconds.
';
                            sleep(15);
                            continue;
                        }

                        try {
                            $attempt = new ArtistAttempt();
                            $attempt->name = $band->band_name;
                            $attempt->save();
                        } catch (\Exception $e) {
                            echo 'Band attempt for ' . $band->band_name . ' already exists.
';
                        }
                    }
                    $start += 500;
                } while (!empty($results->aaData));
            }
        }

        return 0;
    }
}