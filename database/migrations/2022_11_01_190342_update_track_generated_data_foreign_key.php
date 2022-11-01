<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTrackGeneratedDataForeignKey extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('track_generated_data', function (Blueprint $table) {
            $table->foreign('track_id')->references('id')->on('tracks')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('track_generated_data', function (Blueprint $table) {
            $table->dropForeign('track_generated_data_track_id_foreign');
        });
    }
}
