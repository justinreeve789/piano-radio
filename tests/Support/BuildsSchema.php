<?php

namespace Tests\Support;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Track;
use App\Models\TrackSource;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Builds an in-memory SQLite schema that mirrors the final state of the MySQL migrations.
 *
 * The real migrations can't run on SQLite (they use NOW(), REPLACE INTO, TRUNCATE and
 * multi-table UPDATEs), so the tables the app code touches are recreated here by hand.
 * Keep this in sync when a migration changes a column the tests rely on.
 */
trait BuildsSchema
{
    protected function buildSchema(): void
    {
        Schema::create('artists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('image_url')->nullable();
            $table->string('spotify_id')->nullable()->unique();
            $table->string('youtube_id')->nullable()->unique();
            $table->boolean('is_usable')->default(true);
            $table->integer('usable_tracks_count')->default(0);
            $table->integer('allowed_tracks_per_day')->default(0);
            $table->string('artist_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('albums', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('total_tracks');
            $table->string('image_url')->nullable();
            $table->date('release_date')->nullable();
            $table->string('spotify_id')->nullable()->unique();
            $table->string('youtube_id')->nullable();
            $table->boolean('is_usable')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('tracks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('disc_number');
            $table->integer('track_number');
            $table->string('isrc')->nullable();
            $table->integer('duration_ms');
            $table->string('spotify_id')->nullable()->unique();
            $table->date('release_date')->nullable();
            $table->boolean('is_usable')->default(true);
            $table->unsignedBigInteger('album_id')->nullable()->index();
            $table->unsignedBigInteger('artist_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('track_sources', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('track_id');
            $table->string('type');
            $table->string('external_id');
            $table->string('external_id2')->nullable();
            $table->string('external_id3')->nullable();
            $table->unsignedBigInteger('site_id')->nullable();
            $table->string('url');
            $table->integer('duration_ms')->nullable();
            $table->integer('start_ms')->nullable();
            $table->integer('end_ms')->nullable();
            $table->integer('post_delay_ms')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['track_id', 'type']);
        });

        Schema::create('track_sources_failed_attempts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('track_source_id')->index();
            $table->string('ip')->nullable();
            $table->timestamp('failed_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('track_data', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id')->primary();
            foreach (['danceability', 'energy', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo'] as $column) {
                $table->float($column)->nullable();
            }
            $table->integer('key')->nullable();
            $table->integer('mode')->nullable();
            $table->integer('time_signature')->nullable();
            $table->timestamps();
        });

        Schema::create('track_generated_data', function (Blueprint $table) {
            $table->unsignedBigInteger('track_id')->primary();
            $table->char('seed', 32)->nullable();
            $table->integer('position')->nullable();
            $table->float('float1')->nullable();
            $table->timestamps();
        });

        foreach (['artist', 'album', 'track'] as $type) {
            Schema::create("{$type}_tags", function (Blueprint $table) use ($type) {
                $table->unsignedBigInteger("{$type}_id");
                $table->string('tag', 32);
                $table->string('bitmask')->nullable();
                $table->timestamps();
                $table->softDeletes();
                $table->primary(["{$type}_id", 'tag']);
            });
        }

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('tag')->unique();
            $table->unsignedBigInteger('bitmask')->nullable()->unique();
            $table->timestamps();
        });

        foreach (['artist_albums' => ['album_id', 'artist_id'], 'artist_tracks' => ['artist_id', 'track_id'], 'album_tracks' => ['album_id', 'track_id']] as $name => $keys) {
            Schema::create($name, function (Blueprint $table) use ($keys) {
                $table->unsignedBigInteger($keys[0]);
                $table->unsignedBigInteger($keys[1]);
                $table->timestamps();
                $table->softDeletes();
                $table->primary($keys);
            });
        }

        Schema::create('artist_featured', function (Blueprint $table) {
            $table->unsignedBigInteger('artist_id')->primary();
            $table->integer('boost')->default(0);
            $table->integer('tracks_per_day_modifier')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('artist_sites', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('artist_id')->index();
            $table->string('type');
            $table->string('external_id')->nullable();
            $table->string('name')->nullable();
            $table->string('url');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('stats', function (Blueprint $table) {
            $table->char('key');
            $table->string('value');
            $table->string('model');
            $table->timestamps();
            $table->primary(['key', 'model']);
        });
    }

    protected function createArtist(array $attributes = []): Artist
    {
        $artist = new Artist();
        $artist->forceFill(array_merge(['name' => 'Test Artist', 'is_usable' => true], $attributes))->save();
        return $artist->fresh();
    }

    protected function createAlbum(?Artist $artist = null, array $attributes = []): Album
    {
        $album = new Album();
        $album->forceFill(array_merge(['name' => 'Test Album', 'total_tracks' => 0, 'is_usable' => true], $attributes))->save();
        if ($artist) {
            DB::table('artist_albums')->insert(['album_id' => $album->id, 'artist_id' => $artist->id]);
        }
        return $album->fresh();
    }

    protected function createTrack(?Album $album = null, ?Artist $artist = null, array $attributes = []): Track
    {
        $track = new Track();
        $track->forceFill(array_merge([
            'name' => 'Test Track',
            'disc_number' => 1,
            'track_number' => 1,
            'duration_ms' => 200000,
            'is_usable' => true,
            'album_id' => $album ? $album->id : null,
            'artist_id' => $artist ? $artist->id : null,
        ], $attributes))->save();

        if ($artist) {
            DB::table('artist_tracks')->insert(['artist_id' => $artist->id, 'track_id' => $track->id]);
        }
        if ($album) {
            DB::table('album_tracks')->insert(['album_id' => $album->id, 'track_id' => $track->id]);
        }
        return $track->fresh();
    }

    protected function createYoutubeSource(Track $track, string $videoId = 'dQw4w9WgXcQ', array $attributes = []): TrackSource
    {
        $source = new TrackSource();
        $source->forceFill(array_merge([
            'track_id' => $track->id,
            'type' => 'youtube',
            'external_id' => $videoId,
            'url' => 'https://youtube.com/watch?v=' . $videoId,
            'duration_ms' => $track->duration_ms,
        ], $attributes))->save();
        return $source->fresh();
    }
}
