<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackSourcesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_sources', function (Blueprint $table) {
            $table->id();
            $table->integer('track_id');
            $table->string('type'); // spotify, soundcloud, youtube
            $table->string('url');
            $table->integer('duration_ms')->nullable();
            $table->integer('start_ms')->nullable();
            $table->integer('end_ms')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('track_sources');
    }
}
