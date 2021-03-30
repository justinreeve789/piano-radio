<?php

namespace App\Models\Settings;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Track;
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
        $sql = " tgd.float1 AS mood ";
        return $sql;
    }

    public function generateSqlJoins() {
        $sql = " INNER JOIN track_generated_data tgd ON t.id = tgd.track_id ";
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
        $limit = floor(min($limit, 2000));

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

    public function updateGeneratedData() {
        parent::updateGeneratedData();

        // Update float1 with mood value.
        $sql = "UPDATE track_generated_data tgd, (
					SELECT t.id,
    					ROUND((2 * LOG((COALESCE(tdo.danceability, td.danceability) + 0.01) * 4) / 9) + ((COALESCE(tdo.valence, td.valence) + 0.01) / 5) + (((COALESCE(tdo.danceability, td.danceability) / 2) + (7 * COALESCE(tdo.energy, td.energy))) / 5) + (3 * LN(0.01 + 5.5 * COALESCE(tdo.energy, td.energy)) / 2) + LOG(1 + COALESCE(tdo.valence, td.valence) * 2 + (COALESCE(tdo.mode, td.mode) / 3)) + (1.25 * LOG((0.01 + COALESCE(tdo.tempo, td.tempo)) * POWER((0.01 + COALESCE(tdo.energy, td.energy)), 1.5))) + (3 / (0.01 + ABS(COALESCE(tdo.loudness, td.loudness)))), 4) AS mood
    				FROM tracks t
                    INNER JOIN track_data td ON t.id = td.track_id
                    LEFT JOIN track_data_overrides tdo ON t.id = tdo.track_id
				) AS tdx
				SET tgd.float1 = tdx.mood
				WHERE tgd.track_id = tdx.id";
        \DB::statement($sql);
    }
}