<?php

namespace App\Console\Commands;

use App\Models\Track;
use App\Models\TrackData;
use Illuminate\Console\Command;

class GetTrackData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'music:trackdata';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update tracks with audio feature data.';

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
        $tracks = Track::with('trackData')->get();
        $music = new \App\Models\MusicData();
        foreach ($tracks as $track) {
            // Skip any tracks that already have the extra data.
            if (empty($track->trackData)) {
                $spotify_track_data = $music->getAudioFeaturesByTrackSpotifyId($track->spotify_id);
                if ($spotify_track_data) {
                    $track_data = new TrackData();
                    $attributes = $track_data->getFillable();
                    $track_data->track_id = $track->id;

                    // Only add attributes that are contained in the model's $fillable array.
                    $track_data->fill(array_intersect_key((array) $spotify_track_data, array_flip($attributes)));
                    $track_data->created_at = time();
                    $track_data->updated_at = time();
                    $track_data->save();
                }
            }
        }
        $endtime = microtime(true);
        echo '
Completed in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
