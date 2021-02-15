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
const MOOD_NEUTRAL = 2;
const MOOD_LIVELY = 3;
const STYLE_SOLO = 1;
const STYLE_DUET = 2;
const STYLE_INSTRUMENTAL = 3;

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
                'neutral' => 2,
                'lively' => 3,
            ],
            'style' => [
                'solo' => 1,
                'duet' => 2,
                'instrumental' => 3,
            ],
        ];
    }

    public function generateSqlColumns() {
        $sql = " ROUND((2 * LOG(danceability * 4) / 9) + (3 * LN(5.5 * energy) / 2) + LOG(1 + valence * 2 + mode) + LOG(tempo / (0.01 + energy * 4)) - 1.5 + (3 / (ABS(loudness))), 4) AS mood,
                !ISNULL(COALESCE(tagtrk_christmas.track_id, tagalb_christmas.album_id)) AS is_christmas,
                !ISNULL(COALESCE(tagtrk_sacred.track_id, tagalb_sacred.album_id)) AS is_sacred,
                !ISNULL(COALESCE(tagtrk_classical.track_id, tagalb_classical.album_id)) AS is_classical,
                !ISNULL(COALESCE(tagtrk_game.track_id, tagalb_game.album_id)) AS is_game,
                !ISNULL(COALESCE(tagtrk_cover.track_id, tagalb_cover.album_id)) AS is_cover,
                !ISNULL(COALESCE(tagtrk_original.track_id, tagalb_original.album_id)) AS is_original,
                !ISNULL(COALESCE(tagtrk_solo.track_id, tagalb_solo.album_id)) AS is_solo,
                !ISNULL(COALESCE(tagtrk_duet.track_id, tagalb_duet.album_id)) AS is_duet,
                !ISNULL(COALESCE(tagtrk_instrumental.track_id, tagalb_instrumental.album_id)) AS is_instrumental, ";
        return $sql;
    }

    public function generateSqlJoins() {
        $sql = " LEFT JOIN album_tags tagalb_christmas ON m.album_id = tagalb_christmas.album_id AND tagalb_christmas.tag = 'christmas'
            LEFT JOIN album_tags tagalb_sacred ON m.album_id = tagalb_sacred.album_id AND tagalb_sacred.tag = 'sacred'
            LEFT JOIN album_tags tagalb_classical ON m.album_id = tagalb_classical.album_id AND tagalb_classical.tag = 'classical'
            LEFT JOIN album_tags tagalb_game ON m.album_id = tagalb_game.album_id AND tagalb_game.tag = 'game'
            LEFT JOIN album_tags tagalb_cover ON m.album_id = tagalb_cover.album_id AND tagalb_cover.tag = 'cover'
            LEFT JOIN album_tags tagalb_original ON m.album_id = tagalb_original.album_id AND tagalb_original.tag = 'original'
            LEFT JOIN album_tags tagalb_solo ON m.album_id = tagalb_solo.album_id AND tagalb_solo.tag = 'solo'
            LEFT JOIN album_tags tagalb_duet ON m.album_id = tagalb_duet.album_id AND tagalb_duet.tag = 'duet'
            LEFT JOIN album_tags tagalb_instrumental ON m.album_id = tagalb_instrumental.album_id AND tagalb_instrumental.tag = 'instrumental'
            LEFT JOIN track_tags tagtrk_christmas ON m.track_id = tagtrk_christmas.track_id AND tagtrk_christmas.tag = 'christmas'
            LEFT JOIN track_tags tagtrk_sacred ON m.track_id = tagtrk_sacred.track_id AND tagtrk_sacred.tag = 'sacred'
            LEFT JOIN track_tags tagtrk_classical ON m.track_id = tagtrk_classical.track_id AND tagtrk_classical.tag = 'classical'
            LEFT JOIN track_tags tagtrk_game ON m.track_id = tagtrk_game.track_id AND tagtrk_game.tag = 'game'
            LEFT JOIN track_tags tagtrk_cover ON m.track_id = tagtrk_cover.track_id AND tagtrk_cover.tag = 'cover'
            LEFT JOIN track_tags tagtrk_original ON m.track_id = tagtrk_original.track_id AND tagtrk_original.tag = 'original'
            LEFT JOIN track_tags tagtrk_solo ON m.track_id = tagtrk_solo.track_id AND tagtrk_solo.tag = 'solo'
            LEFT JOIN track_tags tagtrk_duet ON m.track_id = tagtrk_duet.track_id AND tagtrk_duet.tag = 'duet'
            LEFT JOIN track_tags tagtrk_instrumental ON m.track_id = tagtrk_instrumental.track_id AND tagtrk_instrumental.tag = 'instrumental' ";
        return $sql;
    }

    public function generateSqlConditions() {
        $sql = '';
        foreach ($this->settings as $setting => $value) {
            switch ($setting) {
                case 'christmas':
                    if ($value == CHRISTMAS_NEVER) {
                        $sql .= " AND is_christmas = 0 ";
                    } else if ($value == CHRISTMAS_ALWAYS) {
                        $sql .= " AND is_christmas = 1 ";
                    }
                    break;
                case 'classical':
                    if ($value == CLASSICAL_NEVER) {
                        $sql .= " AND is_classical = 0 ";
                    } else if ($value == CLASSICAL_ALWAYS) {
                        $sql .= " AND is_classical = 1 ";
                    }
                    break;
                case 'sacred':
                    if ($value == SACRED_NEVER) {
                        $sql .= " AND is_sacred = 0 ";
                    } else if ($value == SACRED_ALWAYS) {
                        $sql .= " AND is_sacred = 1 ";
                    }
                    break;
                case 'style':
                    if ($this->settings[$setting] == STYLE_SOLO) {
                        $sql .= " AND is_solo = 1 ";
                    } else if ($this->settings[$setting] == STYLE_DUET) {
                        $sql .= " AND is_duet = 1 ";
                    } else if ($this->settings[$setting] == STYLE_INSTRUMENTAL) {
                        $sql .= " AND is_instrumental = 1 ";
                    }
                    break;
                default:
                    break;
            }
        }

        if (isset($this->settings['mood'])) {
            if ($this->settings['mood'] == MOOD_GENTLE) {
                $sql .= " ORDER BY m.mood ASC";
            } else if ($this->settings['mood'] == MOOD_LIVELY) {
                $sql .= " ORDER BY m.mood DESC";
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
