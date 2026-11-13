<?php

namespace Tests\Feature\Settings;

use App\Models\Settings\Piano;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Tests\DatabaseTestCase;

/**
 * Settings behaviour that reads from the database. The big schedule query in generateSql()
 * and the update*() methods are MySQL-only and aren't covered here.
 */
class SettingsDatabaseTest extends DatabaseTestCase
{
    private function seedTags(): void
    {
        foreach (['christmas' => 1, 'classical' => 2, 'sacred' => 4, 'solo' => 8, 'instrumental' => 16] as $tag => $bitmask) {
            $model = new Tag();
            $model->forceFill(['tag' => $tag, 'bitmask' => $bitmask])->save();
        }
    }

    private function seedMoods(array $moods): void
    {
        $rows = [];
        foreach ($moods as $i => $mood) {
            $rows[] = ['track_id' => $i + 1, 'position' => $i, 'float1' => $mood];
        }
        foreach (array_chunk($rows, 200) as $chunk) {
            DB::table('track_generated_data')->insert($chunk);
        }
    }

    // parseInput() with a selected artist or album

    public function testSelectingAnArtistById(): void
    {
        $artist = $this->createArtist();
        $piano = new Piano();

        $piano->parseInput(Request::create('/', 'GET', ['selectedType' => 'artist', 'selectedId' => (string) $artist->id]));

        $this->assertSame($artist->id, $piano->extra_params['selected_id']);
        $this->assertSame('artist', $piano->selectedType);
    }

    public function testSelectingAnArtistBySpotifyId(): void
    {
        $artist = $this->createArtist(['spotify_id' => '4NJhFmfw43RLBLjQvxDuRS']);
        $piano = new Piano();

        $piano->parseInput(Request::create('/', 'GET', ['selectedType' => 'artist', 'selectedId' => '4NJhFmfw43RLBLjQvxDuRS']));

        $this->assertSame($artist->id, $piano->extra_params['selected_id']);
    }

    public function testSelectingAnAlbum(): void
    {
        $album = $this->createAlbum();
        $piano = new Piano();

        $piano->parseInput(Request::create('/', 'GET', ['selectedType' => 'album', 'selectedId' => (string) $album->id]));

        $this->assertSame($album->id, $piano->extra_params['selected_id']);
    }

    public function testSelectingAnUnknownArtistAddsNoParam(): void
    {
        $piano = new Piano();

        $piano->parseInput(Request::create('/', 'GET', ['selectedType' => 'artist', 'selectedId' => '999']));

        $this->assertArrayNotHasKey('selected_id', $piano->extra_params);
    }

    public function testSettingsAreIgnoredWhenAnArtistIsSelected(): void
    {
        $artist = $this->createArtist();
        $piano = new Piano();

        $piano->parseInput(Request::create('/', 'GET', [
            'selectedType' => 'artist',
            'selectedId' => (string) $artist->id,
            'settings' => json_encode(['mood' => 3]),
        ]));

        $this->assertSame(0, $piano->settings['mood']);
    }

    // Piano::generateSqlConditions()

    public function testNeverExcludesTheTagAndAlwaysRequiresIt(): void
    {
        $this->seedTags();
        $piano = new Piano();
        $piano->settings = ['christmas' => 0, 'classical' => 2, 'sacred' => 1, 'mood' => 0, 'style' => 0];

        $sql = $piano->generateSqlConditions();

        $this->assertStringContainsString('AND ttb.bitmask & 1 = 0', $sql);
        $this->assertStringContainsString('AND ttb.bitmask & 2', $sql);
        $this->assertStringNotContainsString('ttb.bitmask & 4', $sql, '"sometimes" should not filter');
    }

    public function testStyleRestrictsToSoloOrInstrumental(): void
    {
        $this->seedTags();

        $solo = new Piano();
        $solo->settings['style'] = 1;
        $instrumental = new Piano();
        $instrumental->settings['style'] = 2;
        $any = new Piano();

        $this->assertStringContainsString('AND ttb.bitmask & 8', $solo->generateSqlConditions());
        $this->assertStringNotContainsString('ttb.bitmask & 16', $solo->generateSqlConditions());
        $this->assertStringContainsString('AND ttb.bitmask & 16', $instrumental->generateSqlConditions());
        $this->assertStringNotContainsString('ttb.bitmask & 8', $any->generateSqlConditions());
        $this->assertStringNotContainsString('ttb.bitmask & 16', $any->generateSqlConditions());
    }

    public function testDefaultMoodOrdersByPosition(): void
    {
        $this->seedTags();

        $sql = (new Piano())->generateSqlConditions();

        $this->assertStringContainsString('ORDER BY position', $sql);
        $this->assertStringContainsString('LIMIT 0, 100', $sql);
    }

