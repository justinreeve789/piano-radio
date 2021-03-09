<?php

namespace App\Console\Commands;

use App\Models\Artist;
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

        if ($artist_id) {
            $artists = Artist::with(['sites' => function($query) {
                $query->get()->keyBy('type');
            }])->where('id', $artist_id)->get();
        } else if ($newest) {
            $artists = Artist::with(['sites' => function($query) {
                $query->get()->keyBy('type');
            }])->orderBy('created_at', 'desc')->get();
        } else {
            $artists = Artist::with(['sites' => function($query) {
                $query->get()->keyBy('type');
            }])->where('is_usable', 1)->get();
        }

        print_r($artists->toArray());
        foreach ($artists as $artist) {
        }

        $endtime = microtime(true);
    }
}
