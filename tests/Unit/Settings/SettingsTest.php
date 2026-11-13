<?php

namespace Tests\Unit\Settings;

use App\Models\Settings\Metal;
use App\Models\Settings\Piano;
use App\Models\Settings\Settings;
use Illuminate\Http\Request;
use Tests\TestCase;

/**
 * Behaviour of the Settings base class that needs no database.
 */
class SettingsTest extends TestCase
{
    private function bareSettings(array $settings = []): Settings
    {
        $model = new class extends Settings {};
        $model->settings = $settings;
        return $model;
    }

    private function requestWithSettings($settings): Request
    {
        return Request::create('/', 'GET', ['settings' => is_string($settings) ? $settings : json_encode($settings)]);
    }

    public function testBaseClassStartsEmpty(): void
    {
        $settings = $this->bareSettings();

        $this->assertSame([], $settings->settings);
        $this->assertSame([], $settings->getAllTags());
        $this->assertSame([], $settings->getExtraSqlParams(1));
    }

    public function testHasSetting(): void
    {
        $settings = $this->bareSettings(['mood' => 0]);

        $this->assertTrue($settings->hasSetting('mood'));
        $this->assertFalse($settings->hasSetting('tempo'));
    }

    public function testIsEqualToUsesLooseComparison(): void
    {
        $settings = $this->bareSettings(['mood' => 2]);

        $this->assertTrue($settings->is_equal_to('mood', 2));
        $this->assertTrue($settings->is_equal_to('mood', '2'));
        $this->assertFalse($settings->is_equal_to('mood', 3));
        $this->assertFalse($settings->is_equal_to('missing', 2));
    }

    public function testModifySeedLeavesSeedAloneWithoutSettings(): void
    {
        $this->assertSame(20261113, $this->bareSettings()->modifySeed(20261113));
    }

    public function testModifySeedForPianoDefaults(): void
    {
        // Pinned so that a change to the seed formula (which reshuffles every listener's station) is deliberate.
        $this->assertSame(275054005139, (new Piano())->modifySeed(20261113));
    }

    public function testModifySeedChangesWithSettings(): void
    {
        $gentle = new Piano();
        $gentle->settings['mood'] = 1;
        $lively = new Piano();
        $lively->settings['mood'] = 3;

        $this->assertSame(280781388465, $gentle->modifySeed(20261113));
        $this->assertSame(292236155117, $lively->modifySeed(20261113));
    }

    public function testModifySeedAcceptsArrayValues(): void
    {
        $settings = $this->bareSettings(['genres' => ['black', 'death']]);

        $this->assertIsInt($settings->modifySeed(1));
        $this->assertNotSame(1, $settings->modifySeed(1));
    }

    public function testExtraParamsReplaceSeedPlaceholder(): void
    {
        $settings = $this->bareSettings();
        $settings->extra_params = ['seed2' => '{{seed}}', 'other' => 'x'];

        $this->assertSame(['seed2' => 99, 'other' => 'x'], $settings->getExtraSqlParams(99));
    }

    public function testParseInputAcceptsOnlyKnownSettings(): void
    {
        $piano = new Piano();
        $piano->parseInput($this->requestWithSettings(['mood' => 3, 'christmas' => 0, 'volume' => 11]));

        $this->assertSame(3, $piano->settings['mood']);
        $this->assertSame(0, $piano->settings['christmas']);
        $this->assertArrayNotHasKey('volume', $piano->settings);
    }

    public function testParseInputIgnoresNullValues(): void
    {
        $piano = new Piano();
        $piano->parseInput($this->requestWithSettings(['mood' => null]));

        $this->assertSame(0, $piano->settings['mood']);
    }

    public function testParseInputKeepsDefaultsForMissingOrInvalidJson(): void
    {
        $defaults = (new Piano())->settings;

        $missing = new Piano();
        $missing->parseInput(Request::create('/', 'GET'));
        $invalid = new Piano();
        $invalid->parseInput($this->requestWithSettings('{not json'));

        $this->assertSame($defaults, $missing->settings);
        $this->assertSame($defaults, $invalid->settings);
    }

    public function testParseInputStoresSelectedType(): void
    {
        $piano = new Piano();
        $piano->parseInput(Request::create('/', 'GET', ['selectedType' => 'playlist']));

        $this->assertSame('playlist', $piano->selectedType);
    }

    public function testMetalAddsYearRangeToQueryParams(): void
    {
        $metal = new Metal();
        $metal->settings['years'] = [1985, 1995];

        $params = $metal->getExtraSqlParams(1);

        $this->assertSame(1985, $params['year1']);
        $this->assertSame(1995, $params['year2']);
    }

    public function testMetalKeepsDefaultYearRangeWithoutTwoYears(): void
    {
        $metal = new Metal();
        $metal->settings['years'] = [1985];

        $params = $metal->getExtraSqlParams(1);

        $this->assertSame(1960, $params['year1']);
        $this->assertSame(date('Y'), $params['year2']);
    }
}
