# Tests

```
composer install
vendor/bin/phpunit                      # regular suite
vendor/bin/phpunit --group known-bugs   # tests that document current bugs (expected to fail)
```

## How the suite is set up

- **Database.** Tests run on in-memory SQLite (set in `phpunit.xml`). The real migrations
  are MySQL-only, so `tests/Support/BuildsSchema.php` recreates the tables by hand. If you
  change a migration, update that file too. Tests that need the database extend
  `Tests\DatabaseTestCase`.
- **Environment.** The app reads settings with `getenv()` / `$_ENV` directly, so
  `phpunit.xml` sets them as forced `<env>` values (site model `Piano`, `APP_URL=http://localhost`, and so on).
- **Schedule.** `TrackController::getTrackSchedule()` gets its rows from a MySQL-only query.
  `tests/Support/FakeScheduleSettings.php` swaps in a settings model that reads fixed rows
  from a `fake_schedule` table, and the clock (`getCurrentSecondsInDay()`) is mocked.
- **Assets.** Page tests call `withoutMix()` so they don't need built CSS or JS.

## Not covered

These need MySQL or outside services and have no tests:

- `Settings::generateSql()`, `updateGeneratedData()`, `updateBitmasks()` and `updateArtistTrackCounts()`
  (MySQL user variables, `RAND(seed)`, multi-table `UPDATE`)
- looking up artists by name on `/{name}` and `/{name}/listen` (`REGEXP_REPLACE`)
- `MusicData`, `YoutubeParse`, `Soundcloud` and the artisan commands (Spotify, YouTube and youtube-dl)

You could cover them later with a MySQL service in CI and the `@group mysql` annotation.
