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
    public function index(Request $request)
    {
        return $this->getTrackSchedule($request);
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
     * The current date and second of the day, read from a single clock.
     *
     * The schedule's seed comes from the date and the playing track from the seconds, so both
     * must come from the same clock. They used to come from PHP's date() (app timezone, UTC)
     * and MySQL's NOW() (the database's timezone); when those differ, the playlist switched to
     * the next day's seed at UTC midnight while the seconds kept counting in local time.
     * MySQL stays the source of truth so the time of day listeners hear doesn't move.
     *
     * @return array{date: string, seconds: int}
     */
    public function now() {
        if (\DB::connection()->getDriverName() === 'mysql' || \DB::connection()->getDriverName() === 'mariadb') {
            $row = \DB::select('SELECT CURDATE() AS today, TIME_TO_SEC(CURTIME()) AS current_seconds')[0];
            return ['date' => (string) $row->today, 'seconds' => (int) floor($row->current_seconds)];
        }

        $now = new \DateTimeImmutable('now');
        $midnight = $now->setTime(0, 0);
        return ['date' => $now->format('Y-m-d'), 'seconds' => $now->getTimestamp() - $midnight->getTimestamp()];
    }

    /**
     * @return int
     */
    public function getCurrentSecondsInDay() {
        return $this->now()['seconds'];
    }

    /**
     * Index of the track playing at $current_seconds: the last one that has started.
     *
     * $tracks must be in play order and back to back. Returns 0 if nothing has started yet.
     *
     * @param array $tracks
     * @param int $current_seconds
     * @return int
     */
    public static function findCurrentIndex(array $tracks, $current_seconds) {
        $index = 0;
        foreach ($tracks as $i => $track) {
            if ($track->secs_start > $current_seconds) {
                break;
            }
            $index = $i;
        }
        return $index;
    }

    /**
     * Repeats the list until it covers the whole day (86400 seconds).
     *
     * @param array $tracks
     * @return array
     */
    public static function fillDay(array $tracks) {
        $tracks = array_values($tracks);
        $total_tracks = count($tracks);
        if ($total_tracks == 0) {
            return $tracks;
        }

        $loop_length = $tracks[$total_tracks - 1]->secs_end - $tracks[0]->secs_start;
        if ($loop_length <= 0) {
            // Zero-length tracks would make the loop below run forever.
            return $tracks;
        }

        $loop_secs_start = 0;
        for ($i = $total_tracks; $tracks[$i - 1]->secs_end < 86400; $i++) {
            if ($i % $total_tracks == 0) {
                $loop_secs_start = $tracks[$i - 1]->secs_end;
            }
            $tracks[$i] = clone($tracks[$i % $total_tracks]);
            $duration = $tracks[$i]->secs_end - $tracks[$i]->secs_start;
            $tracks[$i]->secs_start += $loop_secs_start;
            $tracks[$i]->secs_end = $tracks[$i]->secs_start + $duration;
        }

        return $tracks;
    }

    /**
     * @param object $track
     * @return object
     */
    private function attachTags($track) {
        $track->artist_tags = ArtistTag::where('artist_id', $track->artist_id)->pluck('tag')->toArray();
        $track->album_tags = AlbumTag::where('album_id', $track->album_id)->pluck('tag')->toArray();
        $track->track_tags = TrackTag::where('track_id', $track->track_id)->pluck('tag')->toArray();
        return $track;
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
        $now = $this->now();
        $current_seconds = $now['seconds'];
        if ($date === null) {
            $date = $now['date'];
        }
        $seed = (int) str_replace('-', '', $date);

        // Add the site-specific settings.
        $model = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $settings = new $model();
        $settings->parseInput($request);
        $seed = $settings->modifySeed($seed);
        $sql = $settings->generateSql($request, $date);
        $tracks = \DB::select($sql, array_merge(['seed1' => $seed], $settings->getExtraSqlParams($seed)));

        if (count($tracks) == 0) {
            return null;
        }

        // Make sure we have enough to cover a whole day. If we don't, repeat until we do.
        $tracks = self::fillDay($tracks);
        $jump_index = self::findCurrentIndex($tracks, $current_seconds);

        $current_track = $this->attachTags($tracks[$jump_index]);
        $previous_track_count = (int) getenv('PREVIOUS_TRACK_COUNT');
        $next_track_count = (int) getenv('NEXT_TRACK_COUNT');
        $previous_tracks = [];
        $next_tracks = [];

        // TODO: Use eager-loading when retrieving the tracks instead of multiple queries here.
        for ($i = 0; $i < $previous_track_count; $i++) {
            $index = $jump_index - 1 - $i;
            if (isset($tracks[$index])) {
                $previous_tracks[] = $this->attachTags($tracks[$index]);
            }
        }

        for ($i = 0; $i < $next_track_count; $i++) {
            $index = $jump_index + 1 + $i;
            if (isset($tracks[$index])) {
                $next_tracks[] = $this->attachTags($tracks[$index]);
            }
        }

        return [
            'current_seconds' => $current_seconds,
            'date' => $date,
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
