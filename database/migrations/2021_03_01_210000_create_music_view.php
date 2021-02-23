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
                        SELECT t.id,
                            CASE
                                WHEN a.is_usable = 1 AND alb.is_usable = 1 AND t.is_usable = 1
                                THEN 1
                                ELSE 0
                                END AS is_usable,
                            aa.artist_id, a.name AS artist_name, a.image_url AS artist_image_url, a.spotify_id AS artist_spotify_id, a.youtube_id AS artist_youtube_id, a.is_usable AS is_usable_artist, af.boost, af.tracks_per_day_modifier,
                            ae.usable_tracks_count,
                            FLOOR(1 + LOG10(POWER(ae.usable_tracks_count, 4) / LN(ae.usable_tracks_count))) AS allowed_tracks_per_day,
                            aa.album_id, alb.name AS album_name, alb.release_date, alb.spotify_id AS album_spotify_id, alb.image_url AS album_image_url, alb.is_usable AS is_usable_album,
                            altr.track_id, t.name AS track_name, t.track_number, t.duration_ms, t.spotify_id AS track_spotify_id,
                            COALESCE(tdo.danceability, td.danceability) AS danceability,
                            COALESCE(tdo.energy, td.energy) AS energy,
                            COALESCE(tdo.key, td.key) AS `key`,
                            COALESCE(tdo.loudness, td.loudness) AS loudness,
                            COALESCE(tdo.mode, td.mode) AS mode,
                            COALESCE(tdo.speechiness, td.speechiness) AS speechiness,
                            COALESCE(tdo.acousticness, td.acousticness) AS acousticness,
                            COALESCE(tdo.instrumentalness, td.instrumentalness) AS instrumentalness,
                            COALESCE(tdo.liveness, td.liveness) AS liveness,
                            COALESCE(tdo.valence, td.valence) AS valence,
                            COALESCE(tdo.tempo, td.tempo) AS tempo,
                            td.time_signature, t.is_usable AS is_usable_track,
                            ts_youtube.external_id AS youtube_id,
                            ts_youtube.url AS youtube_url,
                            ts_youtube.duration_ms AS youtube_duration_ms,
                            ts_youtube.start_ms AS youtube_start_ms,
                            ts_youtube.end_ms AS youtube_end_ms,
                            ts_youtube.post_delay_ms AS youtube_post_delay_ms,
                            GREATEST(t.created_at, artr.created_at, a.created_at, ts_youtube.created_at) AS max_created_at,
                            LEAST(t.created_at, artr.created_at, a.created_at, ts_youtube.created_at) AS min_created_at,
                            GREATEST(t.deleted_at, artr.deleted_at, a.deleted_at, ts_youtube.deleted_at) AS max_deleted_at,
                            LEAST(t.deleted_at, artr.deleted_at, a.deleted_at, ts_youtube.deleted_at) AS min_deleted_at
                        FROM artists a
                        INNER JOIN _artists_extra ae ON a.id = ae.artist_id 
                        LEFT JOIN artist_featured af ON a.id = af.artist_id
                        INNER JOIN artist_albums aa ON a.id = aa.artist_id
                        INNER JOIN albums alb ON aa.album_id = alb.id
                        INNER JOIN album_tracks altr ON alb.id = altr.album_id
                        INNER JOIN artist_tracks artr ON aa.artist_id = artr.artist_id
                        INNER JOIN tracks t ON altr.track_id = t.id AND artr.track_id = t.id
                        LEFT JOIN track_data td ON t.id = td.track_id
                        LEFT JOIN track_data_overrides tdo ON t.id = tdo.track_id
                        LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id AND ts_youtube.type = 'youtube'");

        if (getenv('APP_SETTINGS_MODEL') == 'Piano') {
            DB::statement("CREATE OR REPLACE VIEW _music_piano AS
                            SELECT
                                m.*,
                                ROUND((LOG(LOG(tempo)^5 * energy)) + (2 * LOG(danceability * 4) / 9) + (valence / 5) + (((danceability / 2) + (7 * energy)) / 5) + (3 * LN(5.5 * energy) / 2) + LOG(1 + valence * 2 + (mode / 3)) + LOG(tempo * (0.01 + energy)) + (3 / (ABS(loudness))), 4) AS mood,
                                ! ISNULL(COALESCE(tagtrk_christmas.track_id,
                                tagalb_christmas.album_id,
                                tagart_christmas.artist_id)) AS is_christmas,
                                ! ISNULL(COALESCE(tagtrk_sacred.track_id,
                                tagalb_sacred.album_id)) AS is_sacred,
                                ! ISNULL(COALESCE(tagtrk_classical.track_id,
                                tagalb_classical.album_id)) AS is_classical,
                                ! ISNULL(COALESCE(tagtrk_solo.track_id,
                                tagalb_solo.album_id)) AS is_solo,
                                ! ISNULL(COALESCE(tagtrk_instrumental.track_id,
                                tagalb_instrumental.album_id)) AS is_instrumental
                            FROM
                                _music m
                            LEFT JOIN artist_tags tagart_christmas ON
                                m.artist_id = tagart_christmas.artist_id
                                AND tagart_christmas.tag = 'christmas'
                            LEFT JOIN artist_tags tagart_sacred ON
                                m.artist_id = tagart_sacred.artist_id
                                AND tagart_sacred.tag = 'sacred'
                            LEFT JOIN artist_tags tagart_classical ON
                                m.artist_id = tagart_classical.artist_id
                                AND tagart_classical.tag = 'classical'
                            LEFT JOIN artist_tags tagart_game ON
                                m.artist_id = tagart_game.artist_id
                                AND tagart_game.tag = 'game'
                            LEFT JOIN artist_tags tagart_cover ON
                                m.artist_id = tagart_cover.artist_id
                                AND tagart_cover.tag = 'cover'
                            LEFT JOIN artist_tags tagart_solo ON
                                m.artist_id = tagart_solo.artist_id
                                AND tagart_solo.tag = 'solo'
                            LEFT JOIN artist_tags tagart_instrumental ON
                                m.artist_id = tagart_instrumental.artist_id
                                AND tagart_instrumental.tag = 'instrumental'
                            LEFT JOIN album_tags tagalb_christmas ON
                                m.album_id = tagalb_christmas.album_id
                                AND tagalb_christmas.tag = 'christmas'
                            LEFT JOIN album_tags tagalb_sacred ON
                                m.album_id = tagalb_sacred.album_id
                                AND tagalb_sacred.tag = 'sacred'
                            LEFT JOIN album_tags tagalb_classical ON
                                m.album_id = tagalb_classical.album_id
                                AND tagalb_classical.tag = 'classical'
                            LEFT JOIN album_tags tagalb_game ON
                                m.album_id = tagalb_game.album_id
                                AND tagalb_game.tag = 'game'
                            LEFT JOIN album_tags tagalb_cover ON
                                m.album_id = tagalb_cover.album_id
                                AND tagalb_cover.tag = 'cover'
                            LEFT JOIN album_tags tagalb_solo ON
                                m.album_id = tagalb_solo.album_id
                                AND tagalb_solo.tag = 'solo'
                            LEFT JOIN album_tags tagalb_instrumental ON
                                m.album_id = tagalb_instrumental.album_id
                                AND tagalb_instrumental.tag = 'instrumental'
                            LEFT JOIN track_tags tagtrk_christmas ON
                                m.track_id = tagtrk_christmas.track_id
                                AND tagtrk_christmas.tag = 'christmas'
                            LEFT JOIN track_tags tagtrk_sacred ON
                                m.track_id = tagtrk_sacred.track_id
                                AND tagtrk_sacred.tag = 'sacred'
                            LEFT JOIN track_tags tagtrk_classical ON
                                m.track_id = tagtrk_classical.track_id
                                AND tagtrk_classical.tag = 'classical'
                            LEFT JOIN track_tags tagtrk_game ON
                                m.track_id = tagtrk_game.track_id
                                AND tagtrk_game.tag = 'game'
                            LEFT JOIN track_tags tagtrk_cover ON
                                m.track_id = tagtrk_cover.track_id
                                AND tagtrk_cover.tag = 'cover'
                            LEFT JOIN track_tags tagtrk_solo ON
                                m.track_id = tagtrk_solo.track_id
                                AND tagtrk_solo.tag = 'solo'
                            LEFT JOIN track_tags tagtrk_instrumental ON
                                m.track_id = tagtrk_instrumental.track_id
                                AND tagtrk_instrumental.tag = 'instrumental'");
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement('DROP VIEW IF EXISTS _music');
        DB::statement('DROP VIEW IF EXISTS _music_piano');
    }
}