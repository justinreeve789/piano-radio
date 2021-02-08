<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArtistsExtraView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("CREATE OR REPLACE VIEW _artist_extra AS
            SELECT artr1.artist_id,
                COUNT(artr1.track_id) AS usable_tracks_count,
                FLOOR(1 + LOG10(POWER(COUNT(artr1.track_id), 4) / LN(COUNT(artr1.track_id)))) AS allowed_tracks_per_day
            FROM tracks t1
            INNER JOIN artist_tracks artr1 ON t1.id = artr1.track_id
            INNER JOIN album_tracks albtrk1 ON t1.id = albtrk1.track_id
            INNER JOIN artists art1 ON artr1.artist_id = art1.id
            INNER JOIN albums alb1 ON albtrk1.album_id = alb1.id
            WHERE (art1.is_usable + alb1.is_usable + t1.is_usable = 3)
            GROUP BY artr1.artist_id");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('DROP VIEW IF EXISTS _music');
    }
}
