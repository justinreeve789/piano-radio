<?php

namespace App\Models\Settings;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

const GENRE_WHATEVER = 0;
const NEVER = 0;
const SOMETIMES = 1;
const ALWAYS = 2;
const MOOD_LOW = 1;
const MOOD_MEDIUM = 2;
const MOOD_HIGH = 3;
const OFF = 0;
const ON = 1;

class EpicMusic extends Settings
{
    use HasFactory;

    public function __construct() {
        $this->settings = [
            'genres' => [],
            'mood' => 0,
            'years' => [],
        ];
        $this->extra_params = [];
    }

    public function getAllTags() {
        return [
        ];
    }

    public function getConditions() {
        return [
            'mood' => [
                'mild' => 1,
                'moderate' => 2,
                'maximum' => 3,
            ],
        ];
    }

    public function generateSqlColumns() {
        $sql = " tgd.float1 AS mood ";
        return $sql;
    }

    public function generateSqlJoins() {
        $sql = " INNER JOIN track_generated_data tgd ON t.id = tgd.track_id ";
        return $sql;
    }

    public function generateSqlConditions() {
        $sql = '';

        // Determine our limited sample size from track_generated_data, since this should only contain usable tracks.
        $limitsql = "SELECT COUNT(*) total
                     FROM track_generated_data";
        $result = \DB::select($limitsql);
        $total = $result[0]->total;
        $limit = floor(max(100, $total / 3));

        if (isset($this->settings['mood'])) {
            if ($this->settings['mood'] == MOOD_LOW) {
                // Sort by lowest mood first.
                $sql .= " ORDER BY mood ASC ";
                $sql .= " LIMIT 0, " . $limit;
            } else if ($this->settings['mood'] == MOOD_MEDIUM) {
                // Sort by deviation from the mean.
                $sql .= " ORDER BY ABS(mood - AVG(mood) OVER(PARTITION BY NULL)) ";
                $sql .= " LIMIT 0, " . $limit;
            } else if ($this->settings['mood'] == MOOD_HIGH) {
                // Sort by highest mood first.
                $sql .= " ORDER BY mood DESC ";
                $sql .= " LIMIT 0, " . $limit;
            } else {
                // Sort by position.
                $sql .= " ORDER BY tgd.position ";;
            }
        }

        return $sql;
    }

    /**
     * Update the generated track data.
     */
    public function updateGeneratedData($date = null) {
        parent::updateGeneratedData();

        // Update float1 with mood value.
        $sql = "UPDATE track_generated_data tgd, (
					SELECT
                        t.id,
                        ROUND((COALESCE(tdo.danceability, td.danceability) * 2) + (COALESCE(tdo.energy, td.energy) * 3) + (5 / ABS(COALESCE(tdo.loudness, td.loudness))) + (LOG(GREATEST(COALESCE(tdo.tempo, td.tempo), 40) / 2)), 4) AS mood
                    FROM
                        tracks t
                    INNER JOIN track_data td ON
                        t.id = td.track_id
                    LEFT JOIN track_data_overrides tdo ON
                        t.id = tdo.track_id) AS tdx
                SET tgd.float1 = tdx.mood
				WHERE tgd.track_id = tdx.id";
        \DB::statement($sql);

        // Find average values we can use for any tracks that don't have mood data, but do have mood tags.
        // If there isn't a mood tag, just default to "moderate."
        $sql = "UPDATE track_generated_data tgd, (
                    SELECT tt.track_id,
                    CASE
                        WHEN tt.tag = 'mild' THEN (SELECT ((MIN(float1) + AVG(float1)) / 2) FROM track_generated_data)
                        WHEN tt.tag = 'maximum' THEN (SELECT ((MAX(float1) + AVG(float1)) / 2) FROM track_generated_data)
                        ELSE (SELECT AVG(float1) FROM track_generated_data)
                    END AS mood
                    FROM (
                    SELECT t.id AS track_id, COALESCE(tagtrk_mild.tag, tagtrk_moderate.tag, tagtrk_maximum.tag,tagalb_mild.tag, tagalb_moderate.tag, tagalb_maximum.tag, tagart_mild.tag, tagart_moderate.tag, tagart_maximum.tag) AS tag
                    FROM track_generated_data tgd
                        INNER JOIN tracks t ON tgd.track_id = t.id
                        INNER JOIN albums alb ON t.album_id = alb.id
                        INNER JOIN artists art ON t.artist_id = art.id
                        LEFT JOIN artist_tags tagart_mild ON t.artist_id = tagart_mild.artist_id AND tagart_mild.tag = 'mild'
                        LEFT JOIN artist_tags tagart_moderate ON t.artist_id = tagart_moderate.artist_id AND tagart_moderate.tag = 'moderate'
                        LEFT JOIN artist_tags tagart_maximum ON t.artist_id = tagart_maximum.artist_id AND tagart_maximum.tag = 'maximum'
                        LEFT JOIN album_tags tagalb_mild ON t.album_id = tagalb_mild.album_id AND tagalb_mild.tag = 'mild'
                        LEFT JOIN album_tags tagalb_moderate ON t.album_id = tagalb_moderate.album_id AND tagalb_moderate.tag = 'moderate'
                        LEFT JOIN album_tags tagalb_maximum ON t.album_id = tagalb_maximum.album_id AND tagalb_maximum.tag = 'maximum'
                        LEFT JOIN track_tags tagtrk_mild ON t.id = tagtrk_mild.track_id AND tagtrk_mild.tag = 'mild'
                        LEFT JOIN track_tags tagtrk_moderate ON t.id = tagtrk_moderate.track_id AND tagtrk_moderate.tag = 'moderate'
                        LEFT JOIN track_tags tagtrk_maximum ON t.id = tagtrk_maximum.track_id AND tagtrk_maximum.tag = 'maximum'
                    WHERE tgd.float1 IS NULL) AS tt
                ) AS tdx
                SET tgd.float1 = tdx.mood
                WHERE tgd.track_id = tdx.track_id";
        \DB::statement($sql);
    }
 }