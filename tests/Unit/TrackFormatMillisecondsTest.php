<?php

namespace Tests\Unit;

use App\Models\Track;
use Tests\TestCase;

class TrackFormatMillisecondsTest extends TestCase
{
    /**
     * @dataProvider durations
     */
    public function testFormatsDurationAsMinutesAndSeconds(int $milliseconds, string $expected): void
    {
        $this->assertSame($expected, Track::formatMilliseconds($milliseconds));
    }

    public function durations(): array
    {
        return [
            'zero' => [0, '0:00'],
            'sub-second rounds down' => [999, '0:00'],
            'one second' => [1000, '0:01'],
            'just under a minute' => [59000, '0:59'],
            'exactly a minute' => [60000, '1:00'],
            'typical track' => [205000, '3:25'],
            'partial second is dropped' => [599999, '9:59'],
            'minutes are not zero-padded' => [540000, '9:00'],
            'just under an hour' => [3599000, '59:59'],
        ];
    }
}
