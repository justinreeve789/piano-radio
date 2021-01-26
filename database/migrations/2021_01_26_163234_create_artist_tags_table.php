<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateArtistTagsTable extends Migration
{
    /**
     * Run the migrations.
     * Artist tags will be applied to every new album and track for the artist. So for example, if an artist only does
     * solo piano, the "solo" tag in the table will auto-apply "solo" to new albums as they're crawled.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('artist_tags', function (Blueprint $table) {
            $table->unsignedBigInteger('artist_id');
            $table->string('tag', 32);
            $table->string('bitmask')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->primary(['artist_id', 'tag']);
            $table->index('artist_id');
            $table->index('tag');
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
        Schema::dropIfExists('artist_tags');
    }
}
