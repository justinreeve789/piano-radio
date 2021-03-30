<?php

use App\Models\Tag;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class Tags extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('tag');
            $table->unsignedBigInteger('bitmask')->nullable();
            $table->timestamps();
            $table->unique('tag');
            $table->unique('bitmask');
        });

        $sql = "REPLACE INTO tags (tag, created_at, updated_at)
                SELECT DISTINCT tag, NOW(), NOW()
                FROM (
                    SELECT tag
                    FROM artist_tags arttag
                    UNION
                    SELECT tag
                    FROM album_tags albtag
                    UNION
                    SELECT tag
                    FROM track_tags trktag
                ) AS tags
                WHERE tag NOT LIKE 'country:%'
                ORDER BY tag";
        \DB::statement($sql);

        $tags = Tag::all();
        foreach ($tags as $index => $tag) {
            $tag->bitmask = pow(2, $index);
            $tag->save();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tags');
    }
}
