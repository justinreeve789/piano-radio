<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

const GENRE_WHATEVER = 0;
const NEVER = 0;
const SOMETIMES = 1;
const ALWAYS = 2;

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
            'doom_stoner_sludge' => 'doom/stoner/sludge',
            'electronic_industrial' => 'electronic/industrial',
            'experimental_avantgarde' => 'experimental/avant-garde',
            'folk_viking_pagan' => 'folk/viking/pagan',
            'gothic' => 'gothic',
            'grindcore' => 'grindcore',
            'groove' => 'groove',
            'heavy' => 'heavy',
            'metalcore_deathcore' => 'metalcore/deathcore',
            'power' => 'power',
            'progressive' => 'progressive',
            'speed' => 'speed',
            'symphonic' => 'symphonic',
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
        $sql = " ! ISNULL(COALESCE(tagalb_black.album_id,
					tagart_black.artist_id)) AS is_black,
                    ! ISNULL(COALESCE(tagalb_death.album_id,
					tagart_death.artist_id)) AS is_death,
					! ISNULL(COALESCE(tagalb_doom_stoner_sludge.album_id,
					tagart_doom_stoner_sludge.artist_id)) AS is_doom_stoner_sludge,
					! ISNULL(COALESCE(tagalb_electronic_industrial.album_id,
					tagart_electronic_industrial.artist_id)) AS is_electronic_industrial,
					! ISNULL(COALESCE(tagalb_experimental_avantgarde.album_id,
					tagart_experimental_avantgarde.artist_id)) AS is_experimental_avantgarde,
					! ISNULL(COALESCE(tagalb_folk_viking_pagan.album_id,
					tagart_folk_viking_pagan.artist_id)) AS is_folk_viking_pagan,
					! ISNULL(COALESCE(tagalb_gothic.album_id,
					tagart_gothic.artist_id)) AS is_gothic,
					! ISNULL(COALESCE(tagalb_grindcore.album_id,
					tagart_grindcore.artist_id)) AS is_grindcore,
					! ISNULL(COALESCE(tagalb_groove.album_id,
					tagart_groove.artist_id)) AS is_groove,
					! ISNULL(COALESCE(tagalb_heavy.album_id,
					tagart_heavy.artist_id)) AS is_heavy,
					! ISNULL(COALESCE(tagalb_metalcore_deathcore.album_id,
					tagart_metalcore_deathcore.artist_id)) AS is_metalcore_deathcore,
					! ISNULL(COALESCE(tagalb_power.album_id,
					tagart_power.artist_id)) AS is_power,
					! ISNULL(COALESCE(tagalb_progressive.album_id,
					tagart_progressive.artist_id)) AS is_progressive,
					! ISNULL(COALESCE(tagalb_speed.album_id,
					tagart_speed.artist_id)) AS is_speed,
					! ISNULL(COALESCE(tagalb_symphonic.album_id,
					tagart_symphonic.artist_id)) AS is_symphonic,
					! ISNULL(COALESCE(tagalb_thrash.album_id,
					tagart_thrash.artist_id)) AS is_thrash,
					! ISNULL(COALESCE(tagtrk_live.track_id,
					tagalb_live.album_id)) AS is_live,
                    ! ISNULL(COALESCE(tagtrk_remix.track_id,
					tagalb_remix.album_id)) AS is_remix ";
        return $sql;
    }

    public function generateSqlJoins() {
        $sql = " LEFT JOIN artist_tags tagart_black ON m.artist_id = tagart_black.artist_id AND tagart_black.tag = 'black'
                LEFT JOIN artist_tags tagart_death ON m.artist_id = tagart_death.artist_id AND tagart_death.tag = 'death'
                LEFT JOIN artist_tags tagart_doom_stoner_sludge ON m.artist_id = tagart_doom_stoner_sludge.artist_id AND tagart_doom_stoner_sludge.tag = 'doom/stoner/sludge'
                LEFT JOIN artist_tags tagart_electronic_industrial ON m.artist_id = tagart_electronic_industrial.artist_id AND tagart_electronic_industrial.tag = 'electronic/industrial'
                LEFT JOIN artist_tags tagart_experimental_avantgarde ON m.artist_id = tagart_experimental_avantgarde.artist_id AND tagart_experimental_avantgarde.tag = 'experimental/avant-garde'
                LEFT JOIN artist_tags tagart_folk_viking_pagan ON m.artist_id = tagart_folk_viking_pagan.artist_id AND tagart_folk_viking_pagan.tag = 'folk/viking/pagan'
                LEFT JOIN artist_tags tagart_gothic ON m.artist_id = tagart_gothic.artist_id AND tagart_gothic.tag = 'gothic'
                LEFT JOIN artist_tags tagart_grindcore ON m.artist_id = tagart_grindcore.artist_id AND tagart_grindcore.tag = 'grindcore'
                LEFT JOIN artist_tags tagart_groove ON m.artist_id = tagart_groove.artist_id AND tagart_groove.tag = 'groove'
                LEFT JOIN artist_tags tagart_heavy ON m.artist_id = tagart_heavy.artist_id AND tagart_heavy.tag = 'heavy'
                LEFT JOIN artist_tags tagart_metalcore_deathcore ON m.artist_id = tagart_metalcore_deathcore.artist_id AND tagart_metalcore_deathcore.tag = 'metalcore/deathcore'
                LEFT JOIN artist_tags tagart_power ON m.artist_id = tagart_power.artist_id AND tagart_power.tag = 'power'
                LEFT JOIN artist_tags tagart_progressive ON m.artist_id = tagart_progressive.artist_id AND tagart_progressive.tag = 'progressive'
                LEFT JOIN artist_tags tagart_speed ON m.artist_id = tagart_speed.artist_id AND tagart_speed.tag = 'speed'
                LEFT JOIN artist_tags tagart_symphonic ON m.artist_id = tagart_symphonic.artist_id AND tagart_symphonic.tag = 'symphonic'
                LEFT JOIN artist_tags tagart_thrash ON m.artist_id = tagart_thrash.artist_id AND tagart_thrash.tag = 'thrash'
                LEFT JOIN album_tags tagalb_black ON m.album_id = tagalb_black.album_id AND tagalb_black.tag = 'black'
                LEFT JOIN album_tags tagalb_death ON m.album_id = tagalb_death.album_id AND tagalb_death.tag = 'death'
                LEFT JOIN album_tags tagalb_doom_stoner_sludge ON m.album_id = tagalb_doom_stoner_sludge.album_id AND tagalb_doom_stoner_sludge.tag = 'doom/stoner/sludge'
                LEFT JOIN album_tags tagalb_electronic_industrial ON m.album_id = tagalb_electronic_industrial.album_id AND tagalb_electronic_industrial.tag = 'electronic/industrial'
                LEFT JOIN album_tags tagalb_experimental_avantgarde ON m.album_id = tagalb_experimental_avantgarde.album_id AND tagalb_experimental_avantgarde.tag = 'experimental/avant-garde'
                LEFT JOIN album_tags tagalb_folk_viking_pagan ON m.album_id = tagalb_folk_viking_pagan.album_id AND tagalb_folk_viking_pagan.tag = 'folk/viking/pagan'
                LEFT JOIN album_tags tagalb_gothic ON m.album_id = tagalb_gothic.album_id AND tagalb_gothic.tag = 'gothic'
                LEFT JOIN album_tags tagalb_grindcore ON m.album_id = tagalb_grindcore.album_id AND tagalb_grindcore.tag = 'grindcore'
                LEFT JOIN album_tags tagalb_groove ON m.album_id = tagalb_groove.album_id AND tagalb_groove.tag = 'groove'
                LEFT JOIN album_tags tagalb_heavy ON m.album_id = tagalb_heavy.album_id AND tagalb_heavy.tag = 'heavy'
                LEFT JOIN album_tags tagalb_metalcore_deathcore ON m.album_id = tagalb_metalcore_deathcore.album_id AND tagalb_metalcore_deathcore.tag = 'metalcore/deathcore'
                LEFT JOIN album_tags tagalb_power ON m.album_id = tagalb_power.album_id AND tagalb_power.tag = 'power'
                LEFT JOIN album_tags tagalb_progressive ON m.album_id = tagalb_progressive.album_id AND tagalb_progressive.tag = 'progressive'
                LEFT JOIN album_tags tagalb_speed ON m.album_id = tagalb_speed.album_id AND tagalb_speed.tag = 'speed'
                LEFT JOIN album_tags tagalb_symphonic ON m.album_id = tagalb_symphonic.album_id AND tagalb_symphonic.tag = 'symphonic'
                LEFT JOIN album_tags tagalb_thrash ON m.album_id = tagalb_thrash.album_id AND tagalb_thrash.tag = 'thrash'
                LEFT JOIN album_tags tagalb_live ON m.album_id = tagalb_live.album_id AND tagalb_live.tag = 'live'
                LEFT JOIN album_tags tagalb_remix ON m.album_id = tagalb_remix.album_id AND tagalb_remix.tag = 'remix'
                LEFT JOIN track_tags tagtrk_live ON m.track_id = tagtrk_live.track_id AND tagtrk_live.tag = 'live'
                LEFT JOIN track_tags tagtrk_remix ON m.track_id = tagtrk_remix.track_id AND tagtrk_remix.tag = 'remix' ";
        return $sql;
    }

    public function generateSqlConditions() {
        $sql = '';
        foreach ($this->settings as $setting => $value) {
            switch ($setting) {
                case 'remix':
                    if ($value == NEVER) {
                        $sql .= " AND is_remix = 0 ";
                        $limitsql .= " AND is_remix = 0 ";
                    } else if ($value == ALWAYS) {
                        $sql .= " AND is_remix = 1 ";
                        $limitsql .= " AND is_remix = 1 ";
                    }
                    break;
                case 'live':
                    if ($value == NEVER) {
                        $sql .= " AND is_live = 0 ";
                        $limitsql .= " AND is_live = 0 ";
                    } else if ($value == ALWAYS) {
                        $sql .= " AND is_live = 1 ";
                        $limitsql .= " AND is_live = 1 ";
                    }
                    break;
                default:
                    break;
            }
        }

//        if (isset($this->settings['mood'])) {
//            if ($this->settings['mood'] == MOOD_GENTLE) {
//                // Sort by lowest mood first.
//                $sql .= " ORDER BY mood ASC";
//            } else if ($this->settings['mood'] == MOOD_NATURAL) {
//                // Sort by deviation from the mean.
//                $sql .= " ORDER BY ABS(mood - AVG(mood) OVER(PARTITION BY NULL))";
//            } else if ($this->settings['mood'] == MOOD_LIVELY) {
//                // Sort by highest mood first.
//                $sql .= " ORDER BY mood DESC";
//            } else {
//                // Use the random seed.
//                $this->extra_params['seed3'] = '{{seed}}';
//                $sql .= " ORDER BY RAND(:seed3)";
//            }
//        }

        if (isset($this->settings['genres'])) {
            // $genres = $this->settings['genres'];
            $genres = [];
            $total_genres = count($genres);
            for ($i = 0; $i < $total_genres; $i++) {
                if ($i == 0) {
                    $sql .= " AND (";
                }
                $sql .= " is_" . str_replace('/', '_', $genres[$i]) . " = 1 ";
                if ($i < $total_genres - 1) {
                    $sql .= " OR ";
                } else {
                    $sql .= ") ";
                }
            }
        }

        if (isset($this->settings['years'])) {
            $years = explode(',', $this->settings['years']);
            if (count($years) > 2) {
                if (is_array($this->settings['years'])) {
                    $sql .= " AND base_view.release_date >= YEAR(" . $years[0] . ") AND base_view.release_date <= YEAR(" . $years[1] . ") ";
                }
            }
        }

        // Always include a limit if there's conditions, so we're narrowing the scope of the sort. Otherwise, the
        // filters will just be undone in the parent query.
        if ($sql != '') {
            // TODO: Create or use a lightweight SQL class so we're not doing dumb stuff like this.
            $sql = ' WHERE 1 = 1 ' . $sql . ' LIMIT 0, 1500 ';
        }

        return $sql;
    }
}
