<?php

namespace Tests\Feature;

use App\Http\Controllers\TrackController;
use App\Models\Album;
use App\Models\Settings\Metal;
use App\Models\Settings\Piano;
use App\Models\Track;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Mockery;
use Tests\DatabaseTestCase;

require_once __DIR__ . '/../Support/FakeScheduleSettings.php';

/**
 * Each test here describes the behaviour the code should have and fails against the
 * current code. They're excluded from the default run (see phpunit.xml).
 *
 * Run them with:  vendor/bin/phpunit --group known-bugs
 *
 * When you fix one, move its test into the regular suite.
 *
 * @group known-bugs
 */
class KnownBugsTest extends DatabaseTestCase
{
    protected function tearDown(): void
    {
        putenv('APP_SETTINGS_MODEL=Piano');
        parent::tearDown();
    }

    private function scheduleAt(int $currentSeconds)
    {
        putenv('APP_SETTINGS_MODEL=FakeScheduleSettings');
        Schema::create('fake_schedule', function (Blueprint $table) {
            $table->integer('track_id');
            $table->integer('artist_id');
            $table->integer('album_id');
            $table->integer('secs_start');
            $table->integer('secs_end');
        });
        DB::table('fake_schedule')->insert([
            ['track_id' => 1, 'artist_id' => 10, 'album_id' => 100, 'secs_start' => 0, 'secs_end' => 10000],
            ['track_id' => 2, 'artist_id' => 20, 'album_id' => 200, 'secs_start' => 10000, 'secs_end' => 25000],
            ['track_id' => 3, 'artist_id' => 30, 'album_id' => 300, 'secs_start' => 25000, 'secs_end' => 30000],
        ]);

        $controller = Mockery::mock(TrackController::class)->makePartial();
        $controller->shouldReceive('getCurrentSecondsInDay')->andReturn($currentSeconds);
        return $controller->getTrackSchedule(Request::create('/api/v1/track'));
    }

    /**
     * TrackController::getTrackSchedule() only sets $jump_index when it finds a track that
     * starts at or after the current time. After the day's last track has started (here
     * from 85000s, i.e. 23:36 UTC) there is none, so $jump_index is undefined and
     * GET /api/v1/track returns a 500 until midnight. This happens every day.
     */
    public function testScheduleWorksAfterTheLastTrackOfTheDayHasStarted(): void
    {
        $schedule = $this->scheduleAt(86000);

        $this->assertEquals(3, $schedule['current_track']->track_id);
        $this->assertEquals(85000, $schedule['current_track']->secs_start);
    }

    /**
     * When a track starts exactly at the current second, the previous (finished) track is
     * returned as current, because the jump index is always i - 1.
     */
    public function testTrackStartingExactlyNowIsCurrent(): void
    {
        $schedule = $this->scheduleAt(10000);

        $this->assertEquals(2, $schedule['current_track']->track_id);
    }

    /**
     * Route::resource('/album') is registered before the custom GET /album/{album_id}
     * route, so requests hit the empty resource show() stub and return nothing.
     * ArtistController has the same problem, and its custom route points at a method
     * (artist_id) that doesn't exist.
     */
    public function testGetAlbumReturnsTheAlbumWithTags(): void
    {
        $album = $this->createAlbum(null, ['name' => 'Divenire']);
        DB::table('album_tags')->insert(['album_id' => $album->id, 'tag' => 'classical']);

        $this->getJson("/api/v1/album/{$album->id}")
            ->assertOk()
            ->assertJsonPath('name', 'Divenire')
            ->assertJsonPath('album_tags.0.tag', 'classical');
    }

    public function testGetArtistReturnsTheArtistWithTags(): void
    {
        $artist = $this->createArtist(['name' => 'Yiruma']);
        DB::table('artist_tags')->insert(['artist_id' => $artist->id, 'tag' => 'solo']);

        $this->getJson("/api/v1/artist/{$artist->id}")
            ->assertOk()
            ->assertJsonPath('name', 'Yiruma')
            ->assertJsonPath('artist_tags.0.tag', 'solo');
    }

    /**
     * These routes point at controller methods that don't exist, so they throw
     * BadMethodCallException (500). Either implement them or remove the routes.
     *
     * @dataProvider routesToMissingMethods
     */
    public function testRoutesDoNotPointAtMissingMethods(string $method, string $uri): void
    {
        $response = $this->json($method, $uri, ['id' => 1, 'rating' => 5]);

        $this->assertFalse($response->isServerError(), "{$method} {$uri} returned {$response->status()}");
    }

    public function routesToMissingMethods(): array
    {
        return [
            'track next' => ['GET', '/api/v1/track/next'],
            'track rate' => ['POST', '/api/v1/track/rate'],
            'album rate' => ['POST', '/api/v1/album/rate'],
            'artist rate' => ['POST', '/api/v1/artist/rate'],
        ];
    }

