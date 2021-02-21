<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class Settings extends Model
{
    use HasFactory;

    public $settings;

    public function __construct() {
        $this->settings = [];
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
}