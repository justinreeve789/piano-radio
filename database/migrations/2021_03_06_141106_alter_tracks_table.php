<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTracksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->unsignedBigInteger('album_id')->nullable();
            $table->index('album_id');
        });

        // Update the album_id with the _music data.
        $sql = "UPDATE tracks t, _music m
                SET t.album_id = m.album_id
                WHERE t.id = m.track_id";
        \DB::statement($sql);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->dropColumn('album_id');
        });
    }
}
