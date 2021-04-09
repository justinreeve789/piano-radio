<?php

namespace App\Models\Settings;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

const MOOD_GENTLE = 1;
const MOOD_NATURAL = 2;
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
        $always = [];

        foreach ($tags as $index => $tag) {
            if ($tag['tag'] == 'christmas') {
                $always[] = "ttb.bitmask & " . $tag['bitmask'];
            }
            if ($tag['tag'] == 'solo' && $this->settings['style'] == STYLE_SOLO) {
                $always[] = "ttb.bitmask & " . $tag['bitmask'];
            } else if ($tag['tag'] == 'instrumental' && $this->settings['style'] == STYLE_INSTRUMENTAL) {
                $always[] = "ttb.bitmask & " . $tag['bitmask'];
            }
        }

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
    public function updateGeneratedData() {
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