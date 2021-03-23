<?php

namespace App\Console\Commands;

use App\Models\Track;
use App\Models\TrackData;
use App\Models\TrackSource;
use Illuminate\Console\Command;

class GetYouTube extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:getyoutube {--artistid=} {--trackid=} {--random} {--newest}';

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
        $starttime = microtime(true);

        $artist_id = $this->option('artistid');
        $track_id = $this->option('trackid');
        $random = $this->option('random');
        $newest = $this->option('newest');

        $track_sources = TrackSource::where('type', 'youtube')->get()->keyBy('track_id');

        if ($artist_id) {
            $tracks = \DB::table('tracks')
                            ->join('artist_tracks', 'artist_tracks.track_id', '=', 'tracks.id')
                            ->where('artist_tracks.artist_id', $artist_id)
                            ->select('tracks.*')
                            ->get();
        } else if ($track_id) {
            $tracks = Track::with('trackData')->where('tracks.id', $track_id)->get();
        } else if ($random) {
            $tracks = Track::with('trackData')->inRandomOrder()->get();
        } else if ($newest) {
            $tracks = Track::with('trackData')->orderBy('created_at', 'desc')->take(1000)->get();
        } else {
            $tracks = Track::with('trackData')->get();
        }

        $music = new \App\Models\MusicData();

        foreach ($tracks as $track) {
            // Skip any tracks that already have a YouTube video.
            if (!isset($track_sources[$track->id])) {
                $music->getYoutubeForTrack($track);
            }
        }

        $endtime = microtime(true);
        echo '
Completed in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
