<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

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
        $sql = " ROUND((2 * LOG(danceability * 4) / 9) + (valence / 5) + (((danceability / 2) + (7 * energy)) / 5) + (3 * LN(5.5 * energy) / 2) + LOG(1 + valence * 2 + (mode / 3)) + (1.25 * LOG((0.01 + tempo) * POWER((0.01 + energy), 1.5))) + (3 / (ABS(loudness))), 4) AS mood,
                CASE
                    WHEN COALESCE(tagtrk_christmas.tag, tagtrk_sacred.tag, tagtrk_classical.tag, tagalb_christmas.tag, tagalb_sacred.tag, tagalb_classical.tag, tagart_christmas.tag, tagart_sacred.tag, tagart_classical.tag) = 'christmas' THEN 1
                    ELSE 0
                END AS is_christmas,
                CASE
                    WHEN COALESCE(tagtrk_christmas.tag, tagtrk_sacred.tag, tagtrk_classical.tag, tagalb_christmas.tag, tagalb_sacred.tag, tagalb_classical.tag, tagart_christmas.tag, tagart_sacred.tag, tagart_classical.tag) = 'sacred' THEN 1
                    ELSE 0
                END AS is_sacred,
                CASE
                    WHEN COALESCE(tagtrk_christmas.tag, tagtrk_sacred.tag, tagtrk_classical.tag, tagalb_christmas.tag, tagalb_sacred.tag, tagalb_classical.tag, tagart_christmas.tag, tagart_sacred.tag, tagart_classical.tag) = 'classical' THEN 1
                    ELSE 0
                END AS is_classical,
                CASE
                    WHEN COALESCE(tagtrk_solo.tag, tagtrk_instrumental.tag, tagalb_solo.tag, tagalb_instrumental.tag, tagart_solo.tag, tagart_instrumental.tag) = 'solo' THEN 1
                    ELSE 0
                END AS is_solo,
                CASE
                    WHEN COALESCE(tagtrk_solo.tag, tagtrk_instrumental.tag, tagalb_solo.tag, tagalb_instrumental.tag, tagart_solo.tag, tagart_instrumental.tag) = 'instrumental' THEN 1
                    ELSE 0
                END AS is_instrumental ";
        return $sql;
    }

    public function generateSqlJoins() {
        $sql = " LEFT JOIN artist_tags tagart_christmas ON m.artist_id = tagart_christmas.artist_id AND tagart_christmas.tag = 'christmas'
            LEFT JOIN artist_tags tagart_sacred ON m.artist_id = tagart_sacred.artist_id AND tagart_sacred.tag = 'sacred'
            LEFT JOIN artist_tags tagart_classical ON m.artist_id = tagart_classical.artist_id AND tagart_classical.tag = 'classical'
            LEFT JOIN artist_tags tagart_game ON m.artist_id = tagart_game.artist_id AND tagart_game.tag = 'game'
            LEFT JOIN artist_tags tagart_cover ON m.artist_id = tagart_cover.artist_id AND tagart_cover.tag = 'cover'
            LEFT JOIN artist_tags tagart_solo ON m.artist_id = tagart_solo.artist_id AND tagart_solo.tag = 'solo'
            LEFT JOIN artist_tags tagart_instrumental ON m.artist_id = tagart_instrumental.artist_id AND tagart_instrumental.tag = 'instrumental'
            LEFT JOIN album_tags tagalb_christmas ON m.album_id = tagalb_christmas.album_id AND tagalb_christmas.tag = 'christmas'
            LEFT JOIN album_tags tagalb_sacred ON m.album_id = tagalb_sacred.album_id AND tagalb_sacred.tag = 'sacred'
            LEFT JOIN album_tags tagalb_classical ON m.album_id = tagalb_classical.album_id AND tagalb_classical.tag = 'classical'
            LEFT JOIN album_tags tagalb_game ON m.album_id = tagalb_game.album_id AND tagalb_game.tag = 'game'
            LEFT JOIN album_tags tagalb_cover ON m.album_id = tagalb_cover.album_id AND tagalb_cover.tag = 'cover'
            LEFT JOIN album_tags tagalb_solo ON m.album_id = tagalb_solo.album_id AND tagalb_solo.tag = 'solo'
            LEFT JOIN album_tags tagalb_instrumental ON m.album_id = tagalb_instrumental.album_id AND tagalb_instrumental.tag = 'instrumental'
            LEFT JOIN track_tags tagtrk_christmas ON m.track_id = tagtrk_christmas.track_id AND tagtrk_christmas.tag = 'christmas'
            LEFT JOIN track_tags tagtrk_sacred ON m.track_id = tagtrk_sacred.track_id AND tagtrk_sacred.tag = 'sacred'
            LEFT JOIN track_tags tagtrk_classical ON m.track_id = tagtrk_classical.track_id AND tagtrk_classical.tag = 'classical'
            LEFT JOIN track_tags tagtrk_game ON m.track_id = tagtrk_game.track_id AND tagtrk_game.tag = 'game'
            LEFT JOIN track_tags tagtrk_cover ON m.track_id = tagtrk_cover.track_id AND tagtrk_cover.tag = 'cover'
            LEFT JOIN track_tags tagtrk_solo ON m.track_id = tagtrk_solo.track_id AND tagtrk_solo.tag = 'solo'
            LEFT JOIN track_tags tagtrk_instrumental ON m.track_id = tagtrk_instrumental.track_id AND tagtrk_instrumental.tag = 'instrumental' ";
        return $sql;
    }

    public function generateSqlConditions() {
        // Retrieve the total number of possible records so we know how large our randomized sample can be.
        $limitsql = "SELECT total.*, MIN(mood) AS min_mood, MAX(mood) AS max_mood
                     FROM (
                        SELECT m.*, " . $this->generateSqlColumns() . "
                        FROM _music m " . $this->generateSqlJoins() . "
                     ) AS total
                     WHERE 1 = 1 ";
        $sql = '';
        foreach ($this->settings as $setting => $value) {
            switch ($setting) {
                case 'christmas':
                    if ($value == CHRISTMAS_NEVER) {
                        $sql .= " AND is_christmas = 0 ";
                        $limitsql .= " AND is_christmas = 0 ";
                    } else if ($value == CHRISTMAS_ALWAYS) {
                        $sql .= " AND is_christmas = 1 ";
                        $limitsql .= " AND is_christmas = 1 ";
                    }
                    break;
                case 'classical':
                    if ($value == CLASSICAL_NEVER) {
                        $sql .= " AND is_classical = 0 ";
                        $limitsql .= " AND is_classical = 0 ";
                    } else if ($value == CLASSICAL_ALWAYS) {
                        $sql .= " AND is_classical = 1 ";
                        $limitsql .= " AND is_classical = 1 ";
                    }
                    break;
                case 'sacred':
                    if ($value == SACRED_NEVER) {
                        $sql .= " AND is_sacred = 0 ";
                        $limitsql .= " AND is_sacred = 0 ";
                    } else if ($value == SACRED_ALWAYS) {
                        $sql .= " AND is_sacred = 1 ";
                        $limitsql .= " AND is_sacred = 1 ";
                    }
                    break;
                case 'style':
                    if ($this->settings[$setting] == STYLE_SOLO) {
                        $sql .= " AND is_solo = 1 ";
                        $limitsql .= " AND is_solo = 1 ";
                    } else if ($this->settings[$setting] == STYLE_INSTRUMENTAL) {
                        $sql .= " AND is_instrumental = 1 ";
                        $limitsql .= " AND is_instrumental = 1 ";
                    }
                    break;
                default:
                    break;
            }
        }

        $limit = count(\DB::select(\DB::raw($limitsql)));
        $limit = max(100, $limit / 3);
        $limit = floor(min($limit, 1500));

        if (isset($this->settings['mood'])) {
            if ($this->settings['mood'] == MOOD_GENTLE) {
                // Sort by lowest mood first.
                $sql .= " ORDER BY mood ASC";
            } else if ($this->settings['mood'] == MOOD_NATURAL) {
                // Sort by deviation from the mean.
                $sql .= " ORDER BY ABS(mood - AVG(mood) OVER(PARTITION BY NULL))";
            } else if ($this->settings['mood'] == MOOD_LIVELY) {
                // Sort by highest mood first.
                $sql .= " ORDER BY mood DESC";
            } else {
                // Use the random seed.
                $this->extra_params['seed3'] = '{{seed}}';
                $sql .= " ORDER BY RAND(:seed3)";
            }
        }

        // Always include a limit if there's conditions, so we're narrowing the scope of the sort. Otherwise, the
        // filters will just be undone in the parent query.
        if ($sql != '') {
            // TODO: Create or use a lightweight SQL class so we're not doing dumb stuff like this.
            $sql = ' WHERE 1 = 1 ' . $sql . ' LIMIT 0, ' . $limit . ' ';
        }

        return $sql;
    }

    /**
     * @param int $seed
     * @return int
     */
    public function modifySeed($seed) {
        ksort($this->settings);
        foreach ($this->settings as $key => $value) {
            $seed .= $value;
        }
        return $seed;
    }
}
