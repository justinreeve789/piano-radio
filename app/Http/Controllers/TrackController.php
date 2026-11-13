<?php

namespace App\Http\Controllers;

use App\Models\AlbumTag;
use App\Models\ArtistTag;
use App\Models\Track;
use App\Models\TrackData;
use App\Models\TrackTag;
use App\Models\TrackSource;
use App\Models\Settings\Piano;
use App\Models\Settings\Settings;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return $this->getTrackSchedule();
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function show(Track $track)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function edit(Track $track)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Track $track)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function destroy(Track $track)
    {
        //
    }

    /**
     * @param \Illuminate\Http\Request $request
     * @param int $track_id
     * @return mixed
     */
    public function get(Request $request, $track_id) {
        return Track::with('trackData')->with('trackSources')->with('trackTags')->where('id', $track_id)->first();
    }

    /**
     * @return int
     */
    public function getCurrentSecondsInDay() {
        // TODO: Why doesn't PHP return the same current seconds as MySQL?
        $sql = "SELECT TIME_TO_SEC(TIME(NOW())) AS current_seconds";
        $current_seconds = \DB::select($sql)[0]->current_seconds;
        return floor($current_seconds);
    }

    /**
     * If whatever, order by random in randomized_tracks, and remove the order by random in the moodsort (or leave it).
     * If soft, order mood by ASC.
     * If neutral, order by standard deviation from the average mood.
     * If energetic, order mood by DESC.
     * If we want to add an in-between step for not-as-soft and not-so-energetic, increase the limit size from 550 to 800.
     *
     * danceability - 2 log(danceability * 5) / 3
     * energy - 3 (ln 2(energy * 2)) / 2
     * valence - log (1 + valence * 2 + (mode))
     * tempo - log (tempo / (0.01 + energy * 4)) - 1.5
     * loudness - 3 / abs(loudness)
     *
     * @param string $date
     */
    public function getTrackSchedule(Request $request, $date = null) {
        if ($date === null) {
            $date = date('Y-m-d');
        }
        $seed = (int) str_replace('-', '', $date);

        // Add the site-specific settings.
        $model = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $settings = new $model();
        $settings->parseInput($request);
        $seed = $settings->modifySeed($seed);
        $sql = $settings->generateSql($request);
        $tracks = \DB::select($sql, array_merge(['seed1' => $seed], $settings->getExtraSqlParams($seed)));
        $current_seconds = $this->getCurrentSecondsInDay();

        // Make sure we have enough to cover a whole day. If we don't, repeat until we do.
        $total_tracks = count($tracks);
        if ($total_tracks == 0) {
            return null;
        }

        $find_jump_index = true;
        for ($i = 0; $i == 0 || $tracks[$i - 1]->secs_end < 86400; $i++) {

            if ($i != 0 && $i % $total_tracks == 0) {
                $loop_secs_start = $tracks[$i - 1]->secs_end;
            }

            if ($i >= $total_tracks) {
                $reference_index = $i % $total_tracks;
                $tracks[$i] = clone($tracks[$reference_index]);
                $duration = $tracks[$i]->secs_end - $tracks[$i]->secs_start;
                $tracks[$i]->secs_start += $loop_secs_start;
                $tracks[$i]->secs_end = $tracks[$i]->secs_start + $duration;
            }

            if ($find_jump_index == true && $tracks[$i]->secs_start >= $current_seconds) {
                $jump_index = max($i - 1, 0);
                $find_jump_index = false;
            }
        }

        $tracks[$jump_index]->artist_tags = ArtistTag::where('artist_id', $tracks[$jump_index]->artist_id)->pluck('tag')->toArray();
        $tracks[$jump_index]->album_tags = AlbumTag::where('album_id', $tracks[$jump_index]->album_id)->pluck('tag')->toArray();
        $tracks[$jump_index]->track_tags = TrackTag::where('track_id', $tracks[$jump_index]->track_id)->pluck('tag')->toArray();
        $current_track = $tracks[$jump_index];
        $previous_track_count = getenv('PREVIOUS_TRACK_COUNT');
        $next_track_count = getenv('NEXT_TRACK_COUNT');
        $previous_tracks = [];
        $next_tracks = [];

        // TODO: Use eager-loading when retrieving the tracks instead of multiple queries here.
        for ($i = 0; $i < $previous_track_count; $i++) {
            $index = $jump_index - 1 - $i;
            if (isset($tracks[$index])) {
                $tracks[$index]->artist_tags = ArtistTag::where('artist_id', $tracks[$index]->artist_id)->pluck('tag')->toArray();
                $tracks[$index]->album_tags = AlbumTag::where('album_id', $tracks[$index]->album_id)->pluck('tag')->toArray();
                $tracks[$index]->track_tags = TrackTag::where('track_id', $tracks[$index]->track_id)->pluck('tag')->toArray();
                $previous_tracks[] = $tracks[$index];
            }
        }

        for ($i = 0; $i < $next_track_count; $i++) {
            $index = $jump_index + 1 + $i;
            if (isset($tracks[$index])) {
                $tracks[$index]->artist_tags = ArtistTag::where('artist_id', $tracks[$index]->artist_id)->pluck('tag')->toArray();
                $tracks[$index]->album_tags = AlbumTag::where('album_id', $tracks[$index]->album_id)->pluck('tag')->toArray();
                $tracks[$index]->track_tags = TrackTag::where('track_id', $tracks[$index]->track_id)->pluck('tag')->toArray();
                $next_tracks[] = $tracks[$index];
            }
        }

        return [
            'current_seconds' => $current_seconds,
            'current_track' => $current_track,
            'previous_tracks' => $previous_tracks,
            'next_tracks' => $next_tracks,
        ];
    }

    /**
     * @param Request $request
     * @return void
     */
    public function toggleUsability(Request $request) {
        $track_id = $request->get('id');
        $track = Track::where('id', $track_id)->first();
        if ($track) {
            $track->is_usable = !$track->is_usable;
            $track->save();
        }
    }}
