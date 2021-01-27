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
        DB::statement("CREATE OR REPLACE VIEW _music AS
                        SELECT t.id, aa.artist_id, a.name AS artist_name, a.image_url AS artist_image_url, af.boost, af.tracks_per_day_modifier, aa.album_id, alb.name AS album_name, alb.release_date, alb.spotify_id AS album_spotify_id, alb.image_url AS album_image_url, alb.is_usable AS is_usable_album, altr.track_id, t.name AS track_name, t.track_number, t.duration_ms, t.spotify_id AS track_spotify_id,
                            td.danceability, td.energy, td.key, td.loudness, td.mode, td.speechiness, td.acousticness, td.instrumentalness, td.liveness, td.valence, td.tempo, td.time_signature, t.is_usable AS is_usable_track,
                            !ISNULL(tag_christmas.album_id) AS is_christmas, !ISNULL(tag_sacred.album_id) AS is_sacred, 
                            !ISNULL(tag_cover.album_id) AS is_cover, !ISNULL(tag_original.album_id) AS is_original, 
                            !ISNULL(tag_solo.album_id) AS is_solo, !ISNULL(tag_duet.album_id) AS is_duet,
                            !ISNULL(tag_instrumental.album_id) AS is_instrumental,
                            ts_youtube.url AS youtube
                        FROM artists a
                        LEFT JOIN artist_featured af ON a.id = af.artist_id
                        INNER JOIN artist_albums aa ON a.id = aa.artist_id
                        INNER JOIN albums alb ON aa.album_id = alb.id
                        INNER JOIN album_tracks altr ON alb.id = altr.album_id
                        INNER JOIN tracks t ON altr.track_id = t.id
                        LEFT JOIN track_data td ON t.id = td.track_id
                        LEFT JOIN album_tags tag_christmas ON alb.id = tag_christmas.album_id AND tag_christmas.tag = 'christmas'
                        LEFT JOIN album_tags tag_sacred ON alb.id = tag_sacred.album_id AND tag_sacred.tag = 'sacred'
                        LEFT JOIN album_tags tag_cover ON alb.id = tag_cover.album_id AND tag_cover.tag = 'cover'
                        LEFT JOIN album_tags tag_original ON alb.id = tag_original.album_id AND tag_original.tag = 'original'
                        LEFT JOIN album_tags tag_solo ON alb.id = tag_solo.album_id AND tag_solo.tag = 'solo'
                        LEFT JOIN album_tags tag_duet ON alb.id = tag_duet.album_id AND tag_duet.tag = 'duet'
                        LEFT JOIN album_tags tag_instrumental ON alb.id = tag_instrumental.album_id AND tag_instrumental.tag = 'instrumental'
                        LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id AND ts_youtube.type = 'youtube'");
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