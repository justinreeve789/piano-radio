<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackTagsBitmaskTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_tags_bitmask', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id')->primary();
            $table->unsignedBigInteger('bitmask')->default(0);
            $table->timestamps();
            $table->foreign('track_id')->references('id')->on('tracks')->onUpdate('cascade')->onDelete('cascade');
            $table->index('bitmask');
        });

        $sql = "TRUNCATE track_tags_bitmask";
        \DB::statement($sql);

        $sql = "INSERT INTO track_tags_bitmask (track_id, bitmask, created_at, updated_at)
                SELECT t.id AS track_id, SUM(COALESCE(tags_art.bitmask, tags_alb.bitmask, tags_trk.bitmask, 0)) AS bitmask, NOW(), NOW()
                FROM tracks t
                INNER JOIN artists art ON t.artist_id = art.id
                INNER JOIN albums alb ON t.album_id = alb.id
                LEFT JOIN artist_tags arttag ON art.id = arttag.artist_id
                LEFT JOIN album_tags albtag ON alb.id = albtag.album_id
                LEFT JOIN track_tags trktag ON t.id = trktag.track_id
                LEFT JOIN tags tags_art ON arttag.tag = tags_art.tag
                LEFT JOIN tags tags_alb ON albtag.tag = tags_alb.tag
                LEFT JOIN tags tags_trk ON trktag.tag = tags_trk.tag
                WHERE (arttag.tag IS NOT NULL OR albtag.tag IS NOT NULL OR trktag.tag IS NOT NULL) AND (arttag.tag NOT LIKE 'country:%' OR albtag.tag NOT LIKE 'country:%' AND trktag.tag NOT LIKE 'country:%')
                    AND (t.is_usable + COALESCE(alb.is_usable, 1) + art.is_usable = 3)
                GROUP BY t.id";
        \DB::statement($sql);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('track_tags_bitmask');
    }
}
