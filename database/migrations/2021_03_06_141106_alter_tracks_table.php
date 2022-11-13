<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterTracksTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->unsignedBigInteger('album_id')->nullable();
            $table->index('album_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->dropColumn('album_id');
        });
    }
}
