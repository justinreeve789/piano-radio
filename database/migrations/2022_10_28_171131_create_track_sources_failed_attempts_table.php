<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTrackSourcesFailedAttemptsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_sources_failed_attempts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('track_source_id');
            $table->string('ip')->nullable();
            $table->timestamp('failed_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->index('track_source_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('track_sources_failed_attempts');
    }
}
