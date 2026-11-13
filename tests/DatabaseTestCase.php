<?php

namespace Tests;

use Tests\Support\BuildsSchema;

/**
 * Base class for tests that need the database. Each test gets a fresh in-memory SQLite
 * database with the schema from BuildsSchema.
 */
abstract class DatabaseTestCase extends TestCase
{
    use BuildsSchema;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchema();
    }
}
