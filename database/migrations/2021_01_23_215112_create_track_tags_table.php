<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackTagsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_tags', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id');
            $table->string('tag', 32);
            $table->string('bitmask')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->primary(['track_id', 'tag']);
            $table->index('track_id');
            $table->index('tag');
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
        Schema::dropIfExists('track_tags');
    }
}
