<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

const MOOD_GENTLE = 1;
const MOOD_NEUTRAL = 2;
const MOOD_LIVELY = 3;
const STYLE_SOLO = 1;
const STYLE_INSTRUMENTAL = 2;

class ChristmasPiano extends Settings
{
    use HasFactory;

    public function __construct() {
        $this->settings = [
            'mood' => 0,
            'style' => 0,
        ];
        $this->extra_params = [];
    }

    public function getAllTags() {
        return [
            'christmas',
            'solo',
            'instrumental',
        ];
    }

    public function getConditions() {
        return [
            'mood' => [
                'gentle' => 1,
                'neutral' => 2,
                'lively' => 3,
            ],
            'style' => [
                'solo' => 1,
                'instrumental' => 2,

            ],
        ];
    }

    public function generateSqlColumns() {
        $sql = " ROUND((2 * LOG(danceability * 4) / 9) + (valence / 5) + (((danceability / 2) + (7 * energy)) / 5) + (3 * LN(5.5 * energy) / 2) + LOG(1 + valence * 2 + (mode / 3)) + LOG(tempo * (0.01 + energy)) + (3 / (ABS(loudness))), 4) AS mood,
                !ISNULL(COALESCE(tagtrk_christmas.track_id, tagalb_christmas.album_id, tagart_christmas.artist_id)) AS is_christmas,
                !ISNULL(COALESCE(tagtrk_solo.track_id, tagalb_solo.album_id)) AS is_solo,
                !ISNULL(COALESCE(tagtrk_instrumental.track_id, tagalb_instrumental.album_id)) AS is_instrumental ";
        return $sql;
    }

    public function generateSqlJoins() {
        $sql = " LEFT JOIN artist_tags tagart_christmas ON m.artist_id = tagart_christmas.artist_id AND tagart_christmas.tag = 'christmas'
            LEFT JOIN artist_tags tagart_solo ON m.artist_id = tagart_solo.artist_id AND tagart_solo.tag = 'solo'
            LEFT JOIN artist_tags tagart_instrumental ON m.artist_id = tagart_instrumental.artist_id AND tagart_instrumental.tag = 'instrumental'
            LEFT JOIN album_tags tagalb_christmas ON m.album_id = tagalb_christmas.album_id AND tagalb_christmas.tag = 'christmas'
            LEFT JOIN album_tags tagalb_solo ON m.album_id = tagalb_solo.album_id AND tagalb_solo.tag = 'solo'
            LEFT JOIN album_tags tagalb_instrumental ON m.album_id = tagalb_instrumental.album_id AND tagalb_instrumental.tag = 'instrumental'
            LEFT JOIN track_tags tagtrk_christmas ON m.track_id = tagtrk_christmas.track_id AND tagtrk_christmas.tag = 'christmas'
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
                     WHERE is_christmas = 1 ";
        $sql = '';
        foreach ($this->settings as $setting => $value) {
            switch ($setting) {
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
            } else if ($this->settings['mood'] == MOOD_NEUTRAL) {
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
            $sql = ' WHERE is_christmas = 1 ' . $sql . ' LIMIT 0, ' . $limit . ' ';
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
}
