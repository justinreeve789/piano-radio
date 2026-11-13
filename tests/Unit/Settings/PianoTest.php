<?php

namespace Tests\Unit\Settings;

use App\Models\Settings\Piano;
use Tests\TestCase;

class PianoTest extends TestCase
{
    public function testDefaults(): void
    {
        $this->assertSame(
            ['christmas' => 1, 'classical' => 1, 'sacred' => 1, 'mood' => 0, 'style' => 0],
            (new Piano())->settings
        );
    }

    public function testTags(): void
    {
        $this->assertSame(['christmas', 'classical', 'sacred', 'solo', 'instrumental'], (new Piano())->getAllTags());
    }

    public function testConditionsCoverEveryConfigurableSetting(): void
    {
        $conditions = (new Piano())->getConditions();

        $this->assertSame(['gentle' => 1, 'natural' => 2, 'lively' => 3], $conditions['mood']);
        $this->assertSame(['solo' => 1, 'instrumental' => 2], $conditions['style']);
        foreach (['christmas', 'classical', 'sacred'] as $setting) {
            $this->assertSame(['false' => 0, 'true' => 2], $conditions[$setting], $setting);
            $this->assertTrue((new Piano())->hasSetting($setting), $setting);
        }
    }

    public function testMoodColumnComesFromGeneratedData(): void
    {
        $this->assertStringContainsString('tgd.float1 AS mood', (new Piano())->generateSqlColumns());
    }
}
