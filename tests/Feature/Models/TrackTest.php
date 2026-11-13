<?php

namespace Tests\Feature\Models;

use App\Models\Track;
use Tests\DatabaseTestCase;

class TrackTest extends DatabaseTestCase
{
    public function testSavesFromSpotifyData(): void
    {
        $track = new Track();
        $track->saveFromSpotifyData((object) [
            'id' => 'sp-track-1',
            'name' => 'Primavera',
            'disc_number' => 1,
            'track_number' => 4,
            'duration_ms' => 452000,
        ]);

        $this->assertDatabaseHas('tracks', [
            'id' => $track->id,
            'name' => 'Primavera',
            'disc_number' => 1,
            'track_number' => 4,
            'spotify_id' => 'sp-track-1',
            'duration_ms' => 452000,
        ]);
    }

    public function testSavesFromYoutubeData(): void
    {
        $artist = $this->createArtist();
        $album = $this->createAlbum($artist);

        $track = new Track();
        $track->saveFromYouTubeData((object) [
            'title' => 'Nuvole Bianche (Live)',
            'duration' => 362,
            'upload_date' => '2020-02-14',
        ], $album->id, $artist->id);

        $this->assertDatabaseHas('tracks', [
            'id' => $track->id,
            'name' => 'Nuvole Bianche (Live)',
            'disc_number' => 1,
            'track_number' => 0,
            'duration_ms' => 362000,
            'album_id' => $album->id,
            'artist_id' => $artist->id,
            'release_date' => '2020-02-14',
            'spotify_id' => null,
        ]);
    }

    public function testYoutubeDataWithoutUploadDateOrAlbum(): void
    {
        $track = new Track();
        $track->saveFromYouTubeData((object) ['title' => 'Untitled', 'duration' => 90]);

        $fresh = $track->fresh();
        $this->assertNull($fresh->release_date);
        $this->assertNull($fresh->album_id);
        $this->assertNull($fresh->artist_id);
    }

    public function testRelationships(): void
    {
        $artist = $this->createArtist();
        $album = $this->createAlbum($artist);
        $track = $this->createTrack($album, $artist);
        $source = $this->createYoutubeSource($track);

        $this->assertTrue($track->trackSources->first()->is($source));
        $this->assertTrue($source->track->is($track));
        $this->assertTrue($artist->artistTracks->first()->track_id == $track->id);
        $this->assertTrue($artist->albums->first()->is($album));
    }
}
