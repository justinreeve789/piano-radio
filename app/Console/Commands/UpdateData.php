<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdateData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'track:generated';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update generated track data.';

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
        $settings->updateGeneratedData();

        $endtime = microtime(true);

        echo '
Completed in ' . ($endtime - $starttime) . ' seconds.
';
    }
}
