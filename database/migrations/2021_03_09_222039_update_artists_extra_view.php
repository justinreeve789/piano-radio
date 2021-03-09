<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateArtistsExtraView extends Migration
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
                                WHEN a.is_usable = 1 AND COALESCE(alb.is_usable, 1) = 1 AND t.is_usable = 1
                                THEN 1
                                ELSE 0
                                END AS is_usable,
                            a.id AS artist_id, a.name AS artist_name, a.image_url AS artist_image_url, a.spotify_id AS artist_spotify_id, a.youtube_id AS artist_youtube_id, a.is_usable AS is_usable_artist, af.boost, af.tracks_per_day_modifier,
                            ae.usable_tracks_count,
                            FLOOR(1 + LOG10(POWER(ae.usable_tracks_count, 4) / LN(ae.usable_tracks_count))) AS allowed_tracks_per_day,
                            alb.id AS album_id, alb.name AS album_name, alb.release_date, alb.spotify_id AS album_spotify_id, alb.image_url AS album_image_url, alb.is_usable AS is_usable_album,
                            t.id AS track_id, t.name AS track_name, t.track_number, t.duration_ms, t.spotify_id AS track_spotify_id,
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
                        INNER JOIN artist_tracks artr ON a.id = artr.artist_id
                        INNER JOIN tracks t ON artr.track_id = t.id
                        LEFT JOIN albums alb ON t.album_id = alb.id
                        LEFT JOIN artist_featured af ON a.id = af.artist_id
                        LEFT JOIN track_data td ON t.id = td.track_id
                        LEFT JOIN track_data_overrides tdo ON t.id = tdo.track_id
                        LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id AND ts_youtube.type = 'youtube'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("CREATE OR REPLACE VIEW _artists_extra AS
                        SELECT artr1.artist_id,
                            art1.name AS artist_name,
                            COUNT(artr1.track_id) AS usable_tracks_count,
                            COALESCE(FLOOR(1 + LOG10(POWER(COUNT(artr1.track_id), 4) / LN(COUNT(artr1.track_id)))), 1) AS allowed_tracks_per_day
                        FROM tracks t1
                        INNER JOIN artist_tracks artr1 ON t1.id = artr1.track_id
                        INNER JOIN artists art1 ON artr1.artist_id = art1.id
                        LEFT JOIN albums alb1 ON t1.album_id = alb1.id
                        WHERE (art1.is_usable + COALESCE(alb1.is_usable, 1) + t1.is_usable = 3)
                        GROUP BY artr1.artist_id, art1.name");
    }
}
