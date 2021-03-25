<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddExtrasToArtistsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('artists', 'usable_tracks_count')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->integer('usable_tracks_count')->default(0);
            });
        }

        if (!Schema::hasColumn('artists', 'allowed_tracks_per_day')) {
            Schema::table('artists', function (Blueprint $table) {
                $table->integer('allowed_tracks_per_day')->default(0);
            });
        }

        DB::table('artists as a')
            ->join('_artists_extra as ae', 'a.id', '=', 'ae.artist_id')
            ->update([
                'a.usable_tracks_count' => \DB::raw('ae.usable_tracks_count'),
                'a.allowed_tracks_per_day' => \DB::raw('ae.allowed_tracks_per_day'),
            ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('artists', function (Blueprint $table) {
            $table->dropColumn('usable_tracks_count');
            $table->dropColumn('allowed_tracks_per_day');
        });
    }
}
