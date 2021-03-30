<?php

use App\Models\TrackSeed;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class TrackGeneratedData extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('track_generated_data', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id')->primary();
            $table->char('seed', 32)->nullable();
            $table->integer('position')->nullable();
            $table->integer('int1')->nullable();
            $table->integer('int2')->nullable();
            $table->integer('int3')->nullable();
            $table->integer('int4')->nullable();
            $table->integer('int5')->nullable();
            $table->float('float1', 10, 5)->nullable();
            $table->float('float2', 10, 5)->nullable();;
            $table->float('float3', 10, 5)->nullable();;
            $table->float('float4', 10, 5)->nullable();;
            $table->float('float5', 10, 5)->nullable();;
            $table->timestamps();

            $table->index('seed');
            $table->index('position');
            $table->index('int1');
            $table->index('int2');
            $table->index('int3');
            $table->index('int4');
            $table->index('int5');
            $table->index('float1');
            $table->index('float2');
            $table->index('float3');
            $table->index('float4');
            $table->index('float5');
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
        Schema::dropIfExists('track_generated_data');
    }
}
