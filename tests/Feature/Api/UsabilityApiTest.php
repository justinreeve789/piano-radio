<?php

namespace Tests\Feature\Api;

use PHPUnit\Framework\Attributes\DataProvider;
use Tests\DatabaseTestCase;

class UsabilityApiTest extends DatabaseTestCase
{
    private function createRecord(string $type)
    {
        switch ($type) {
            case 'artist':
                return $this->createArtist();
            case 'album':
                return $this->createAlbum();
            default:
                return $this->createTrack();
        }
    }

    public static function types(): array
    {
        return [
            'artist' => ['artist', 'artists'],
            'album' => ['album', 'albums'],
            'track' => ['track', 'tracks'],
        ];
    }

    #[DataProvider('types')]
    public function testTogglesUsability(string $type, string $table): void
    {
        $record = $this->createRecord($type);

        $this->postJson("/api/v1/{$type}/usable", ['id' => $record->id])->assertOk();
        $this->assertDatabaseHas($table, ['id' => $record->id, 'is_usable' => 0]);

        $this->postJson("/api/v1/{$type}/usable", ['id' => $record->id])->assertOk();
        $this->assertDatabaseHas($table, ['id' => $record->id, 'is_usable' => 1]);
    }

    #[DataProvider('types')]
    public function testOnlyTogglesTheRequestedRecord(string $type, string $table): void
    {
        $target = $this->createRecord($type);
        $other = $this->createRecord($type);

        $this->postJson("/api/v1/{$type}/usable", ['id' => $target->id])->assertOk();

        $this->assertDatabaseHas($table, ['id' => $other->id, 'is_usable' => 1]);
    }

    #[DataProvider('types')]
    public function testUnknownIdIsANoOp(string $type, string $table): void
    {
        $record = $this->createRecord($type);

        $this->postJson("/api/v1/{$type}/usable", ['id' => 999])->assertOk();
        $this->postJson("/api/v1/{$type}/usable", [])->assertOk();

        $this->assertDatabaseHas($table, ['id' => $record->id, 'is_usable' => 1]);
    }
}
