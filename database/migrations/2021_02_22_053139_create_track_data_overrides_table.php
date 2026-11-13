<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackDataOverridesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_data_overrides', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id');
            $table->double('danceability')->nullable();
            $table->double('energy')->nullable();
            $table->integer('key')->nullable();
            $table->double('loudness')->nullable();
            $table->integer('mode')->nullable();
            $table->double('speechiness')->nullable();
            $table->double('acousticness')->nullable();
            $table->double('instrumentalness')->nullable();
            $table->double('liveness')->nullable();
            $table->double('valence')->nullable();
            $table->double('tempo')->nullable();
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
        Schema::dropIfExists('track_data_overrides');
    }
}
