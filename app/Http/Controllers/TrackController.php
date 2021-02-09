<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\TrackData;
use App\Models\TrackSource;
use App\Models\Settings\Piano;
use App\Models\Settings\Settings;
use Illuminate\Http\Request;

class TrackController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function show(Track $track)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function edit(Track $track)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Track $track)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Track  $track
     * @return \Illuminate\Http\Response
     */
    public function destroy(Track $track)
    {
        //
    }

    /**
     * Get the next tracks.
     *
     * @return \Illuminate\Http\Response
     */
    public function next(Request $request) {
        /**
         * If whatever, order by random in the dailyset, and remove the order by random in the moodsort (or leave it).
         * If soft, order mood by ASC.
         * If neutral, don't order mood.
         * If energetic, order mood by DESC.
         * If we want to add an in-between step for not-as-sort and not-so-energetic, increase the limit size from 550 to 800.
         *
         * danceability - 2 log(danceability * 5) / 3
         * energy - 3 (ln 2(energy * 2)) / 2
         * valence - log (1 + valence * 2 + (mode))
         * tempo - log (tempo / (0.01 + energy * 4)) - 1.5
         * loudness - 3 / abs(loudness)
         */
        $date = date('Ymd');
        $seed = $date;

        $model = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $settings = new $model();
        $settings->parseInput($request);

        $sql = "SELECT *, SEC_TO_TIME(ROUND(secs_start)) AS time_start
                FROM (
                SELECT moodsort.*, (@timestart := @timestart + moodsort.duration_ms_source / 1000) AS secs_start
                FROM (
                SELECT *
                FROM (
                SELECT t.*, ts.type, ts.external_id, ts.external_id2, ts.external_id3, ts.url, ts.duration_ms AS duration_ms_source, ts.start_ms, ts.end_ms, albtrk.album_id, alb.name AS album_name, artr.artist_id, art.name AS artist_name,
                td.danceability, td.energy, td.key, td.loudness, td.mode, td.speechiness, td.acousticness, td.instrumentalness, td.liveness, td.valence, td.tempo, td.time_signature, t.is_usable AS is_usable_track,
                !ISNULL(COALESCE(trktag_christmas.track_id, albtag_christmas.album_id)) AS is_christmas,
                !ISNULL(COALESCE(trktag_sacred.track_id, albtag_sacred.album_id)) AS is_sacred,
                !ISNULL(COALESCE(trktag_cover.track_id, albtag_cover.album_id)) AS is_cover,
                !ISNULL(COALESCE(trktag_solo.track_id, albtag_solo.album_id)) AS is_solo,
                !ISNULL(COALESCE(trktag_duet.track_id, albtag_duet.album_id)) AS is_duet,
                !ISNULL(COALESCE(trktag_instrumental.track_id, albtag_instrumental.album_id)) AS is_instrumental,
                !ISNULL(COALESCE(trktag_original.track_id, albtag_original.album_id)) AS is_original,
                ROUND((2 * LOG(danceability * 5) / 5) + (3 * LN(4 * energy) / 2) + LOG(1 + valence * 2 + mode) + LOG(tempo / (0.01 + energy * 4)) - 1.5 + (3 / (ABS(loudness))), 2) AS mood
                FROM tracks t
                LEFT JOIN track_sources ts ON t.id = ts.track_id
                INNER JOIN artist_tracks artr ON t.id = artr.track_id
                INNER JOIN artists art ON artr.artist_id = art.id
                INNER JOIN album_tracks albtrk ON t.id = albtrk.track_id
                INNER JOIN albums alb ON albtrk.album_id = alb.id
                LEFT JOIN track_data td ON t.id = td.track_id
                LEFT JOIN album_tags albtag_christmas ON alb.id = albtag_christmas.album_id AND albtag_christmas.tag = 'christmas'
                LEFT JOIN album_tags albtag_sacred ON alb.id = albtag_sacred.album_id AND albtag_sacred.tag = 'sacred'
                LEFT JOIN album_tags albtag_cover ON alb.id = albtag_cover.album_id AND albtag_cover.tag = 'cover'
                LEFT JOIN album_tags albtag_original ON alb.id = albtag_original.album_id AND albtag_original.tag = 'original'
                LEFT JOIN album_tags albtag_solo ON alb.id = albtag_solo.album_id AND albtag_solo.tag = 'solo'
                LEFT JOIN album_tags albtag_duet ON alb.id = albtag_duet.album_id AND albtag_duet.tag = 'duet'
                LEFT JOIN album_tags albtag_instrumental ON alb.id = albtag_instrumental.album_id AND albtag_instrumental.tag = 'instrumental'
                LEFT JOIN track_tags trktag_christmas ON t.id = trktag_christmas.track_id AND trktag_christmas.tag = 'christmas'
                LEFT JOIN track_tags trktag_sacred ON t.id = trktag_sacred.track_id AND trktag_sacred.tag = 'sacred'
                LEFT JOIN track_tags trktag_cover ON t.id = trktag_cover.track_id AND trktag_cover.tag = 'cover'
                LEFT JOIN track_tags trktag_original ON t.id = trktag_original.track_id AND trktag_original.tag = 'original'
                LEFT JOIN track_tags trktag_solo ON t.id = trktag_solo.track_id AND trktag_solo.tag = 'solo'
                LEFT JOIN track_tags trktag_duet ON t.id = trktag_duet.track_id AND trktag_duet.tag = 'duet'
                LEFT JOIN track_tags trktag_instrumental ON t.id = trktag_instrumental.track_id AND trktag_instrumental.tag = 'instrumental'
                CROSS JOIN (SELECT @timestart := 0) AS tt
                WHERE t.created_at < " . $date . "
                AND (t.deleted_at IS NULL OR t.deleted_at >= " . $date . ")
                AND artr.created_at < " . $date . "
                AND (artr.deleted_at IS NULL OR artr.deleted_at >= " . $date . ")
                AND art.created_at < " . $date . "
                AND (art.deleted_at IS NULL OR art.deleted_at >= " . $date . ")
                AND ts.created_at < " . $date . "
                AND (ts.deleted_at IS NULL OR ts.deleted_at >= " . $date . ")
                AND t.duration_ms >= 75000
                AND t.is_usable = 1
                AND alb.is_usable = 1";

        $sql .= $settings->generateSqlConditions();

        $sql .= "
                ORDER BY mood DESC
                LIMIT 0, 550) AS dailyset
                ORDER BY RAND(" . $seed . ")
                ) AS moodsort
                WHERE mood IS NOT NULL
                ) AS sched
                WHERE sched.secs_start < 86400 AND SEC_TO_TIME(ROUND(secs_start)) <= NOW()
                ORDER BY sched.secs_start DESC
                LIMIT 0, 5";
        $tracks = \DB::select(\DB::raw($sql));
        return $tracks;
    }
}
