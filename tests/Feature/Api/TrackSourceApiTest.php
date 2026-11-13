<?php

namespace Tests\Feature\Api;

use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

/**
 * DELETE /api/v1/tracksource is how the player reports a YouTube video that failed to play.
 * It records the failure; it doesn't delete anything (the clean:tracksources command does).
 */
class TrackSourceApiTest extends DatabaseTestCase
{
    public function testRecordsAFailedYoutubeSource(): void
    {
        $source = $this->createYoutubeSource($this->createTrack(), 'broken1');

        $this->json('DELETE', '/api/v1/tracksource', ['youtube_id' => 'broken1'])->assertOk();

        $this->assertDatabaseHas('track_sources_failed_attempts', ['track_source_id' => $source->id, 'ip' => '127.0.0.1']);
        $this->assertDatabaseHas('track_sources', ['id' => $source->id]);
    }

    public function testRecordsEachReport(): void
    {
        $this->createYoutubeSource($this->createTrack(), 'broken1');

        $this->json('DELETE', '/api/v1/tracksource', ['youtube_id' => 'broken1']);
        $this->json('DELETE', '/api/v1/tracksource', ['youtube_id' => 'broken1']);

        $this->assertSame(2, DB::table('track_sources_failed_attempts')->count());
    }

    public function testAcceptsTheIdAsAQueryParameter(): void
    {
        $source = $this->createYoutubeSource($this->createTrack(), 'broken1');

        $this->delete('/api/v1/tracksource?youtube_id=broken1')->assertOk();

        $this->assertDatabaseHas('track_sources_failed_attempts', ['track_source_id' => $source->id]);
    }

    public function testIgnoresUnknownVideos(): void
    {
        $this->createYoutubeSource($this->createTrack(), 'fine1');

        $this->json('DELETE', '/api/v1/tracksource', ['youtube_id' => 'unknown'])->assertOk();
        $this->json('DELETE', '/api/v1/tracksource', [])->assertOk();

        $this->assertSame(0, DB::table('track_sources_failed_attempts')->count());
    }

    public function testOnlyMatchesYoutubeSources(): void
    {
        $this->createYoutubeSource($this->createTrack(), 'sc-1', ['type' => 'soundcloud']);

        $this->json('DELETE', '/api/v1/tracksource', ['youtube_id' => 'sc-1'])->assertOk();

        $this->assertSame(0, DB::table('track_sources_failed_attempts')->count());
    }
}
