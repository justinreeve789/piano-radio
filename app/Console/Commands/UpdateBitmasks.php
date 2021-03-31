<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdateBitmasks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'track:bitmasks';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update track tag bitmasks.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $starttime = microtime(true);

        $model = '\\App\\Models\\Settings\\' . getenv('APP_SETTINGS_MODEL');
        $settings = new $model();
        $settings->updateBitmasks();

        $endtime = microtime(true);

        echo '
Completed in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
