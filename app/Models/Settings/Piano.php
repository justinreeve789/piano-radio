<?php

namespace App\Models\Settings;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Tag;
use App\Models\Track;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

const NEVER = 0;
const SOMETIMES = 1;
const ALWAYS = 2;
const CHRISTMAS_NEVER = 0;
const CHRISTMAS_SOMETIMES = 1;
const CHRISTMAS_ALWAYS = 2;
const CLASSICAL_NEVER = 0;
const CLASSICAL_SOMETIMES = 1;
const CLASSICAL_ALWAYS = 2;
const SACRED_NEVER = 0;
const SACRED_SOMETIMES = 1;
const SACRED_ALWAYS = 2;
const MOOD_GENTLE = 1;
const MOOD_NATURAL = 2;
const MOOD_LIVELY = 3;
const STYLE_SOLO = 1;
const STYLE_INSTRUMENTAL = 2;

class Piano extends Settings
{
    use HasFactory;

    public function __construct() {
        $this->settings = [
            'christmas' => 1,
            'classical' => 1,
            'sacred' => 1,
            'mood' => 0,
            'style' => 0,
        ];
        $this->extra_params = [];
    }

    public function getAllTags() {
        return [
            'christmas',
            'classical',
            'sacred',
            'solo',
            'instrumental',
        ];
    }

    public function getConditions() {
        return [
            'christmas' => [
                'false' => 0,
                'true' => 2,
            ],
            'classical' => [
                'false' => 0,
                'true' => 2,
            ],
            'sacred' => [
                'false' => 0,
                'true' => 2,
            ],
            'mood' => [
                'gentle' => 1,
                'natural' => 2,
                'lively' => 3,
            ],
            'style' => [
                'solo' => 1,
                'instrumental' => 2,
            ],
        ];
    }

    public function generateSqlColumns() {
        $sql = " tgd.float1 AS mood ";
        return $sql;
    }

    public function generateSqlJoins() {
    }

