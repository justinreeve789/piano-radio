<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrackSeed extends Model
{
    use HasFactory;

    public static function updateSeeds($date = null) {
        if ($date === null) {
            $date = date('d-m-Y');
        }
        $seed = (int) str_replace('-', '', $date);

        $sql = "REPLACE INTO track_seeds (track_id, seed, value, created_at, updated_at)
                SELECT t.id, :seed1, RAND(:seed2), NOW(), NOW()
                FROM tracks t";
        \DB::select(\DB::raw($sql), ['seed1' => $seed, 'seed2' => $seed]);
    }
}
