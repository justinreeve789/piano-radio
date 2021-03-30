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
        $sql = " INNER JOIN track_generated_data tgd ON t.id = tgd.track_id ";
        return $sql;
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

        foreach ($always as $x) {
            $sql .= " AND " . $x;
        }

        // Determine our limited sample size from track_generated_data, since this should only contain usable tracks.
        $limitsql = "SELECT COUNT(*) total
                     FROM track_generated_data";
        $result = \DB::select(\DB::raw($limitsql));
        $total = $result[0]->total;
        $limit = floor(max(100, $total / 3));

        if (isset($this->settings['mood'])) {
            if ($this->settings['mood'] == MOOD_GENTLE) {
                // Sort by lowest mood first.
                $sql .= " ORDER BY mood ASC ";
                $sql .= " LIMIT 0, " . $limit;
            } else if ($this->settings['mood'] == MOOD_NATURAL) {
                // Sort by deviation from the mean.
                $sql .= " ORDER BY ABS(mood - AVG(mood) OVER(PARTITION BY NULL)) ";
                $sql .= " LIMIT 0, " . $limit;
            } else if ($this->settings['mood'] == MOOD_LIVELY) {
                // Sort by highest mood first.
                $sql .= " ORDER BY mood DESC ";
                $sql .= " LIMIT 0, " . $limit;
            } else {
                // Sort by position.
                $sql .= " ORDER BY position ";
            }
        }

        return $sql;
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