    public function generateSqlConditions() {
        $sql = '';

        $tags = Tag::all()->toArray();
        $never = $sometimes = $always = [];
        foreach ($tags as $index => $tag) {
            if ($tag['tag'] == 'christmas' || $tag['tag'] == 'classical' || $tag['tag'] == 'sacred') {
                if (isset($this->settings[$tag['tag']])) {
                    if ($this->settings[$tag['tag']] == NEVER) {
                        $never[] = "ttb.bitmask & " . $tag['bitmask'] . " = 0";
                    } else if ($this->settings[$tag['tag']] == SOMETIMES) {
                        $sometimes[] = "ttb.bitmask & " . $tag['bitmask'];
                    }
                    if ($this->settings[$tag['tag']] == ALWAYS) {
                        $always[] = "ttb.bitmask & " . $tag['bitmask'];
                    }
                }
            } else if ($tag['tag'] == 'solo' && $this->settings['style'] == STYLE_SOLO) {
                $always[] = "ttb.bitmask & " . $tag['bitmask'];
            } else if ($tag['tag'] == 'instrumental' && $this->settings['style'] == STYLE_INSTRUMENTAL) {
                $always[] = "ttb.bitmask & " . $tag['bitmask'];
            }
        }

        foreach ($never as $x) {
            $sql .= " AND " . $x;
        }

        // The "sometimes" logic isn't actually needed.
/*
        $sql_sometimes = '';
        foreach ($sometimes as $x) {
            if ($sql_sometimes == '') {
                $sql_sometimes = " AND (";
            } else {
                $sql_sometimes .= " OR ";
            }
            $sql_sometimes .= $x;
        }
        if ($sql_sometimes != '') {
            $sql_sometimes .= ") ";
        }
        $sql .= $sql_sometimes;
*/
        foreach ($always as $x) {
            $sql .= " AND " . $x;
        }

        // Determine our limited sample size from track_generated_data, since this should only contain usable tracks.
        $limitsql = "SELECT COUNT(*) total
                     FROM track_generated_data";
        $result = \DB::select(\DB::raw($limitsql));
        $total = $result[0]->total;

        if (isset($this->settings['mood'])) {
            if ($this->settings['mood'] == MOOD_GENTLE) {
                // Sort by lowest mood first.
                $sql .= " ORDER BY mood ASC ";
                $sql .= " LIMIT 0, " . floor(max(100, $total / 8));
            } else if ($this->settings['mood'] == MOOD_NATURAL) {
                // Sort by deviation from the mean.
                $sql .= " ORDER BY ABS(mood - AVG(mood) OVER(PARTITION BY NULL)) ";
                $sql .= " LIMIT 0, " . floor(max(100, $total * 0.75));
            } else if ($this->settings['mood'] == MOOD_LIVELY) {
                // Sort by highest mood first.
                $sql .= " ORDER BY mood DESC ";
                $sql .= " LIMIT 0, " . floor(max(100, $total / 8));
            } else {
                // Sort by position.
                $sql .= " ORDER BY position ";
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
					SELECT t.id,
    					ROUND((LOG((COALESCE(tdo.danceability, td.danceability) + 0.01) * 2.5) / 9) + ((COALESCE(tdo.valence, td.valence) + 0.01) / 5) + (((COALESCE(tdo.danceability, td.danceability) / 2) + (7 * COALESCE(tdo.energy, td.energy))) / 5) + (3 * LN(0.01 + 6.25 * COALESCE(tdo.energy, td.energy)) / 2) + LOG(1 + COALESCE(tdo.valence, td.valence) * 2 + (COALESCE(tdo.mode, td.mode) / 3)) + (1.25 * LOG((0.01 + COALESCE(tdo.tempo, td.tempo)) * POWER((0.01 + COALESCE(tdo.energy, td.energy)), 1.75))) + (3 / (0.01 + ABS(COALESCE(tdo.loudness, td.loudness)))), 4) AS mood
    				FROM tracks t
                    INNER JOIN track_data td ON t.id = td.track_id
                    LEFT JOIN track_data_overrides tdo ON t.id = tdo.track_id
				) AS tdx
				SET tgd.float1 = tdx.mood
				WHERE tgd.track_id = tdx.id";
        \DB::statement($sql);

        // Find average values we can use for any tracks that don't have mood data, but do have mood tags.
        // If there isn't a mood tag, just default to "natural."
        $sql = "UPDATE track_generated_data tgd, (
                    SELECT tt.track_id,
                    CASE
                        WHEN tt.tag = 'soft' THEN (SELECT ((MIN(float1) + AVG(float1)) / 2) FROM track_generated_data)
                        WHEN tt.tag = 'lively' THEN (SELECT ((MAX(float1) + AVG(float1)) / 2) FROM track_generated_data)
                        ELSE (SELECT AVG(float1) FROM track_generated_data)
                    END AS mood
                    FROM (
                    SELECT t.id AS track_id, COALESCE(tagtrk_soft.tag, tagtrk_natural.tag, tagtrk_lively.tag,tagalb_soft.tag, tagalb_natural.tag, tagalb_lively.tag, tagart_soft.tag, tagart_natural.tag, tagart_lively.tag) AS tag
                    FROM track_generated_data tgd
                        INNER JOIN tracks t ON tgd.track_id = t.id
                        INNER JOIN albums alb ON t.album_id = alb.id
                        INNER JOIN artists art ON t.artist_id = art.id
                        LEFT JOIN artist_tags tagart_soft ON t.artist_id = tagart_soft.artist_id AND tagart_soft.tag = 'soft'
                        LEFT JOIN artist_tags tagart_natural ON t.artist_id = tagart_natural.artist_id AND tagart_natural.tag = 'natural'
                        LEFT JOIN artist_tags tagart_lively ON t.artist_id = tagart_lively.artist_id AND tagart_lively.tag = 'lively'
                        LEFT JOIN album_tags tagalb_soft ON t.album_id = tagalb_soft.album_id AND tagalb_soft.tag = 'soft'
                        LEFT JOIN album_tags tagalb_natural ON t.album_id = tagalb_natural.album_id AND tagalb_natural.tag = 'natural'
                        LEFT JOIN album_tags tagalb_lively ON t.album_id = tagalb_lively.album_id AND tagalb_lively.tag = 'lively'
                        LEFT JOIN track_tags tagtrk_soft ON t.id = tagtrk_soft.track_id AND tagtrk_soft.tag = 'soft'
                        LEFT JOIN track_tags tagtrk_natural ON t.id = tagtrk_natural.track_id AND tagtrk_natural.tag = 'natural'
                        LEFT JOIN track_tags tagtrk_lively ON t.id = tagtrk_lively.track_id AND tagtrk_lively.tag = 'lively'
                    WHERE tgd.float1 IS NULL) AS tt
                ) AS tdx
                SET tgd.float1 = tdx.mood
                WHERE tgd.track_id = tdx.track_id";
        \DB::statement($sql);
    }

