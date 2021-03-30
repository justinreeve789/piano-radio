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

        $sql = "UPDATE track_generated_data SET seed = NULL, position = NULL";
        \DB::statement($sql);

        $sql = "REPLACE INTO track_generated_data (track_id, seed, position, created_at, updated_at)
                SELECT t.id, :seed1, CAST(RAND(:seed2) * 100000000 AS INT), NOW(), NOW()
                FROM tracks t";
        \DB::select(\DB::raw($sql), ['seed1' => $seed, 'seed2' => $seed]);
    }
}