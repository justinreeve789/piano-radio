<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class OptimizeArtistsExtraView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("DROP VIEW IF EXISTS _artists_extra");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("CREATE OR REPLACE VIEW _artists_extra AS
                        SELECT
                            t.*,
                            COALESCE(FLOOR(1 + LOG10(POWER(t.usable_tracks_count + 0.01, 4) / LN(t.usable_tracks_count + 0.01))), 1) AS allowed_tracks_per_day
                        FROM
                            (
                            SELECT
                                artr1.artist_id,
                                art1.name AS artist_name,
                                t1.id AS track_id, COUNT(t1.id) AS usable_tracks_count
                            FROM
                                tracks t1
                            INNER JOIN artist_tracks artr1 ON
                                t1.id = artr1.track_id
                            INNER JOIN artists art1 ON
                                artr1.artist_id = art1.id
                            LEFT JOIN albums alb1 ON
                                t1.album_id = alb1.id
                            WHERE
                                (art1.is_usable + COALESCE(alb1.is_usable, 1) + t1.is_usable = 3)
                                GROUP BY art1.id) AS t");
    }
}
