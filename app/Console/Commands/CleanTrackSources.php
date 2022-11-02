<?php

namespace App\Console\Commands;

use App\Models\TrackSource;
use App\Models\TrackSourcesFailedAttempt;
use Illuminate\Console\Command;

class CleanTrackSources extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'track:clean';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform cleanup tasks for tracks and sources.';

    private $music;

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->music = new \App\Models\MusicData();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $tsfa = TrackSourcesFailedAttempt::with(['trackSource' => function($query) {
            $query->with('track');
        }])->get();
        foreach ($tsfa as $attempt) {
            $ts = $attempt->trackSource;
            if ($ts && $ts->type == 'youtube') {
                $this->cleanYouTubeSource($ts);
            }
        }
    }

    private function cleanYouTubeSource($trackSource) {
        $track = $trackSource->track;
        $trackSource->delete();
        $this->line('Deleted source for track ' . $track->id . ': ' . $track->name);
        if ($this->music->getYoutubeForTrack($track)) {
            $this->line('Found new YouTube source for track ' . $track->id . ': ' . $track->name);
        }
        return true;
    }
}
