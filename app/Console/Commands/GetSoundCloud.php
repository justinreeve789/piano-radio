<?php

namespace App\Console\Commands;

use App\Models\Track;
use App\Models\TrackData;
use App\Models\TrackSource;
use App\Models\TrackSourcesRetrievalAttempt;
use Illuminate\Console\Command;

class GetSoundCloud extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:getsoundcloud {--artistid=} {--trackid=} {--random} {--newest}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Get SoundCloud audio for tracks. Must have a duration between -2 to 10 seconds of the track length.';

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

        $track_sources = TrackSource::where('type', 'soundcloud')->get()->keyBy('track_id');
        $track_sources_retrieval_attempts = TrackSourcesRetrievalAttempt::where('type', 'soundcloud')->get()->keyBy('track_id');

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
            $tracks = Track::with('trackData')->orderBy('created_at', 'desc')->get();
        } else {
            $tracks = Track::with('trackData')->get();
        }

        $music = new \App\Models\MusicData();

        foreach ($tracks as $track) {
            // Skip any tracks that already have SoundCloud audio, or have had a retrieval attempt.
            if (!isset($track_sources[$track->id]) && !isset($track_sources_retrieval_attempts[$track->id])) {
                $music->getSoundCloudForTrack($track);
                $attempt = new TrackSourcesRetrievalAttempt();
                $attempt->track_id = $track->id;
                $attempt->type = 'soundcloud';
                $attempt->save();
            }
        }

        $endtime = microtime(true);
        echo '
Completed in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
