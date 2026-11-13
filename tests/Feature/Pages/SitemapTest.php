<?php

namespace Tests\Feature\Pages;

use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

class SitemapTest extends DatabaseTestCase
{
    public function testListsHomeAndUsableArtistPages(): void
    {
        $this->createArtist(['name' => 'Ludovico Einaudi']);
        $this->createArtist(['name' => 'Retired Artist', 'is_usable' => false]);

        $this->get('/sitemap')
            ->assertOk()
            ->assertSee('<loc>http://localhost</loc>', false)
            ->assertSee('<loc>http://localhost/Ludovico_Einaudi</loc>', false)
            ->assertDontSee('Retired_Artist');
    }

    public function testFeaturedArtistsGetHigherPriority(): void
    {
        $featured = $this->createArtist(['name' => 'Featured']);
        $this->createArtist(['name' => 'Regular']);
        DB::table('artist_featured')->insert(['artist_id' => $featured->id, 'boost' => 2]);

        $xml = $this->get('/sitemap')->assertOk()->getContent();

        $this->assertMatchesRegularExpression('#<loc>http://localhost/Featured</loc>\s*<priority>0\.9</priority>#', $xml);
        $this->assertMatchesRegularExpression('#<loc>http://localhost/Regular</loc>\s*<priority>0\.5</priority>#', $xml);
    }

    public function testIsServedAsXml(): void
    {
        $response = $this->get('/sitemap')->assertOk();

        $this->assertStringContainsString('xml', $response->headers->get('Content-Type'));
        $this->assertStringStartsWith('<?xml', $response->getContent());
    }
}
