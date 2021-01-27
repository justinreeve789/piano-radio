<?php

namespace App\Models;

use Madcoda\Youtube\Youtube;

class YouTube
{
    protected $client;

    function __construct() {
        $this->client = new YouTube(['key' => getenv('GOOGLE_API_KEY')]);
    }
}