    public function testGentleMoodKeepsTheSoftestTracks(): void
    {
        $this->seedTags();
        $this->seedMoods([10, 20, 50]);
        $piano = new Piano();
        $piano->settings['mood'] = 1;

        $sql = $piano->generateSqlConditions();

        // Threshold is MIN(float1) / 5.
        $this->assertStringContainsString('AND tgd.float1 <= 2', $sql);
        $this->assertStringContainsString('ORDER BY mood ASC', $sql);
    }

    public function testLivelyMoodKeepsTheLiveliestTracks(): void
    {
        $this->seedTags();
        $this->seedMoods([10, 20, 50]);
        $piano = new Piano();
        $piano->settings['mood'] = 3;

        $sql = $piano->generateSqlConditions();

        // Threshold is MAX(float1) / 5.
        $this->assertStringContainsString('AND tgd.float1 >= 10', $sql);
        $this->assertStringContainsString('ORDER BY mood DESC', $sql);
    }

    public function testNaturalMoodOrdersByDistanceFromAverage(): void
    {
        $this->seedTags();
        $piano = new Piano();
        $piano->settings['mood'] = 2;

        $this->assertStringContainsString('ORDER BY ABS(mood - AVG(mood) OVER(PARTITION BY NULL))', $piano->generateSqlConditions());
    }

    public function testSampleSizeGrowsWithTheCatalogue(): void
    {
        $this->seedTags();
        $this->seedMoods(array_fill(0, 1600, 1.0));

        $default = (new Piano())->generateSqlConditions();
        $natural = new Piano();
        $natural->settings['mood'] = 2;

        $this->assertStringContainsString('LIMIT 0, 200', $default, 'an eighth of 1600 tracks');
        $this->assertStringContainsString('LIMIT 0, 1200', $natural->generateSqlConditions(), 'three quarters of 1600 tracks');
    }

    public function testLabeledSettingFiltersBySpotifyArtists(): void
    {
        $this->seedTags();
        $never = new Piano();
        $never->settings['labeled'] = 0;
        $always = new Piano();
        $always->settings['labeled'] = 2;

        $this->assertStringContainsString('art.spotify_id IS NULL', $never->generateSqlConditions());
        $this->assertStringContainsString('art.spotify_id IS NOT NULL', $always->generateSqlConditions());
    }

    // stats()

    private function seedCatalogue(): void
    {
        foreach (['A', 'B'] as $name) {
            $artist = $this->createArtist(['name' => $name]);
            $album = $this->createAlbum($artist);
            $this->createYoutubeSource($this->createTrack($album, $artist), 'v' . $name);
            $this->createTrack($album, $artist, ['name' => 'No source']);
        }

        $hidden = $this->createArtist(['name' => 'Hidden', 'is_usable' => false]);
        $album = $this->createAlbum($hidden);
        $this->createYoutubeSource($this->createTrack($album, $hidden), 'vHidden');

        $shown = $this->createArtist(['name' => 'Shown']);
        $withdrawn = $this->createAlbum($shown, ['is_usable' => false]);
        $this->createYoutubeSource($this->createTrack($withdrawn, $shown), 'vWithdrawn');
        $this->createYoutubeSource($this->createTrack(null, $shown, ['name' => 'Single without album']), 'vSingle');
    }

    public function testStatsCountOnlyPlayableUsableMusic(): void
    {
        $this->seedCatalogue();

        $stats = (new Piano())->stats();

        $this->assertEquals(['tracks' => 3, 'albums' => 2, 'artists' => 3, 'plays' => 0], $stats);
    }

    public function testStatsAreStoredPerSiteModel(): void
    {
        $this->seedCatalogue();

        (new Piano())->stats();

        $this->assertDatabaseHas('stats', ['key' => 'track_count', 'model' => 'Piano', 'value' => '3']);
        $this->assertDatabaseHas('stats', ['key' => 'album_count', 'model' => 'Piano', 'value' => '2']);
        $this->assertDatabaseHas('stats', ['key' => 'artist_count', 'model' => 'Piano', 'value' => '3']);
    }

    public function testStatsAreCachedUntilTheyExpire(): void
    {
        (new Piano())->stats();
        $this->createArtist();

        $this->assertEquals(0, (new Piano())->stats()['artists'], 'still cached');

        putenv('UPDATE_STATS_SECONDS=0');
        try {
            $this->assertEquals(1, (new Piano())->stats()['artists'], 'refreshed');
        } finally {
            putenv('UPDATE_STATS_SECONDS=3600');
        }
    }

    public function testStatsEndpoint(): void
    {
        $this->seedCatalogue();

        $this->getJson('/api/v1/stats')->assertOk()->assertJson(['tracks' => 3, 'albums' => 2, 'artists' => 3, 'plays' => 0]);
    }
}
