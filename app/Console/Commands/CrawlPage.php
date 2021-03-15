<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Crawler\Crawler;
use App\Models\PRCrawlObserver;

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
/*
        $observer = new PRCrawlObserver();
        $observer->soloPianoRadio();
*/
/*
        $crawler = Crawler::create()
            ->setCrawlObserver(new PRCrawlObserver())
            ->ignoreRobots()
            ->setConcurrency(3)
            ->acceptNofollowLinks()
            ->setMaximumCrawlCount(1)
            ->setDelayBetweenRequests(500)
            ->setParseableMimeTypes(['text/html'])
            ->startCrawling($url);

        print_r($crawler);
*/
        return 0;
    }
}
