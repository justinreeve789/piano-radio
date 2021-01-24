<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMusicView extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement('CREATE OR REPLACE VIEW _music AS
                        SELECT aa.artist_id, a.name AS artist_name, a.image_url AS artist_image_url, aa.album_id, alb.name AS album_name, alb.spotify_id AS album_spotify_id, alb.image_url AS album_image_url, altr.track_id, t.name AS track_name, t.track_number, t.duration_ms, t.spotify_id AS track_spotify_id
                        FROM artists a
                        INNER JOIN artist_albums aa ON a.id = aa.artist_id
                        INNER JOIN albums alb ON aa.album_id = alb.id
                        INNER JOIN album_tracks altr ON alb.id = altr.album_id
                        INNER JOIN tracks t ON altr.track_id = t.id');
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
