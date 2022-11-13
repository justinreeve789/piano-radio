<?php

namespace App\Models\Settings;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Stats;
use App\Models\Tag;
use App\Models\TrackSeed;
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
        // Check if we have a valid artist or album. If we do, don't parse the settings input.
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
        } else {
            // No artist or album is specified. Proceed with settings as normal.
            $settings = (array) json_decode($request->input('settings'));
            foreach ($settings as $setting => $value) {
                if ($this->hasSetting($setting) && isset($value)) {
                    $this->settings[$setting] = $value;
                }
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
    public function generateSql(Request $request, $date = null) {
        if ($date === null) {
            $date = date('Y-m-d');
        }

        // Determine our limited sample size from track_generated_data, since this should only contain usable tracks.
        $limitsql = "SELECT COUNT(*) total
                     FROM track_generated_data";
        $result = \DB::select(\DB::raw($limitsql));
        $total = (int) $result[0]->total;
        $sample = ceil(max(min($total / 8, 10000), 500));

        // TODO: Use Eloquent for the query.
        $sql = "SELECT daily_view.*
                FROM (
SELECT sched_view.*, CAST(@timestart AS INT) AS secs_start,
                        (@timestart := @timestart + ROUND((COALESCE(sched_view.youtube_duration_ms, 0) - (COALESCE(sched_view.youtube_start_ms, 0) - COALESCE(sched_view.youtube_end_ms, 0) + COALESCE(sched_view.youtube_post_delay_ms, 0))) / 1000)
                        ) AS secs_end
                    FROM (SELECT @timestart := 0) AS sched, (
SELECT ROW_NUMBER() OVER (PARTITION BY artist_id ORDER BY position) AS artist_occurrences, base_view.*
                        FROM (
                            SELECT
                                t.id, tgd.position,
                                a.id AS artist_id, a.name AS artist_name, a.image_url AS artist_image_url, a.spotify_id AS artist_spotify_id, a.youtube_id AS artist_youtube_id, a.is_usable AS is_usable_artist, af.boost, af.tracks_per_day_modifier,
                                a.usable_tracks_count, a.allowed_tracks_per_day,
                                t.album_id,
                                t.id AS track_id, t.name AS track_name, t.track_number, t.duration_ms, t.spotify_id AS track_spotify_id,
                                ts_youtube.external_id AS youtube_id,
                                ts_youtube.url AS youtube_url,
                                ts_youtube.duration_ms AS youtube_duration_ms,
                                ts_youtube.start_ms AS youtube_start_ms,
                                ts_youtube.end_ms AS youtube_end_ms,
                                ts_youtube.post_delay_ms AS youtube_post_delay_ms,
                                ts_soundcloud.external_id AS soundcloud_id,
                                ts_soundcloud.url AS soundcloud_url,
                                ts_soundcloud.duration_ms AS soundcloud_duration_ms,
                                ts_soundcloud.start_ms AS soundcloud_start_ms,
                                ts_soundcloud.end_ms AS soundcloud_end_ms,
                                t.created_at AS track_created_at,
                            " . $this->generateSqlColumns() . "
                            FROM tracks t
                            INNER JOIN track_tags_bitmask ttb ON t.id = ttb.track_id
                            INNER JOIN track_generated_data tgd ON t.id = tgd.track_id
                            INNER JOIN artists a ON t.artist_id = a.id
                            LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id AND ts_youtube.type = 'youtube' AND ts_youtube.duration_ms > 75000 AND ts_youtube.duration_ms < 600000
                            LEFT JOIN track_sources ts_soundcloud ON t.id = ts_soundcloud.track_id AND ts_soundcloud.type = 'soundcloud' AND ts_soundcloud.duration_ms > 75000 AND ts_soundcloud.duration_ms < 600000
                            LEFT JOIN artist_featured af ON a.id = af.artist_id
                            WHERE (ts_youtube.external_id IS NOT NULL OR ts_soundcloud.external_id IS NOT NULL)
                                AND t.created_at < '2099-12-31' ";

        if (isset($this->extra_params['selected_id'])) {
            if ($this->selectedType == 'artist') {
                $sql .= " AND t.artist_id = :selected_id ";
            }
        } else {
            $sql .= $this->generateSqlConditions();
        }

        $sql .= "
                        ) AS base_view
                        ORDER BY RAND(:seed1)
                        LIMIT 0, " . (int) $sample . "
                    ) AS sched_view";

        // Ignore the allowed_tracks_per_day field if we're playing a single artist.
        if (!isset($this->extra_params['selected_id']) || $this->selectedType != 'artist') {
            $sql .= " WHERE sched_view.artist_occurrences <= sched_view.allowed_tracks_per_day";
        }

        $sql .= "
                ) AS daily_view
                WHERE daily_view.secs_end < 86400";

        return $sql;
    }

    public function generateSqlColumns() {
    }

    public function generateSqlJoins() {
    }

    public function generateSqlConditions() {
    }

    /**
     * Create a unique seed salt based on the user's settings.
     *
     * @param int $seed
     * @return int
     */
    public function modifySeed($seed) {
        $newseed = 0;
        foreach ($this->settings as $setting => $value) {
            for ($i = 0; $i < strlen($setting); $i++) {
                $newseed += ord($setting[$i]);
            }
            if (is_array($value)) {
                $value = implode('', $value);
            }
            $newseed *= ord($value);
            $seed += $newseed;
        }
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

            $stats = Stats::where('key', 'track_count')->where('model', getenv('APP_SETTINGS_MODEL'))->first();
            if (!$stats) {
                $stats = new Stats();
                $stats->key = 'track_count';
                $stats->value = $track_count;
                $stats->model = $_ENV['APP_SETTINGS_MODEL'];
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

            $stats = Stats::where('key', 'album_count')->where('model', getenv('APP_SETTINGS_MODEL'))->first();
            if (!$stats) {
                $stats = new Stats();
                $stats->key = 'album_count';
                $stats->value = $album_count;
                $stats->model = $_ENV['APP_SETTINGS_MODEL'];
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

            $stats = Stats::where('key', 'artist_count')->where('model', getenv('APP_SETTINGS_MODEL'))->first();
            if (!$stats) {
                $stats = new Stats();
                $stats->key = 'artist_count';
                $stats->value = $artist_count;
                $stats->model = $_ENV['APP_SETTINGS_MODEL'];
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

    /**
     * Generate the track data.
     *
     * @param string $date Used to create the seed; if null, current date is used.
     */
    public function updateGeneratedData($date = null)
    {
        if ($date === null) {
            $date = date('d-m-Y');
        }
        $seed = (int)str_replace('-', '', $date);

        // Update the track seed and position data.
        $sql = "REPLACE INTO track_generated_data (track_id, seed, position, created_at, updated_at)
                SELECT DISTINCT t.id, :seed1, CAST(RAND(:seed2) * 100000000 AS INT), NOW(), NOW()
                FROM tracks t
                INNER JOIN albums alb ON t.album_id = alb.id
                INNER JOIN artists art ON t.artist_id = art.id
                LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id
                LEFT JOIN track_sources ts_soundcloud ON t.id = ts_soundcloud.track_id
                WHERE (t.is_usable + COALESCE(alb.is_usable, 1) + art.is_usable = 3)
                    AND (ts_youtube.track_id IS NOT NULL OR ts_soundcloud.track_id IS NOT NULL)";
        \DB::insert($sql, ['seed1' => $seed, 'seed2' => $seed]);

        // Delete any tracks that are no longer usable or don't have a valid source.
        $sql = "DELETE FROM track_generated_data
                WHERE track_id NOT IN (
                    SELECT DISTINCT t.id
                    FROM tracks t
                    INNER JOIN albums alb ON t.album_id = alb.id
                    INNER JOIN artists art ON t.artist_id = art.id
                    LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id
                    LEFT JOIN track_sources ts_soundcloud ON t.id = ts_soundcloud.track_id
                    WHERE (t.is_usable + COALESCE(alb.is_usable, 1) + art.is_usable = 3)
                        AND (ts_youtube.track_id IS NOT NULL OR ts_soundcloud.track_id IS NOT NULL)
                )";
        \DB::delete($sql);

        $this->updateArtistTrackCounts();
    }

    /**
     * Update the artist's usable_tracks_count and allowed_tracks_per_day.
     * @return void
     */
    public function updateArtistTrackCounts() {
        $sql = "UPDATE artists art
                INNER JOIN (
                    SELECT artr1.artist_id,
                        art1.name AS artist_name,
                        COUNT(artr1.track_id) AS usable_tracks_count,
                        COALESCE(FLOOR(1 + LOG10(POWER(COUNT(artr1.track_id), 4) / LN(COUNT(artr1.track_id) + 0.01))), 0) AS allowed_tracks_per_day
                    FROM tracks t1
                    INNER JOIN artist_tracks artr1 ON t1.id = artr1.track_id
                    INNER JOIN album_tracks albtrk1 ON t1.id = albtrk1.track_id
                    INNER JOIN artists art1 ON artr1.artist_id = art1.id
                    INNER JOIN albums alb1 ON albtrk1.album_id = alb1.id
                    WHERE (art1.is_usable + alb1.is_usable + t1.is_usable = 3)
                    GROUP BY artr1.artist_id, art1.name
                ) x ON art.id = x.artist_id
                LEFT JOIN artist_featured af ON art.id = af.artist_id
                SET art.usable_tracks_count = x.usable_tracks_count, art.allowed_tracks_per_day = (x.allowed_tracks_per_day + COALESCE(af.tracks_per_day_modifier, 0))";
        \DB::statement($sql);
    }

    /**
     * Update the track tag bitmasks.
     */
    public function updateBitmasks() {
        // Get an array of tags to bitmasks.
        $tag_bitmasks = Tag::pluck('bitmask', 'tag')->toArray();

        $generatedsql_fields = "";
        $generatedsql_joins = "";
        foreach ($this->getAllTags() as $tag => $value) {
            $generatedsql_fields .= "
                CASE
                    WHEN COALESCE(";

            foreach ($this->getAllTags() as $coalescetag => $coalescevalue) {
                $generatedsql_fields .= "tagtrk_" . $coalescetag . ".tag, ";
            }

            foreach ($this->getAllTags() as $coalescetag => $coalescevalue) {
                $generatedsql_fields .= "tagalb_" . $coalescetag . ".tag, ";
            }

            foreach ($this->getAllTags() as $coalescetag => $coalescevalue) {
                $generatedsql_fields .= "tagart_" . $coalescetag . ".tag, ";
            }

            $generatedsql_fields = substr($generatedsql_fields, 0, -2);
            $generatedsql_fields .= ") = '" . $tag . "' THEN 1 ELSE 0 END AS " . $tag . ", ";

            $generatedsql_joins .= "
                LEFT JOIN track_tags tagtrk_" . $tag . " ON t.id = tagtrk_" . $tag . ".track_id AND tagtrk_" . $tag . ".tag = '" . $tag . "'
                LEFT JOIN album_tags tagalb_" . $tag . " ON t.album_id = tagalb_" . $tag . ".album_id AND tagalb_" . $tag . ".tag = '" . $tag . "'
                LEFT JOIN artist_tags tagart_" . $tag . " ON t.artist_id = tagart_" . $tag . ".artist_id AND tagart_" . $tag . ".tag = '" . $tag . "'";
        }

        $sql = "SELECT DISTINCT t.id AS track_id, " . substr($generatedsql_fields, 0, -2) . "
                FROM tracks t
                INNER JOIN artists art ON t.artist_id = art.id
                INNER JOIN albums alb ON t.album_id = alb.id " . $generatedsql_joins . "
                WHERE (t.is_usable + COALESCE(alb.is_usable, 1) + art.is_usable = 3)
                GROUP BY t.id";
        $results = \DB::select(\DB::raw($sql));

        foreach ($results as $result) {
            $bitmask = 0;

            foreach ($result as $var => $value) {
                if ($var == 'track_id' || $value == 0) {
                    continue;
                }

                if (isset($tag_bitmasks[$var])) {
                    $bitmask += $tag_bitmasks[$var];
                }
            }

            $sql = "REPLACE INTO track_tags_bitmask (track_id, bitmask, created_at, updated_at)
                    VALUES (:track_id, :bitmask, NOW(), NOW())";
            \DB::statement($sql, ['track_id' => $result->track_id, 'bitmask' => $bitmask]);
        }
    }
}