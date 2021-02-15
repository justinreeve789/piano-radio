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
        if (getenv('APP_SETTINGS_MODEL') == 'Piano') {
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
                                td.danceability, td.energy, td.key, td.loudness, td.mode, td.speechiness, td.acousticness, td.instrumentalness, td.liveness, td.valence, td.tempo, td.time_signature, t.is_usable AS is_usable_track,
                                ts_youtube.external_id AS youtube_id,
                                ts_youtube.url AS youtube_url,
                                ts_youtube.duration_ms AS youtube_duration_ms,
                                ts_youtube.start_ms AS youtube_start_ms,
                                ts_youtube.end_ms AS youtube_end_ms,
                                ts_youtube.post_delay_ms AS youtube_post_delay_ms,
                                ROUND((2 * LOG(danceability * 4) / 9) + (3 * LN(5.5 * energy) / 2) + LOG(1 + valence * 2 + mode) + LOG(tempo / (0.01 + energy * 4)) - 1.5 + (3 / (ABS(loudness))), 4) AS mood,
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
                            LEFT JOIN track_sources ts_youtube ON t.id = ts_youtube.track_id AND ts_youtube.type = 'youtube'");
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
    }
}