<?php

namespace Tests\Feature\Models;

use App\Models\Album;
use App\Models\Track;
use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

class AlbumTest extends DatabaseTestCase
{
    private function spotifyAlbum(array $overrides = []): object
    {
        return (object) array_merge([
            'id' => 'spotify-album-1',
            'name' => 'Divenire',
            'total_tracks' => 12,
            'release_date' => '2006-10-06',
            'images' => [(object) ['url' => 'https://i.scdn.test/large.jpg'], (object) ['url' => 'https://i.scdn.test/small.jpg']],
        ], $overrides);
    }

    public function testSavesFromSpotifyData(): void
    {
        $album = new Album();
        $album->saveFromSpotifyData($this->spotifyAlbum());

        $this->assertDatabaseHas('albums', [
            'id' => $album->id,
            'name' => 'Divenire',
            'total_tracks' => 12,
            'image_url' => 'https://i.scdn.test/large.jpg',
            'release_date' => '2006-10-06',
            'spotify_id' => 'spotify-album-1',
        ]);
    }

    public function testSpotifyAlbumWithoutImages(): void
    {
        $album = new Album();
        $album->saveFromSpotifyData($this->spotifyAlbum(['images' => []]));

        $this->assertNull($album->fresh()->image_url);
    }

    public function testSpotifyMonthPrecisionDateBecomesFirstOfMonth(): void
    {
        $album = new Album();
        $album->saveFromSpotifyData($this->spotifyAlbum(['release_date' => '2006-10']));

        $this->assertSame('2006-10-01', $album->fresh()->release_date);
    }

    public function testFixDataCountsTracksWhenTotalIsZero(): void
    {
        $album = $this->createAlbum(null, ['total_tracks' => 0, 'image_url' => 'set']);
        $this->createTrack($album);
        $this->createTrack($album);

        $album->fixData();

        $this->assertEquals(2, $album->fresh()->total_tracks);
    }

    public function testFixDataKeepsANonZeroTotal(): void
    {
        $album = $this->createAlbum(null, ['total_tracks' => 10, 'image_url' => 'set']);
        $this->createTrack($album);

        $album->fixData();

        $this->assertEquals(10, $album->fresh()->total_tracks);
    }

    public function testFixDataMovesReleaseDateUpToTheLatestTrackUpload(): void
    {
        $album = $this->createAlbum(null, ['release_date' => '2019-01-01', 'image_url' => 'set']);
        $this->createTrack($album, null, ['created_at' => '2020-03-04 10:00:00']);
        $this->createTrack($album, null, ['created_at' => '2021-05-06 10:00:00']);

        $album->fixData();

        $this->assertSame('2021-05-06', $album->fresh()->release_date);
    }

    public function testFixDataSetsAMissingReleaseDate(): void
    {
        $album = $this->createAlbum(null, ['release_date' => null, 'image_url' => 'set']);
        $this->createTrack($album, null, ['created_at' => '2020-03-04 10:00:00']);

        $album->fixData();

        $this->assertSame('2020-03-04', $album->fresh()->release_date);
    }

    public function testFixDataNeverMovesReleaseDateBackwards(): void
    {
        $album = $this->createAlbum(null, ['release_date' => '2022-01-01', 'image_url' => 'set']);
        $this->createTrack($album, null, ['created_at' => '2020-03-04 10:00:00']);

        $album->fixData();

        $this->assertSame('2022-01-01', $album->fresh()->release_date);
    }

    public function testFixDataNumbersUnnumberedYoutubeTracks(): void
    {
        // YouTube imports create every track with track_number 0.
        $album = $this->createAlbum(null, ['image_url' => 'set']);
        $first = $this->createTrack($album, null, ['track_number' => 0]);
        $second = $this->createTrack($album, null, ['track_number' => 0]);
        $third = $this->createTrack($album, null, ['track_number' => 0]);

        $album->fixData();

        $this->assertEquals([1, 2, 3], [$first->fresh()->track_number, $second->fresh()->track_number, $third->fresh()->track_number]);
    }

    public function testFixDataAppendsNewTracksAfterExistingNumbers(): void
    {
        $album = $this->createAlbum(null, ['image_url' => 'set']);
        $new = $this->createTrack($album, null, ['track_number' => 0]);
        $this->createTrack($album, null, ['track_number' => 1]);
        $this->createTrack($album, null, ['track_number' => 2]);

        $album->fixData();

        $this->assertEquals(3, $new->fresh()->track_number);
    }

    public function testFixDataLeavesSpotifyAlbumsAlone(): void
    {
        $album = $this->createAlbum(null, ['spotify_id' => 'sp1', 'image_url' => 'set']);
        $track = $this->createTrack($album, null, ['track_number' => 0]);

        $album->fixData();

        $this->assertEquals(0, $track->fresh()->track_number);
    }

    public function testFixDataLeavesSpotifyTracksAlone(): void
    {
        $album = $this->createAlbum(null, ['image_url' => 'set']);
        $spotifyTrack = $this->createTrack($album, null, ['track_number' => 0, 'spotify_id' => 'sp-track']);
        $youtubeTrack = $this->createTrack($album, null, ['track_number' => 0]);

        $album->fixData();

        $this->assertEquals(0, $spotifyTrack->fresh()->track_number);
        $this->assertEquals(1, $youtubeTrack->fresh()->track_number);
    }

    public function testFixDataWithoutYoutubeSourceLeavesImageEmpty(): void
    {
        // With a YouTube source this would shell out to youtube-dl, so only the no-source path is tested.
        $album = $this->createAlbum(null, ['image_url' => null]);
        $this->createTrack($album);

        $album->fixData();

        $this->assertNull($album->fresh()->image_url);
    }

    public function testFixDataOnAnEmptyAlbum(): void
    {
        $album = $this->createAlbum(null, ['total_tracks' => 0, 'release_date' => '2019-01-01']);

        $album->fixData();

        $fresh = $album->fresh();
        $this->assertEquals(0, $fresh->total_tracks);
        $this->assertSame('2019-01-01', $fresh->release_date);
        $this->assertSame(0, DB::table('tracks')->count());
    }

    public function testRelationships(): void
    {
        $album = $this->createAlbum();
        $track = $this->createTrack($album);
        DB::table('album_tags')->insert(['album_id' => $album->id, 'tag' => 'sacred']);

        $this->assertTrue($album->tracks->first()->is($track));
        $this->assertSame(['sacred'], $album->albumTags->pluck('tag')->all());
        $this->assertTrue($track->album->is($album));
    }
}
