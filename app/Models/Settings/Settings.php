<?php

namespace App\Models\Settings;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Stats;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class Settings extends Model
{
    use HasFactory;

    public $settings;
    public $extra_params;
    public $selectedType;
    public $selectedId;

    public function __construct() {
        $this->settings = [];
        $this->extra_params = [];
        $this->selectedType = null;
        $this->selectedId = null;
    }

    public function getAllTags() {
        return [];
    }

    public function hasSetting($setting) {
        return (isset($this->settings[$setting]));
    }

    /**
     * @param Request $request
     * @return mixed
     */
    public function parseInput(Request $request) {
        $settings = (array) json_decode($request->input('settings'));
        foreach ($settings as $setting => $value) {
            if ($this->hasSetting($setting) && isset($value)) {
                $this->settings[$setting] = $value;
            }
        }

        // Check if we have a valid artist or album.
        $this->selectedType = $request->input('selectedType');
        $selectedId = $request->input('selectedId');

        if (is_numeric($selectedId)) {
            $field = 'id';
        } else {
            $field = 'spotify_id';
        }

        if ($this->selectedType == 'artist') {
            $artist = Artist::where($field, $selectedId)->first();
            if ($artist) {
                $this->extra_params['selected_id'] = $artist->id;
            }
        } else if ($this->selectedType == 'album') {
            $album = Album::where($field, $selectedId)->first();
            if ($album) {
                $this->extra_params['selected_id'] = $album->id;
            }
        }
    }

    /**
     * @param string $setting
     * @param string $value
     * @return bool
     */
    public function is_equal_to($setting, $value) {
        return (isset($this->settings[$setting]) && $this->settings[$setting] == $value);
    }

    /**
     * @param Request $request;
     * @param string $date
     * @param int $seed
     * @return string
     */
    public function generateSql(Request $request) {
        $this->parseInput($request);

        // TODO: Use Eloquent for the query.
        $sql = "SELECT track_schedule.*,
                    SEC_TO_TIME(ROUND(track_schedule.secs_start)) AS time_start,
                    SEC_TO_TIME(ROUND(track_schedule.secs_end)) AS time_end
                FROM (
                    SELECT limited_to_artist_max.*,
                    CAST(@timestart AS INT) AS secs_start,
                        (@timestart := @timestart + ROUND((youtube_duration_ms - (COALESCE(youtube_start_ms, 0) - COALESCE(youtube_end_ms, 0) + COALESCE(youtube_post_delay_ms, 0))) / 1000)
                        ) AS secs_end
                    FROM (
                        SELECT randomized_tracks.*, COALESCE(af.tracks_per_day_modifier, 0) AS tracks_modifier
                        FROM (
                            SELECT base_view.*, RANK() OVER (PARTITION BY base_view.artist_id ORDER BY RAND(:seed1)) AS position
                            FROM (
                                SELECT m.*, " . $this->generateSqlColumns() . "
                                FROM _music m " . $this->generateSqlJoins() . "
                                WHERE m.is_usable = 1
                                    AND m.max_created_at < :date
                                    AND m.youtube_id IS NOT NULL
                                    AND m.youtube_duration_ms > 75000
                                    AND m.youtube_duration_ms < 600000";

        if ($this->selectedType && isset($this->extra_params['selected_id'])) {
            $sql .= " AND m." . $this->selectedType . "_id = :selected_id ";
        }

        $sql .= " ) AS base_view ";

        $sql .= $this->generateSqlConditions();

        $sql .= " ) AS randomized_tracks
                    LEFT JOIN artist_featured af ON randomized_tracks.artist_id = af.artist_id
                    WHERE randomized_tracks.position <= (randomized_tracks.allowed_tracks_per_day + COALESCE(af.tracks_per_day_modifier, 0))
                    ORDER BY RAND(:seed2)
                    ) AS limited_to_artist_max,
                    (SELECT @timestart := 0) AS ts
                ) AS track_schedule
                WHERE track_schedule.secs_end < 86400";

        return $sql;
    }

    public function generateSqlColumns() {
    }

    public function generateSqlJoins() {
    }

    public function generateSqlConditions() {
    }

    /**
     * @param int $seed
     * @return int
     */
    public function modifySeed($seed) {
        return $seed;
    }

    /**
     * Retrieve any extra parameters needed for the query. The $seed is passed in the function in case we need to use it.
     *
     * @param int $seed
     * @return array
     */
    public function getExtraSqlParams($seed) {
        foreach ($this->extra_params as $key => &$value) {
            if ($value == '{{seed}}') {
                $value = $seed;
            }
        }
        return ($this->extra_params);
    }

    /**
     * Get stats for the site.
     *
     * @return object
     */
    public function stats() {
        $last_updated = Stats::last_updated();
        if (time() - strtotime($last_updated) >= (int) getenv('UPDATE_STATS_SECONDS')) {
            $sql = "SELECT COUNT(DISTINCT t.id) AS total
                    FROM tracks t
                    INNER JOIN artist_tracks arttrk ON t.id = arttrk.track_id
                    INNER JOIN artists art ON arttrk.artist_id = art.id
                    INNER JOIN track_sources ts ON t.id = ts.track_id
                    LEFT JOIN albums alb ON t.album_id = alb.id
                    WHERE (t.is_usable + COALESCE(alb.is_usable, 1) + art.is_usable = 3)";
            $track_count = \DB::select(\DB::raw($sql))[0]->total;

            $stats = Stats::where('key', 'tracks')->first();
            if (!$stats) {
                $stats = new Stats();
                $stats->key = 'track_count';
                $stats->value = $track_count;
                $stats->created_at = time();
                $stats->updated_at = time();
                $stats->save();
            } else {
                $stats->value = $track_count;
                $stats->updated_at = time();
                $stats->save();
            }

            $sql = "SELECT COUNT(DISTINCT alb.id) AS total
                    FROM albums alb
                    INNER JOIN artist_albums artalb ON alb.id = artalb.album_id
                    INNER JOIN artists art ON artalb.artist_id = art.id
                    WHERE alb.is_usable = 1 AND art.is_usable = 1";
            $album_count = \DB::select(\DB::raw($sql))[0]->total;

            $stats = Stats::where('key', 'albums')->first();
            if (!$stats) {
                $stats = new Stats();
                $stats->key = 'album_count';
                $stats->value = $album_count;
                $stats->created_at = time();
                $stats->updated_at = time();
                $stats->save();
            } else {
                $stats->value = $album_count;
                $stats->updated_at = time();
                $stats->save();
            }

            $sql = "SELECT COUNT(DISTINCT art.id) AS total
                    FROM artists art
                    WHERE art.is_usable = 1";
            $artist_count = \DB::select(\DB::raw($sql))[0]->total;

            $stats = Stats::where('key', 'artists')->first();
            if (!$stats) {
                $stats = new Stats();
                $stats->key = 'artist_count';
                $stats->value = $artist_count;
                $stats->created_at = time();
                $stats->updated_at = time();
                $stats->save();
            } else {
                $stats->value = $artist_count;
                $stats->updated_at = time();
                $stats->save();
            }
        }

        return [
            'tracks' => Stats::track_count(),
            'albums' => Stats::album_count(),
            'artists' => Stats::artist_count(),
            'plays' => 0,
        ];
    }
}