    /**
     * Update the track tag bitmasks.
     */
    public function updateBitmasks() {
        // Get an array of tags to bitmasks.
        $tag_bitmasks = Tag::pluck('bitmask', 'tag')->toArray();

        $sql = "TRUNCATE track_tags_bitmask";
        \DB::statement($sql);

        $sql = "
      		    SELECT DISTINCT t.id AS track_id,
                    CASE
                        WHEN COALESCE(tagtrk_christmas.tag, tagtrk_sacred.tag, tagtrk_classical.tag, tagalb_christmas.tag, tagalb_sacred.tag, tagalb_classical.tag, tagart_christmas.tag, tagart_sacred.tag, tagart_classical.tag) = 'christmas' THEN 1
                        ELSE 0
                    END AS christmas,
                    CASE
                        WHEN COALESCE(tagtrk_christmas.tag, tagtrk_sacred.tag, tagtrk_classical.tag, tagalb_christmas.tag, tagalb_sacred.tag, tagalb_classical.tag, tagart_christmas.tag, tagart_sacred.tag, tagart_classical.tag) = 'sacred' THEN 1
                        ELSE 0
                    END AS sacred,
                    CASE
                        WHEN COALESCE(tagtrk_christmas.tag, tagtrk_sacred.tag, tagtrk_classical.tag, tagalb_christmas.tag, tagalb_sacred.tag, tagalb_classical.tag, tagart_christmas.tag, tagart_sacred.tag, tagart_classical.tag) = 'classical' THEN 1
                        ELSE 0
                    END AS classical,
                    CASE
                        WHEN COALESCE(tagtrk_solo.tag, tagtrk_instrumental.tag, tagalb_solo.tag, tagalb_instrumental.tag, tagart_solo.tag, tagart_instrumental.tag) = 'solo' THEN 1
                        ELSE 0
                    END AS solo,
                    CASE
                        WHEN COALESCE(tagtrk_solo.tag, tagtrk_instrumental.tag, tagalb_solo.tag, tagalb_instrumental.tag, tagart_solo.tag, tagart_instrumental.tag) = 'instrumental' THEN 1
                        ELSE 0
                    END AS instrumental 
                FROM tracks t
                INNER JOIN artists art ON t.artist_id = art.id
                INNER JOIN albums alb ON t.album_id = alb.id
                LEFT JOIN artist_tags tagart_christmas ON t.artist_id = tagart_christmas.artist_id AND tagart_christmas.tag = 'christmas'
                LEFT JOIN artist_tags tagart_sacred ON t.artist_id = tagart_sacred.artist_id AND tagart_sacred.tag = 'sacred'
                LEFT JOIN artist_tags tagart_classical ON t.artist_id = tagart_classical.artist_id AND tagart_classical.tag = 'classical'
                LEFT JOIN artist_tags tagart_solo ON t.artist_id = tagart_solo.artist_id AND tagart_solo.tag = 'solo'
                LEFT JOIN artist_tags tagart_instrumental ON t.artist_id = tagart_instrumental.artist_id AND tagart_instrumental.tag = 'instrumental'
                LEFT JOIN album_tags tagalb_christmas ON t.album_id = tagalb_christmas.album_id AND tagalb_christmas.tag = 'christmas'
                LEFT JOIN album_tags tagalb_sacred ON t.album_id = tagalb_sacred.album_id AND tagalb_sacred.tag = 'sacred'
                LEFT JOIN album_tags tagalb_classical ON t.album_id = tagalb_classical.album_id AND tagalb_classical.tag = 'classical'
                LEFT JOIN album_tags tagalb_solo ON t.album_id = tagalb_solo.album_id AND tagalb_solo.tag = 'solo'
                LEFT JOIN album_tags tagalb_instrumental ON t.album_id = tagalb_instrumental.album_id AND tagalb_instrumental.tag = 'instrumental'
                LEFT JOIN track_tags tagtrk_christmas ON t.id = tagtrk_christmas.track_id AND tagtrk_christmas.tag = 'christmas'
                LEFT JOIN track_tags tagtrk_sacred ON t.id = tagtrk_sacred.track_id AND tagtrk_sacred.tag = 'sacred'
                LEFT JOIN track_tags tagtrk_classical ON t.id = tagtrk_classical.track_id AND tagtrk_classical.tag = 'classical'
                LEFT JOIN track_tags tagtrk_solo ON t.id = tagtrk_solo.track_id AND tagtrk_solo.tag = 'solo'
                LEFT JOIN track_tags tagtrk_instrumental ON t.id = tagtrk_instrumental.track_id AND tagtrk_instrumental.tag = 'instrumental'
                WHERE (t.is_usable + COALESCE(alb.is_usable, 1) + art.is_usable = 3)
                GROUP BY t.id";
        $results = \DB::select(\DB::raw($sql));

        foreach ($results as $result) {
            $bitmask = 0;
            $currenttime = time();

            foreach ($result as $var => $value) {
                if ($var == 'track_id' || $value == 0) {
                    continue;
                }

                if (isset($tag_bitmasks[$var])) {
                    $bitmask += $tag_bitmasks[$var];
                }
            }

            \DB::table('track_tags_bitmask')
                ->insert([
                    'track_id' => $result->track_id,
                    'bitmask' => $bitmask,
                    'created_at' => $currenttime,
                    'updated_at' => $currenttime,
                ]);
        }
    }
}