<?php

namespace App\Http\Controllers;

use App\Models\TrackSource;
use App\Models\TrackSourcesFailedAttempt;
use Illuminate\Http\Request;

class TrackSourceController extends Controller
{
    public function delete(Request $request) {
        $youtube_id = $request->get('youtube_id');
        if ($youtube_id) {
            $ts = TrackSource::where('type', 'youtube')->where('external_id', $youtube_id)->first();
            if ($ts) {
                $tsfa = new TrackSourcesFailedAttempt();
                $tsfa->track_source_id = $ts->id;
                $tsfa->ip = $request->ip();
                $tsfa->save();
            }
        }
    }
}
