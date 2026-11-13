<?php

namespace Tests\Feature\Pages;

use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

class ArtistPageTest extends DatabaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMix();
    }

    public function testShowsTheArtistWithAlbumsAndTracks(): void
    {
        $artist = $this->createArtist(['name' => 'Ludovico Einaudi', 'image_url' => 'https://img.test/le.jpg']);
        $album = $this->createAlbum($artist, ['name' => 'Divenire']);
        $track = $this->createTrack($album, $artist, ['name' => 'Primavera', 'track_number' => 3]);
        $this->createYoutubeSource($track, 'prima1');

        $this->get('/' . $artist->id)
            ->assertOk()
            ->assertSee('<title>Ludovico Einaudi - Piano Radio Artist</title>', false)
            ->assertSee('Divenire')
            ->assertSee('href="https://youtube.com/watch?v=prima1"', false)
            ->assertSee('Primavera')
            ->assertSee("/Ludovico_Einaudi/listen", false);
    }

    public function testListsAlbumsNewestFirstAndHidesUnusableOnes(): void
    {
        $artist = $this->createArtist();
        $this->createAlbum($artist, ['name' => 'Older Album', 'release_date' => '2015-01-01']);
        $this->createAlbum($artist, ['name' => 'Newer Album', 'release_date' => '2021-06-01']);
        $this->createAlbum($artist, ['name' => 'Withdrawn Album', 'is_usable' => false]);

        $html = $this->get('/' . $artist->id)->assertOk()->getContent();

        $this->assertStringNotContainsString('Withdrawn Album', $html);
        $this->assertLessThan(strpos($html, 'Older Album'), strpos($html, 'Newer Album'));
    }

    public function testShowsArtistSitesButHidesYoutubeVideoLinks(): void
    {
        $artist = $this->createArtist();
        DB::table('artist_sites')->insert([
            ['artist_id' => $artist->id, 'type' => 'spotify', 'url' => 'https://open.spotify.test/artist/1'],
            ['artist_id' => $artist->id, 'type' => 'personal', 'url' => 'https://pianist.test'],
            ['artist_id' => $artist->id, 'type' => 'youtube', 'url' => 'https://www.youtube.com/watch?v=xyz'],
            ['artist_id' => $artist->id, 'type' => 'youtube', 'url' => 'https://www.youtube.com/channel/UC123'],
        ]);

        $this->get('/' . $artist->id)
            ->assertOk()
            ->assertSee('https://open.spotify.test/artist/1', false)
            ->assertSee('https://pianist.test', false)
            ->assertSee('https://www.youtube.com/channel/UC123', false)
            ->assertDontSee('watch?v=xyz', false);
    }

    public function testOpenGraphUsesTheArtist(): void
    {
        $artist = $this->createArtist(['name' => 'Yiruma', 'image_url' => 'https://img.test/yiruma.jpg']);

        $this->get('/' . $artist->id)
            ->assertOk()
            ->assertSee('Yiruma: Piano Radio', false)
            ->assertSee('https://img.test/yiruma.jpg', false);
    }
}
