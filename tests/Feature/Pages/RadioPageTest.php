<?php

namespace Tests\Feature\Pages;

use Tests\DatabaseTestCase;

class RadioPageTest extends DatabaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMix();
    }

    public function testGeneralRadioHasNoSelectedArtist(): void
    {
        $this->get('/listen')
            ->assertOk()
            ->assertSee("const settingsComponent = 'SettingsPiano';", false)
            ->assertSee("const selectedType = '';", false)
            ->assertSee("const selectedId = '';", false);
    }

    public function testArtistRadioSelectsTheArtist(): void
    {
        $artist = $this->createArtist(['name' => 'Yiruma']);

        $this->get("/{$artist->id}/listen")
            ->assertOk()
            ->assertSee("const selectedType = 'artist';", false)
            ->assertSee("const selectedId = '{$artist->id}';", false)
            ->assertSee('Yiruma: Piano Radio', false);
    }

    public function testUnknownArtistIdFallsBackToTheGeneralRadio(): void
    {
        $this->get('/999/listen')
            ->assertOk()
            ->assertSee("const selectedType = '';", false);
    }
}
