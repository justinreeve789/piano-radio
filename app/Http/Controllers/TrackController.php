<?php

namespace App\Http\Controllers;

use App\Models\Track;
use App\Models\TrackData;
use App\Models\TrackSource;
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
        $sql = "SET @datetime = '2021-02-02';
                SET @seed = @datetime;
                SELECT dailyset.*, dailyset.album_id, dailyset.album_name, dailyset.artist_id
                FROM (
                SELECT t.*, ts.type, ts.external_id, ts.external_id2, ts.external_id3, ts.url, ts.duration_ms AS duration_ms_source, ts.start_ms, ts.end_ms, albtrk.album_id, alb.name AS album_name, artr.artist_id, art.name AS artist_name,
                td.danceability, td.energy, td.key, td.loudness, td.mode, td.speechiness, td.acousticness, td.instrumentalness, td.liveness, td.valence, td.tempo, td.time_signature, t.is_usable AS is_usable_track,
                                            !ISNULL(COALESCE(trktag_christmas.track_id, albtag_christmas.album_id)) AS is_christmas,
                                            !ISNULL(COALESCE(trktag_sacred.track_id, albtag_sacred.album_id)) AS is_sacred,
                                            !ISNULL(COALESCE(trktag_cover.track_id, albtag_cover.album_id)) AS is_cover,
                                            !ISNULL(COALESCE(trktag_solo.track_id, albtag_solo.album_id)) AS is_solo,
                                            !ISNULL(COALESCE(trktag_duet.track_id, albtag_duet.album_id)) AS is_duet,
                                            !ISNULL(COALESCE(trktag_instrumental.track_id, albtag_instrumental.album_id)) AS is_instrumental,
                                            !ISNULL(COALESCE(trktag_original.track_id, albtag_original.album_id)) AS is_original
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
                WHERE t.created_at < @datetime
                AND (t.deleted_at IS NULL OR t.deleted_at >= @datetime)
                AND artr.created_at < @datetime
                AND (artr.deleted_at IS NULL OR artr.deleted_at >= @datetime)
                AND art.created_at < @datetime
                AND (art.deleted_at IS NULL OR art.deleted_at >= @datetime)
                AND ts.created_at < @datetime
                AND (ts.deleted_at IS NULL OR ts.deleted_at >= @datetime)
                AND t.duration_ms >= 75000
                AND t.is_usable = 1
                AND alb.is_usable = 1
                ORDER BY RAND(SHA1(@seed))
                LIMIT 0, 20000) AS dailyset
                WHERE artist_name LIKE 'Justin K. Reeve'
                LIMIT 0, 50";
        $tracks = \DB::execute($sql);
        return $tracks;
    }
}
