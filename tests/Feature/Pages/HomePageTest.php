<?php

namespace Tests\Feature\Pages;

use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

class HomePageTest extends DatabaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMix();
    }

    private function artistWithTrack(string $name, array $attributes = [])
    {
        $artist = $this->createArtist(array_merge(['name' => $name, 'image_url' => 'https://img.test/' . md5($name) . '.jpg'], $attributes));
        $album = $this->createAlbum($artist);
        $this->createYoutubeSource($this->createTrack($album, $artist), 'v' . $artist->id);
        return $artist;
    }

    public function testRendersWithAnEmptyCatalogue(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Piano Radio')
            ->assertSee('Now streaming 0 artists, 0 albums, and 0 tracks', false);
    }

    public function testShowsCatalogueStats(): void
    {
        $this->artistWithTrack('Alpha');
        $this->artistWithTrack('Beta');
        $this->createArtist(['name' => 'Hidden', 'is_usable' => false]);

        $this->get('/')->assertOk()->assertSee('Now streaming 2 artists, 2 albums, and 2 tracks', false);
    }

    public function testListsUsableArtistsThatHaveTracks(): void
    {
        $this->artistWithTrack('Ludovico Einaudi');
        $this->createArtist(['name' => 'No Tracks Yet']);
        $this->artistWithTrack('Turned Off', ['is_usable' => false]);

        $this->get('/')
            ->assertOk()
            ->assertSee('href="/Ludovico_Einaudi"', false)
            ->assertDontSee('No Tracks Yet')
            ->assertDontSee('Turned Off');
    }

    public function testIncludesBoostedFeaturedArtistsEvenWithoutTracks(): void
    {
        $featured = $this->createArtist(['name' => 'Featured Pianist']);
        $notBoosted = $this->createArtist(['name' => 'Barely Featured']);
        DB::table('artist_featured')->insert([
            ['artist_id' => $featured->id, 'boost' => 5],
            ['artist_id' => $notBoosted->id, 'boost' => 1],
        ]);

        $this->get('/')
            ->assertOk()
            ->assertSee('Featured Pianist')
            ->assertDontSee('Barely Featured');
    }

    public function testShowsAtMostFifteenArtists(): void
    {
        for ($i = 1; $i <= 20; $i++) {
            $this->artistWithTrack('Pianist ' . $i);
        }

        $html = $this->get('/')->assertOk()->getContent();

        $this->assertSame(15, substr_count($html, 'class="artist col-md-2'));
    }

    public function testIncludesOpenGraphTags(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('og:title', false)
            ->assertSee('http://localhost/images/piano-background.jpg', false);
    }
}
