<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTrackSourcesFailedAttemptsForeignKey extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('track_sources_failed_attempts', function (Blueprint $table) {
            $table->foreign('track_source_id')->references('id')->on('track_sources')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('track_sources_failed_attempts', function (Blueprint $table) {
            $table->dropForeign('track_sources_failed_attempts_track_source_id_foreign');
        });
    }
}
