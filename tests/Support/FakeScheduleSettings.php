<?php

namespace App\Models\Settings;

use Illuminate\Http\Request;

/**
 * Test double for the site settings model used by TrackController::getTrackSchedule().
 *
 * The real models build a MySQL-only query (user variables, RAND(seed)). This one reads
 * pre-computed rows from a `fake_schedule` table so the controller's scheduling loop can be
 * tested on SQLite. It lives in the App\Models\Settings namespace because the controller
 * builds the class name from APP_SETTINGS_MODEL.
 */
class FakeScheduleSettings extends Settings
{
    public function generateSql(Request $request, $date = null)
    {
        return 'SELECT * FROM fake_schedule WHERE :seed1 IS NOT NULL ORDER BY secs_start';
    }
}
