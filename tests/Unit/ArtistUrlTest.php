<?php

namespace Tests\Unit;

use App\Models\Artist;
use Tests\TestCase;

class ArtistUrlTest extends TestCase
{
    /**
     * @dataProvider names
     */
    public function testArtistUrlIsBuiltFromAlphanumericName(string $name, string $expectedPath): void
    {
        $artist = new Artist();
        $artist->name = $name;

        $this->assertSame('http://localhost' . $expectedPath, $artist->artistUrl());
    }

    public function names(): array
    {
        return [
            'spaces become underscores' => ['Ludovico Einaudi', '/Ludovico_Einaudi'],
            'punctuation is removed' => ['Brian Crain, Jr.', '/Brian_Crain_Jr'],
            'digits are kept' => ['2Cellos', '/2Cellos'],
            'leading and trailing spaces are trimmed' => ['  Yiruma  ', '/Yiruma'],
            'a removed symbol leaves a double underscore' => ['Yiruma & Friends', '/Yiruma__Friends'],
        ];
    }
}
