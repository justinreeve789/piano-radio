<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArtistFeaturedTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('artist_featured', function (Blueprint $table) {
            $table->unsignedBigInteger('artist_id');
            $table->integer('boost')->default(0); // Use a positive or negative integer.
            $table->integer('tracks_per_day_modifier')->default(0); // Use a positive or negative integer.
            $table->timestamps();
            $table->softDeletes();
            $table->primary('artist_id');
            $table->foreign('artist_id')->references('id')->on('artists')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('artist_featured');
    }
}
