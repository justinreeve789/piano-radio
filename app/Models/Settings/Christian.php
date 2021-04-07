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

class Christian extends Settings
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
            'country' => 'country',
            'gospel' => 'gospel',
            'rock' => 'rock',
            'worship' => 'worship',
        ];
    }

    public function getConditions() {
        return [
            'mood' => [
                'gentle' => 1,
                'neutral' => 2,
                'lively' => 3,
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
     * Get stats for the site.
     *
     * @return object
     */
    public function stats() {
        $fields = ['tracks' => 'youtube_url', 'albums' => 'album_id', 'artists' => 'artist_id'];
        $stats = [];
        foreach ($fields as $key => $field) {
            $sql = "SELECT COUNT(DISTINCT " . $field . ") AS total
                    FROM _music m
                    WHERE is_usable = 1 AND youtube_id IS NOT NULL";
            $stats[$key] = \DB::select($sql)[0]->total;
        }
        return $stats;
    }
}