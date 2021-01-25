<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAlbumTagsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('album_tags', function (Blueprint $table) {
            $table->unsignedBigInteger('album_id');
            $table->string('tag', 32);
            $table->string('bitmask')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->primary(['album_id', 'tag']);
            $table->index('album_id');
            $table->index('tag');
            $table->foreign('album_id')->references('id')->on('albums')->onUpdate('cascade')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('album_tags');
    }
}
