<?php

namespace Tests\Feature\Pages;

use Tests\TestCase;

/**
 * Old URLs that must keep permanently redirecting to the current ones.
 */
class RedirectsTest extends TestCase
{
    /**
     * @dataProvider redirects
     */
    public function testLegacyUrlsRedirectPermanently(string $from, string $to): void
    {
        $this->get($from)->assertStatus(301)->assertRedirect($to);
    }

    public function redirects(): array
    {
        return [
            'radio' => ['/radio', '/listen'],
            'artist radio by id' => ['/42/radio', '/42/listen'],
            'artist radio by name' => ['/Ludovico_Einaudi/radio', '/Ludovico_Einaudi/listen'],
            'artist page by id' => ['/artist/42', '/42'],
            'artist page by name' => ['/artist/Ludovico_Einaudi', '/Ludovico_Einaudi'],
        ];
    }
}
