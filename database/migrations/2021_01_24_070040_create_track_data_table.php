<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackDataTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_data', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id');
            $table->float('danceability', 8, 4)->nullable();
            $table->float('energy', 8, 4)->nullable();
            $table->integer('key')->nullable();
            $table->float('loudness', 8, 4)->nullable();
            $table->integer('mode')->nullable();
            $table->float('speechiness', 8, 4)->nullable();
            $table->float('acousticness', 8, 4)->nullable();
            $table->float('instrumentalness', 8, 4)->nullable();
            $table->float('liveness', 8, 4)->nullable();
            $table->float('valence', 8, 4)->nullable();
            $table->float('tempo', 6, 2)->nullable();
            $table->integer('time_signature')->nullable();
            $table->timestamps();

            $table->primary('track_id');
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
        Schema::dropIfExists('track_data');
    }
}
