<?php

namespace App\Models\Settings;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

const GENRE_WHATEVER = 0;
const NEVER = 0;
const SOMETIMES = 1;
const ALWAYS = 2;
const MOOD_LOW = 1;
const MOOD_MEDIUM = 2;
const MOOD_HIGH = 3;
const OFF = 0;
const ON = 1;

class Metal extends Settings
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
            'black' => 'black',
            'death' => 'death',
            'doom' => 'doom/stoner/sludge',
            'electronic' => 'electronic/industrial',
            'avantgarde' => 'experimental/avant-garde',
            'folk' => 'folk/viking/pagan',
            'gothic' => 'gothic',
            'grindcore' => 'grindcore',
            'groove' => 'groove',
            'heavy' => 'heavy',
            'metalcore' => 'metalcore/deathcore',
            'power' => 'power',
            'progressive' => 'progressive',
            'speed' => 'speed',
            'orchestral' => 'symphonic',
            'thrash' => 'thrash',
        ];
    }

    public function getConditions() {
        return [
            'genre' => [
                'black' => 1,
                'death' => 2,
                'doom/stoner/sludge' => 2,
                'electronic/industrial' => 3,
                'experimental/avant-garde' => 4,
                'folk/viking/pagan' => 5,
                'gothic' => 6,
                'grindcore' => 7,
                'groove' => 8,
                'heavy' => 9,
                'metalcore/deathcore' => 10,
                'power' => 11,
                'progressive' => 12,
                'speed' => 13,
                'symphonic' => 14,
                'thrash' => 15,
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

//        if (isset($this->settings['years'])) {
//            $years = explode(',', $this->settings['years']);
//            if (count($years) > 2) {
//                if (is_array($this->settings['years'])) {
//                    $sql .= " AND base_view.release_date >= YEAR(" . $years[0] . ") AND base_view.release_date <= YEAR(" . $years[1] . ") ";
//                }
//            }
//        }

        $tags = Tag::all()->toArray();
        $genres = array_flip($this->settings['genres']);

        foreach ($tags as $index => $tag) {
            if (isset($genres[$tag['tag']])) {
                $sql .= " OR ttb.bitmask & " . $tag['bitmask'];
            }
        }

        if ($sql != '') {
            $sql = " AND (1 = 2 " . $sql . ") ";
        }

        // Determine our limited sample size from track_generated_data, since this should only contain usable tracks.
        $limitsql = "SELECT COUNT(*) total
                     FROM track_generated_data";
        $result = \DB::select(\DB::raw($limitsql));
        $total = $result[0]->total;
        $limit = floor(max(100, $total / 3));

        if (isset($this->settings['years'])) {
            if (is_array($this->settings['years']) && count($this->settings['years'] == 2)) {
                $sql .= " AND tgd.int1 >= :year1 AND tgd.int1 <= :year2 ";
            }
        }

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
                $sql .= " LIMIT 0, " . $limit;
        }

        return $sql;
    }

    /**
     * Update the generated track data.
     *
     * @param string $date Used to create the seed; if null, current date is used.
     */
    public function updateGeneratedData($date = null) {
        parent::updateGeneratedData();

        // Update float1 with mood value.
        $sql = "UPDATE track_generated_data tgd, (
					SELECT t.id,
    					ROUND((2 * LOG((COALESCE(tdo.danceability, td.danceability) + 0.01) * 4) / 9) + ((COALESCE(tdo.valence, td.valence) + 0.01) / 5) + (((COALESCE(tdo.danceability, td.danceability) / 2) + (7 * COALESCE(tdo.energy, td.energy))) / 5) + (3 * LN(0.01 + 5.5 * COALESCE(tdo.energy, td.energy)) / 2) + LOG(1 + COALESCE(tdo.valence, td.valence) * 2 + (COALESCE(tdo.mode, td.mode) / 3)) + (1.25 * LOG((0.01 + COALESCE(tdo.tempo, td.tempo)) * POWER((0.01 + COALESCE(tdo.energy, td.energy)), 1.5))) + (3 / (0.01 + ABS(COALESCE(tdo.loudness, td.loudness)))), 4) AS mood,
                        YEAR(alb.release_date) AS year
    				FROM tracks t
                    INNER JOIN track_data td ON t.id = td.track_id
                    LEFT JOIN track_data_overrides tdo ON t.id = tdo.track_id
                    LEFT JOIN albums alb ON t.album_id = alb.id
				) AS tdx
				SET tgd.float1 = tdx.mood, tgd.int1 = tdx.year
				WHERE tgd.track_id = tdx.id";
        \DB::statement($sql);
    }

}
