<?php

namespace App\Console\Commands;

use App\Models\Track;
use App\Models\TrackData;
use Illuminate\Console\Command;

class GetYouTube extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:getyoutube {--trackid=?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get YouTube videos for tracks. Must have a duration between -2 to 10 seconds of the track length.';

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
        $track_id = $this->option('trackid');

        $starttime = microtime(true);

        if ($track_id) {
            $tracks = Track::with('trackData')->where('tracks.id', $track_id)->get();
        } else {
            $tracks = Track::with('trackData')->get();
        }

        $music = new \App\Models\MusicData();

        foreach ($tracks as $track) {
            // TODO: Skip any tracks that already have a YouTube video.

            $music->getYoutubeForTrack($track);
        }

        $endtime = microtime(true);
        echo '
Completed in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
