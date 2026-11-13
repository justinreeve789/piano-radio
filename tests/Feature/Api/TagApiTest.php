<?php

namespace Tests\Feature\Api;

use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

class TagApiTest extends DatabaseTestCase
{
    public function testListsTheSiteTags(): void
    {
        $this->getJson('/api/v1/tag')
            ->assertOk()
            ->assertExactJson(['tags' => ['christmas', 'classical', 'sacred', 'solo', 'instrumental']]);
    }

    /**
     * @dataProvider tagTypes
     */
    public function testCreatesANormalisedTag(string $type, string $table): void
    {
        $this->postJson("/api/v1/{$type}/tag", ['id' => 7, 'tag' => '  Christmas '])->assertOk();

        $this->assertDatabaseHas($table, ["{$type}_id" => 7, 'tag' => 'christmas']);
    }

    /**
     * @dataProvider tagTypes
     */
    public function testDeletesATag(string $type, string $table): void
    {
        DB::table($table)->insert([
            ["{$type}_id" => 7, 'tag' => 'christmas'],
            ["{$type}_id" => 7, 'tag' => 'sacred'],
            ["{$type}_id" => 8, 'tag' => 'christmas'],
        ]);

        $this->deleteJson("/api/v1/{$type}/tag", ['id' => 7, 'tag' => ' CHRISTMAS'])->assertOk();

        $this->assertDatabaseMissing($table, ["{$type}_id" => 7, 'tag' => 'christmas']);
        $this->assertDatabaseHas($table, ["{$type}_id" => 7, 'tag' => 'sacred']);
        $this->assertDatabaseHas($table, ["{$type}_id" => 8, 'tag' => 'christmas']);
    }

    public function tagTypes(): array
    {
        return [
            'artist' => ['artist', 'artist_tags'],
            'album' => ['album', 'album_tags'],
            'track' => ['track', 'track_tags'],
        ];
    }

    /**
     * @dataProvider invalidInput
     */
    public function testIgnoresInvalidInputOnCreate(array $input): void
    {
        $this->postJson('/api/v1/artist/tag', $input)->assertOk();

        $this->assertSame(0, DB::table('artist_tags')->count());
    }

    /**
     * @dataProvider invalidInput
     */
    public function testIgnoresInvalidInputOnDelete(array $input): void
    {
        DB::table('artist_tags')->insert(['artist_id' => 7, 'tag' => 'christmas']);

        $this->deleteJson('/api/v1/artist/tag', $input)->assertOk();

        $this->assertSame(1, DB::table('artist_tags')->count());
    }

    public function invalidInput(): array
    {
        return [
            'missing id' => [['tag' => 'christmas']],
            'non-numeric id' => [['id' => 'abc', 'tag' => 'christmas']],
            'missing tag' => [['id' => 7]],
            'blank tag' => [['id' => 7, 'tag' => '   ']],
        ];
    }

    public function testGetsTagsForAnArtistAlbumAndTrack(): void
    {
        $artist = $this->createArtist();
        $album = $this->createAlbum($artist);
        $track = $this->createTrack($album, $artist);
        DB::table('artist_tags')->insert(['artist_id' => $artist->id, 'tag' => 'classical']);
        DB::table('album_tags')->insert(['album_id' => $album->id, 'tag' => 'christmas']);
        DB::table('track_tags')->insert(['track_id' => $track->id, 'tag' => 'solo']);

        $response = $this->getJson("/api/v1/tag/{$artist->id}/{$album->id}/{$track->id}")->assertOk();

        $this->assertSame(['classical'], array_column($response->json('artist_tags'), 'tag'));
        $this->assertSame(['christmas'], array_column($response->json('album_tags'), 'tag'));
        $this->assertSame(['solo'], array_column($response->json('track_tags'), 'tag'));
    }
}
