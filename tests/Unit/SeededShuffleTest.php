<?php

namespace Tests\Unit;

use App\Http\Controllers\PagesController;
use Tests\TestCase;

class SeededShuffleTest extends TestCase
{
    private function shuffle(array $items, $seed)
    {
        $method = new \ReflectionMethod(PagesController::class, 'seededShuffle');
        $method->setAccessible(true);
        return $method->invokeArgs(new PagesController(), [&$items, $seed]);
    }

    public function testSameSeedGivesSameOrder(): void
    {
        $items = range(1, 10);

        $this->assertSame($this->shuffle($items, 2026111312), $this->shuffle($items, 2026111312));
    }

    public function testKnownSeedGivesKnownOrder(): void
    {
        // Pins the Mt19937 sequence so a change in shuffle behaviour (or PHP's RNG) is noticed:
        // the home page's artist order for a given hour depends on it.
        $this->assertSame([5, 3, 6, 8, 9, 2, 4, 10, 7, 1], $this->shuffle(range(1, 10), 2026111312));
    }

    public function testDifferentSeedsGiveDifferentOrders(): void
    {
        $items = range(1, 10);

        $this->assertNotSame($this->shuffle($items, 2026111312), $this->shuffle($items, 2026111313));
    }

    public function testResultIsAPermutationOfTheInput(): void
    {
        $items = range(1, 50);
        $result = $this->shuffle($items, 12345);

        $sorted = $result;
        sort($sorted);
        $this->assertSame($items, $sorted);
    }

    public function testKeysAreReindexed(): void
    {
        // The home page view reads $artists[0..14], so the id-keyed array must come back as a list.
        $result = $this->shuffle([42 => 'a', 7 => 'b', 99 => 'c'], 5);

        $this->assertSame([0, 1, 2], array_keys($result));
    }

    public function testShufflesInPlaceAndReturnsTheSameArray(): void
    {
        $items = range(1, 10);
        $method = new \ReflectionMethod(PagesController::class, 'seededShuffle');
        $method->setAccessible(true);

        $returned = $method->invokeArgs(new PagesController(), [&$items, 99]);

        $this->assertSame($returned, $items);
    }

    public function testEmptyAndSingleItemArrays(): void
    {
        $this->assertSame([], $this->shuffle([], 1));
        $this->assertSame(['only'], $this->shuffle(['x' => 'only'], 1));
    }
}
