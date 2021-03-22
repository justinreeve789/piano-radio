<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTypeToArtistAttemptsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('artist_attempts', function (Blueprint $table) {
            $table->char('external_id', 64)->nullable();
            $table->char('type', 16)->default('crawl');
            $table->index(['external_id', 'type']);
            $table->index('external_id');
            $table->index('type');
            $table->dropUnique(['name']);
            $table->unique(['name', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('artist_attempts', function (Blueprint $table) {
            $table->dropUnique(['name', 'type']);
            $table->unique(['name']);
            $table->dropColumn('external_id');
            $table->dropColumn('type');
        });
    }
}
