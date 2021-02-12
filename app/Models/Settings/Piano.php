<?php

namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Piano extends Settings
{
    use HasFactory;

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
            'mood' => [
                'gentle' => 1,
                'neutral' => 2,
                'lively' => 3,
            ],
            'sacred' => [
                'false' => 0,
                'true' => 2,
            ],
            'style' => [
                'solo' => 1,
                'duet' => 2,
                'instrumental' => 3,
            ],
        ];
    }

    public function parseInput(Request $request) {
        $this->settings = [
            'generaltags' => [
                'mood' => $request->input('mood'),
                'style' => $request->input('style'),
            ],
            'songtags' => [
                'christmas' => $request->input('christmas'),
                'sacred' => $request->input('sacred'),
                'classical' => $request->input('classical'),
            ],
        ];
        return $this->settings;
    }

    public function generateSqlConditions() {
        $sql = '';
        foreach ($this->settings['songtags'] as $setting => $value) {
            if ($this->is_equal_to($setting, $value)) {
                $sql .= " AND !ISNULL(COALESCE(trktag_" . $setting . ".track_id, albtag_" . $setting . ".album_id)) = 1 ";
            }
        }

        $sql .= " AND m.is_christmas = 1 AND m.is_instrumental = 1 ORDER BY m.mood DESC ";
        return $sql;
    }
}
