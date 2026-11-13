<?php

namespace Tests\Feature\Api;

use App\Http\Controllers\TrackController;
use App\Models\ArtistTag;
use App\Models\TrackTag;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Mockery;
use Tests\DatabaseTestCase;

require_once __DIR__ . '/../../Support/FakeScheduleSettings.php';

/**
 * The radio schedule: a day's worth of tracks, with the one playing "now" as current_track.
 *
 * The default schedule has three tracks covering 0–30000 seconds, so the controller has to
 * repeat it to fill the day (86400 seconds):
 *   index 0: track 1, 0–10000      index 3: track 1, 30000–40000   index 6: track 1, 60000–70000
 *   index 1: track 2, 10000–25000  index 4: track 2, 40000–55000   index 7: track 2, 70000–85000
 *   index 2: track 3, 25000–30000  index 5: track 3, 55000–60000   index 8: track 3, 85000–90000
 */
class TrackScheduleTest extends DatabaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        putenv('APP_SETTINGS_MODEL=FakeScheduleSettings');
        putenv('PREVIOUS_TRACK_COUNT=2');
        putenv('NEXT_TRACK_COUNT=3');

        Schema::create('fake_schedule', function (Blueprint $table) {
            $table->integer('track_id');
            $table->integer('artist_id');
            $table->integer('album_id');
            $table->integer('secs_start');
            $table->integer('secs_end');
        });
    }

    protected function tearDown(): void
    {
        putenv('APP_SETTINGS_MODEL=Piano');
        putenv('PREVIOUS_TRACK_COUNT=5');
        putenv('NEXT_TRACK_COUNT=20');
        parent::tearDown();
    }

    private function seedDefaultSchedule(): void
    {
        DB::table('fake_schedule')->insert([
            ['track_id' => 1, 'artist_id' => 10, 'album_id' => 100, 'secs_start' => 0, 'secs_end' => 10000],
            ['track_id' => 2, 'artist_id' => 20, 'album_id' => 200, 'secs_start' => 10000, 'secs_end' => 25000],
            ['track_id' => 3, 'artist_id' => 30, 'album_id' => 300, 'secs_start' => 25000, 'secs_end' => 30000],
        ]);
    }

    private function controllerAt(int $currentSeconds): TrackController
    {
        // getCurrentSecondsInDay() uses MySQL's TIME_TO_SEC(), so the clock is stubbed.
        $controller = Mockery::mock(TrackController::class)->makePartial();
        $controller->shouldReceive('getCurrentSecondsInDay')->andReturn($currentSeconds);
        return $controller;
    }

    private function scheduleAt(int $currentSeconds)
    {
        return $this->controllerAt($currentSeconds)->getTrackSchedule(Request::create('/api/v1/track'));
    }

    private function slot($track): array
    {
        return [$track->track_id, $track->secs_start, $track->secs_end];
    }

    public function testReturnsNullWhenNothingIsSchedulable(): void
    {
        $this->assertNull($this->scheduleAt(5000));
    }

    public function testReportsTheCurrentSeconds(): void
    {
        $this->seedDefaultSchedule();

        $this->assertSame(12000, $this->scheduleAt(12000)['current_seconds']);
    }

    /**
     * @dataProvider currentTrackCases
     */
    public function testPicksTheTrackPlayingNow(int $now, array $expectedSlot): void
    {
        $this->seedDefaultSchedule();

        $this->assertEquals($expectedSlot, $this->slot($this->scheduleAt($now)['current_track']));
    }

    public function currentTrackCases(): array
    {
        return [
            'start of day' => [0, [1, 0, 10000]],
            'first second' => [1, [1, 0, 10000]],
            'middle of first track' => [5000, [1, 0, 10000]],
            'just after second track starts' => [10001, [2, 10000, 25000]],
            'middle of third track' => [26000, [3, 25000, 30000]],
            'first repeat of the list' => [30001, [1, 30000, 40000]],
            'later repeat is shifted by the loop length' => [45000, [2, 40000, 55000]],
            'evening' => [75000, [2, 70000, 85000]],
        ];
    }

    public function testRepeatsTheListUntilTheDayIsCovered(): void
    {
        $this->seedDefaultSchedule();
        putenv('NEXT_TRACK_COUNT=100');

        $schedule = $this->scheduleAt(0);
        $all = array_merge([$schedule['current_track']], $schedule['next_tracks']);

        $this->assertCount(9, $all);
        $this->assertEquals(90000, end($all)->secs_end);
        foreach (array_slice($all, 1) as $i => $track) {
            $this->assertEquals($all[$i]->secs_end, $track->secs_start, 'tracks must be back to back');
        }
    }

    public function testPreviousTracksAreMostRecentFirstAndLimited(): void
    {
        $this->seedDefaultSchedule();

        $previous = $this->scheduleAt(45000)['previous_tracks'];

        $this->assertEquals([[1, 30000, 40000], [3, 25000, 30000]], array_map([$this, 'slot'], $previous));
    }

    public function testNextTracksAreInPlayOrderAndLimited(): void
    {
        $this->seedDefaultSchedule();

        $next = $this->scheduleAt(45000)['next_tracks'];

        $this->assertEquals(
            [[3, 55000, 60000], [1, 60000, 70000], [2, 70000, 85000]],
            array_map([$this, 'slot'], $next)
        );
    }

    public function testNoPreviousTracksAtStartOfDay(): void
    {
        $this->seedDefaultSchedule();

        $this->assertSame([], $this->scheduleAt(0)['previous_tracks']);
    }

    public function testNextTracksStopAtTheEndOfTheDay(): void
    {
        $this->seedDefaultSchedule();
        putenv('NEXT_TRACK_COUNT=20');

        $next = $this->scheduleAt(75000)['next_tracks'];

        $this->assertEquals([[3, 85000, 90000]], array_map([$this, 'slot'], $next));
    }

    public function testAttachesTagsToCurrentPreviousAndNextTracks(): void
    {
        $this->seedDefaultSchedule();
        $this->createArtist(['id' => 20, 'name' => 'Tagged Artist']);
        $tag = new ArtistTag();
        $tag->forceFill(['artist_id' => 20, 'tag' => 'classical'])->save();
        $tag = new TrackTag();
        $tag->forceFill(['track_id' => 3, 'tag' => 'christmas'])->save();

        $schedule = $this->scheduleAt(12000);

        $this->assertSame(['classical'], $schedule['current_track']->artist_tags);
        $this->assertSame([], $schedule['current_track']->album_tags);
        $this->assertSame([], $schedule['current_track']->track_tags);
        $this->assertSame(['christmas'], $schedule['next_tracks'][0]->track_tags);
        $this->assertSame([], $schedule['previous_tracks'][0]->artist_tags);
    }

    public function testRepeatedTracksAreCopiesNotReferences(): void
    {
        $this->seedDefaultSchedule();
        putenv('NEXT_TRACK_COUNT=100');

        $schedule = $this->scheduleAt(0);
        $all = array_merge([$schedule['current_track']], $schedule['next_tracks']);

        $this->assertNotSame($all[0], $all[3]);
        $this->assertEquals(0, $all[0]->secs_start);
        $this->assertEquals(30000, $all[3]->secs_start);
    }

    public function testEndpointReturnsTheSchedule(): void
    {
        $this->seedDefaultSchedule();
        $this->app->instance(TrackController::class, $this->controllerAt(12000));

        $response = $this->getJson('/api/v1/track')
            ->assertOk()
            ->assertJsonCount(1, 'previous_tracks')
            ->assertJsonCount(3, 'next_tracks');

        $this->assertEquals(12000, $response->json('current_seconds'));
        $this->assertEquals(2, $response->json('current_track.track_id'));
    }
}