    /**
     * TagController builds a model class name from the URL ('\App\Models\' . ucfirst($type) . 'Tag'),
     * so any other type is a fatal "class not found" (500). It should be rejected as a 404/422.
     */
    public function testUnknownTagTypeIsAClientError(): void
    {
        $response = $this->postJson('/api/v1/playlist/tag', ['id' => 1, 'tag' => 'x']);

        $this->assertTrue($response->isClientError(), 'got ' . $response->status());
    }

    /**
     * TagController::get() calls ->artistTags etc. on null when any id doesn't exist.
     */
    public function testTagsForMissingRecordsIsNotAServerError(): void
    {
        $response = $this->getJson('/api/v1/tag/1/2/3');

        $this->assertFalse($response->isServerError(), 'got ' . $response->status());
    }

    /**
     * PagesController::artist() returns nothing when the artist doesn't exist, which is a
     * blank 200 page. It only aborts with 404 when an exception is thrown.
     */
    public function testUnknownArtistPageIs404(): void
    {
        $this->get('/999')->assertNotFound();
    }

    /**
     * Album::fixData() takes the *last* track's number as the highest, not the maximum.
     * With tracks numbered [1, 0] the new track also gets 1.
     */
    public function testFixDataNumbersAfterTheHighestExistingNumber(): void
    {
        $album = $this->createAlbum(null, ['image_url' => 'set']);
        $this->createTrack($album, null, ['track_number' => 1]);
        $new = $this->createTrack($album, null, ['track_number' => 0]);

        $album->fixData();

        $this->assertEquals(2, $new->fresh()->track_number);
    }

    /**
     * Spotify gives year-only release dates ("release_date_precision": "year"). strtotime('2006')
     * parses that as the time 20:06 today, so the album is saved with today's date.
     */
    public function testSpotifyYearOnlyReleaseDate(): void
    {
        $album = new Album();
        $album->saveFromSpotifyData((object) [
            'id' => 'sp1', 'name' => 'Old Album', 'total_tracks' => 1, 'images' => [], 'release_date' => '2006',
        ]);

        $this->assertSame('2006-01-01', $album->fresh()->release_date);
    }

    /**
     * Track::formatMilliseconds() takes seconds modulo 3600, so hour-long tracks lose their hours
     * (65 minutes shows as "5:00").
     */
    public function testFormatMillisecondsKeepsHours(): void
    {
        $this->assertSame('1:05:00', Track::formatMilliseconds(3900000));
    }

    /**
     * Settings::modifySeed() is meant to give each combination of settings its own seed, but
     * it uses ord() on each value, which only looks at the first character. Different genre
     * selections or year ranges therefore produce the same seed.
     */
    public function testDifferentSettingsGiveDifferentSeeds(): void
    {
        $black = new Metal();
        $black->settings['genres'] = ['black'];
        $blackAndDeath = new Metal();
        $blackAndDeath->settings['genres'] = ['black', 'death'];

        $eighties = new Metal();
        $eighties->settings['years'] = [1980, 1989];
        $nineties = new Metal();
        $nineties->settings['years'] = [1990, 1999];

        $this->assertNotSame($black->modifySeed(20261113), $blackAndDeath->modifySeed(20261113));
        $this->assertNotSame($eighties->modifySeed(20261113), $nineties->modifySeed(20261113));
    }

    /**
     * Stats has primaryKey 'key' but the table's key is (key, model). Saving one site's
     * refreshed stats runs UPDATE ... WHERE key = 'track_count', which overwrites every
     * other site's row too.
     */
    public function testRefreshingStatsOnlyUpdatesThisSite(): void
    {
        $old = '2020-01-01 00:00:00';
        foreach (['track_count', 'album_count', 'artist_count'] as $key) {
            DB::table('stats')->insert([
                ['key' => $key, 'model' => 'Piano', 'value' => '1', 'created_at' => $old, 'updated_at' => $old],
                ['key' => $key, 'model' => 'Metal', 'value' => '999', 'created_at' => $old, 'updated_at' => $old],
            ]);
        }

        (new Piano())->stats();

        $this->assertDatabaseHas('stats', ['key' => 'track_count', 'model' => 'Metal', 'value' => '999']);
    }

    /**
     * Likely bug: featured artists are added to the home page without checking is_usable,
     * so an artist that has been switched off still appears if it's featured.
     */
    public function testHomePageHidesUnusableFeaturedArtists(): void
    {
        $this->withoutMix();
        $artist = $this->createArtist(['name' => 'Switched Off', 'is_usable' => false]);
        DB::table('artist_featured')->insert(['artist_id' => $artist->id, 'boost' => 5]);

        $this->get('/')->assertOk()->assertDontSee('Switched Off');
    }
}
