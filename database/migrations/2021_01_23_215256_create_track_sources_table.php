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
            $table->unsignedBigInteger('track_id');
            $table->string('type'); // spotify, soundcloud, youtube
            $table->string('external_id');
            $table->string('external_id2')->nullable();
            $table->string('external_id3')->nullable();
            $table->unsignedBigInteger('site_id')->nullable();
            $table->string('url');
            $table->integer('duration_ms')->nullable();
            $table->integer('start_ms')->nullable();
            $table->integer('end_ms')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('track_id');
            $table->index('site_id');
            $table->index(['type', 'external_id']);
            $table->unique(['track_id', 'type']);
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
        Schema::dropIfExists('track_sources');
    }
}
