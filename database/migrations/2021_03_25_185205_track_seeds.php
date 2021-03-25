<?php

use App\Models\TrackSeed;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class TrackSeeds extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_seeds', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id')->primary();
            $table->integer('seed');
            $table->float('value', 10, 5);
            $table->timestamps();
        });

        TrackSeed::updateSeeds();
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('track_seeds');
    }
}
