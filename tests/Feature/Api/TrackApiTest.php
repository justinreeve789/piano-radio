<?php

namespace Tests\Feature\Api;

use App\Models\TrackData;
use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

class TrackApiTest extends DatabaseTestCase
{
    public function testGetsATrackWithItsDataSourcesAndTags(): void
    {
        $track = $this->createTrack(null, null, ['name' => 'River Flows']);
        $this->createYoutubeSource($track, 'abc123');
        TrackData::create(['track_id' => $track->id, 'energy' => 0.25, 'tempo' => 72]);
        DB::table('track_tags')->insert(['track_id' => $track->id, 'tag' => 'solo']);

        $response = $this->getJson("/api/v1/track/{$track->id}")->assertOk();

        $response->assertJsonPath('name', 'River Flows');
        $response->assertJsonPath('track_sources.0.external_id', 'abc123');
        $response->assertJsonPath('track_sources.0.type', 'youtube');
        $response->assertJsonPath('track_tags.0.tag', 'solo');
        $this->assertEquals(0.25, $response->json('track_data.energy'));
    }

    public function testTrackWithoutRelationsHasEmptyRelations(): void
    {
        $track = $this->createTrack();

        $this->getJson("/api/v1/track/{$track->id}")
            ->assertOk()
            ->assertJsonPath('track_data', null)
            ->assertJsonPath('track_sources', [])
            ->assertJsonPath('track_tags', []);
    }

    public function testUnknownTrackGivesAnEmptyResponse(): void
    {
        $response = $this->getJson('/api/v1/track/999')->assertOk();

        $this->assertSame('', $response->getContent());
    }
}
